import requests
from bs4 import BeautifulSoup
from collections import deque
from urllib.parse import urljoin
import json

from langdetect import detect 

# Set seed URLs and keywords
seed_urls = [
    "https://www.google.com/search?q=hallyu&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBgKqi21sC-tjyvGvq0HPlkOVtxNkg%3A1692328603589&ei=m-LeZJvLI6-A2roP3sejiAE&ved=0ahUKEwjbhIqqn-WAAxUvgFYBHd7jCBEQ4dUDCA0&uact=5&oq=hallyu&gs_lp=Egxnd3Mtd2l6LW5ld3MiBmhhbGx5dTIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEirHVDlBljfGnAEeACQAQGYAf4BoAGoC6oBBjAuMTEuMbgBA8gBAPgBAagCAMICCxAAGIAEGLEDGIMBwgIEEAAYA8ICCBAAGIAEGLEDwgIIEAAYigUYkQLCAgcQABiABBgKiAYB&sclient=gws-wiz-news",
    "https://www.google.com/search?q=korean+wave&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBic0jwmONmUIu0lf5sm4xr7dTXMLg%3A1692328618222&ei=quLeZIyHDaul2roPmeeA2Ag&ved=0ahUKEwiMhIexn-WAAxWrklYBHZkzAIsQ4dUDCA0&uact=5&oq=korean+wave&gs_lp=Egxnd3Mtd2l6LW5ld3MiC2tvcmVhbiB3YXZlMgUQABiABDIFEAAYgAQyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESPUMULMEWO4LcAF4AJABAJgBd6ABmAmqAQMyLjm4AQPIAQD4AQGoAgCIBgE&sclient=gws-wiz-news",
    "https://www.google.com/search?q=k-pop&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBgsC_77yOw8R70ZByovNpPsW9l_PQ%3A1692328635175&ei=u-LeZJufCrTd2roP0KWfsAw&ved=0ahUKEwjb6JG5n-WAAxW0rlYBHdDSB8YQ4dUDCA0&uact=5&oq=k-pop&gs_lp=Egxnd3Mtd2l6LW5ld3MiBWstcG9wMggQABiKBRiRAjIIEAAYigUYkQIyBxAAGIoFGEMyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgARI5yFQmwpYvh5wA3gAkAEAmAF8oAGRB6oBAzAuOLgBA8gBAPgBAagCAIgGAQ&sclient=gws-wiz-news",
    "https://www.google.com/search?q=%EC%BC%80%EC%9D%B4%ED%8C%9D&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBjn6CZ1IBsOosjSXvG2ab5JDgWtfQ%3A1692328658405&ei=0uLeZI6eGPe22roP9OOTyAI&ved=0ahUKEwiOz5vEn-WAAxV3m1YBHfTxBCkQ4dUDCA0&uact=5&oq=%EC%BC%80%EC%9D%B4%ED%8C%9D&gs_lp=Egxnd3Mtd2l6LW5ld3MiCey8gOydtO2MnTILEAAYgAQYsQMYgwEyCxAAGIAEGLEDGIMBMgsQABiABBixAxiDATIFEAAYgAQyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEiWnAFQ5oABWPSaAXAEeACQAQKYAcoBoAGiCKoBBTEuNy4xuAEDyAEA-AEBqAIAwgIIEAAYigUYkQLCAggQABiABBixA4gGAQ&sclient=gws-wiz-news",
    "https://www.google.com/search?q=korean+entertainment&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBjFHL2wwksEtS-HmBF2MGIMo60ogw%3A1692328679740&ei=5-LeZMjULKDh2roPk8Sz6AQ&oq=korean+enter&gs_lp=Egxnd3Mtd2l6LW5ld3MiDGtvcmVhbiBlbnRlcioCCAAyCBAAGIoFGJECMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESNB0UI82WKlucAV4AJABAJgB-gGgAYgOqgEGMi4xMi4xuAEDyAEA-AEBqAIAwgILEAAYgAQYsQMYgwHCAgQQABgDwgIIEAAYgAQYsQOIBgE&sclient=gws-wiz-news",
    "https://www.google.com/search?q=k-drama&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBjzfOzNVnk5Yq08CxJM5VIKLGaxtA%3A1692328707149&ei=A-PeZJrZCODK2roPy9Cf8AY&ved=0ahUKEwja5rrbn-WAAxVgpVYBHUvoB24Q4dUDCA0&uact=5&oq=k-drama&gs_lp=Egxnd3Mtd2l6LW5ld3MiB2stZHJhbWEyBRAAGIAEMgUQABiABDIFEAAYgAQyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIHEAAYigUYQ0iYElD1BFjqEXABeACQAQCYAXegAZwFqgEDMC42uAEDyAEA-AEBqAIAwgIIEAAYigUYkQKIBgE&sclient=gws-wiz-news",
    
]
keywords = ["Korean entertainment", "K-pop", "Hallyu", "korean wave", "한류", "케이팝", "YG", "JYP", "SM", "K-drama", "Korea file", "korean movie", "k-series"]

# Function to filter relevant links
def is_relevant(url, text):
    text = text.lower()
    keyword_count = sum([1 for kw in keywords if kw.lower() in text])
    return keyword_count > 0

# Function to score a URL based on keyword matches
def score_url(text):
    text = text.lower()
    keyword_count = sum([1 for kw in keywords if kw.lower() in text])
    return keyword_count / len(keywords)

# Web crawling loop
visited = []
queue = deque([{"url": url, "title": "seed"} for url in seed_urls])

count = 1
while queue and count <= 10:
    current = queue.popleft()

    url = current["url"]
    title = current["title"]

    if any(item['url'] == url for item in visited):
        continue

    try:
        response = requests.get(url, timeout=3)  # 3 seconds timeout
    except requests.RequestException as e:
        print(f"Error downloading {url}: {e}")
        continue

    visited.append({"url": url, "title": title})

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        links = soup.find_all("a")

        for link in links:
            href = link.get("href")
            if href and not href.startswith("javascript:") and not href.startswith("#"):
                absolute_url = urljoin(url, href)
                link_text = link.text or "untitled"
                if absolute_url not in [item['url'] for item in visited] and is_relevant(absolute_url, link_text):
                    queue.append({"url": absolute_url, "title": link_text})

        print(f"Downloaded {url} with title {title}")
        count += 1

with open("url_lists.json", "w", encoding="utf-8") as file:
    json.dump(visited, file)

print("Web crawling complete.")