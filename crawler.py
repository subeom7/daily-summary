import os
import re
import requests
from bs4 import BeautifulSoup
from collections import deque
from urllib.parse import urljoin
import zipfile

# Set seed URLs and keywords
seed_urls = [
    "https://www.google.com/search?sca_esv=557654684&sxsrf=AB5stBj5VHazSwMlDsOFwe1WNrVHW35bfQ:1692235901197&q=hallyu&tbm=nws&source=lnms&sa=X&sqi=2&ved=2ahUKEwjwiJH-xeKAAxWPa_UHHVaHDOgQ0pQJegQIDRAB&biw=2752&bih=1035&dpr=1.25",
]
keywords = ["Korean entertainment", "K-pop", "Hallyu"]

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
output_folder = "collected_webpages"

if not os.path.exists(output_folder):
    os.mkdir(output_folder)

count = 1
while queue and count <= 10:
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

        file_path = os.path.join(output_folder, f"Hallyu_{count:01}.html")
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(response.text)

        print(f"Downloaded {url} as {file_path}")

        count += 1

# Save the list of visited URLs
with open("url_lists.txt", "w", encoding="utf-8") as file:
    for url in visited:
        file.write(url + "\n")

print("Web crawling complete.")

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), path))

with zipfile.ZipFile('webpages.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('collected_webpages', zipf)
    zipf.write('url_lists.txt')
