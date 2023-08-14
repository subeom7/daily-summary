# import requests
# from bs4 import BeautifulSoup

# def get_articles():
#     headers = {
#         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
#     }

#     url = "https://www.google.com/search?q=k-pop+OR+hallyu+OR+korean+wave+OR+korean+entertainment&source=lnms&tbm=nws"
#     response = requests.get(url, headers=headers)   
#     print(response.status_code)
#     print(response.text[:1000])  # print the first 1000 characters of the response

#     if response.status_code != 200:
#         print("Failed to retrieve the web page.")
#         return []

#     soup = BeautifulSoup(response.text, 'html.parser')
#     articles = []

#     for node in soup.select('.tF2Cxc')[:10]:  # limit to first 10
#         title = node.select_one('h3').text
#         link = node.select_one('.yuRUbf a')['href']
#         snippet = node.select_one('.Y3v8qd').text
#         articles.append({
#             "title": title,
#             "link": link,
#             "snippet": snippet
#         })

#     return articles

# if __name__ == "__main__":
#     articles = get_articles()
#     for article in articles:
#         print(article)
