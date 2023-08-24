import os
import re
import requests
from bs4 import BeautifulSoup
from collections import deque
from urllib.parse import urljoin
import zipfile
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
keywords = ["Korean entertainment", "K-pop", "Hallyu", "korean wave", "한류", "케이팝", "YG", "JYP", "SM", "K-drama", "Korea file", "korean movie"]

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
visited = set()
queue = deque([(url, 1) for url in seed_urls])
# output_folder = "collected_webpages"

# if not os.path.exists(output_folder):
#     os.mkdir(output_folder)

count = 1
while queue and count <= 20:
    url, _ = queue.popleft()

    if url in visited:
        continue

    try:
        response = requests.get(url)
    except requests.RequestException as e:
        print(f"Error downloading {url}: {e}")
        continue

    visited.add(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        links = soup.find_all("a")

        for link in links:
            href = link.get("href")
            if href and not href.startswith("javascript:") and not href.startswith("#"):
                absolute_url = urljoin(url, href)
                if absolute_url not in visited:
                    if is_relevant(absolute_url, link.text):
                        queue.append((absolute_url, score_url(link.text)))

        # file_path = os.path.join(output_folder, f"Hallyu_{count:01}.html")
        # with open(file_path, "w", encoding="utf-8") as file:
        #     file.write(response.text)

        # print(f"Downloaded {url} as {file_path}")
        print(f"Downloaded {url}")

        count += 1

# Save the list of visited URLs
# with open("url_lists.txt", "w", encoding="utf-8") as file:
#     for url in visited:
#         file.write(url + "\n")

with open("url_lists.json", "w", encoding="utf-8") as file:
    json.dump(list(visited), file)

print("Web crawling complete.")
print(json.dumps(list(visited)))

# def zipdir(path, ziph):
#     for root, dirs, files in os.walk(path):
#         for file in files:
#             ziph.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), path))

# with zipfile.ZipFile('webpages.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
#     zipdir('collected_webpages', zipf)
#     zipf.write('url_lists.txt')
