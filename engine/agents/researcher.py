import requests
from bs4 import BeautifulSoup
from config import TAVILY_API_KEY

def tavily_search(query):
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "max_results": 5
    }

    res = requests.post(url, json=payload)
    return res.json().get("results", [])


def extract_content(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")

        paragraphs = [p.get_text() for p in soup.find_all("p")]
        return " ".join(paragraphs[:10])
    except:
        return ""