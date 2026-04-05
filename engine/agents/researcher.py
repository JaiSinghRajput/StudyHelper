import logging
import requests
from config import TAVILY_API_KEY
from utils.scraper import fetch_and_parse

logger = logging.getLogger(__name__)

def tavily_search(query: str, max_results: int = 5) -> list:
    """Search using Tavily API with error handling"""
    if not query or not query.strip():
        logger.error("Query cannot be empty")
        return []
    
    if not TAVILY_API_KEY:
        logger.error("TAVILY_API_KEY not set")
        return []
    
    try:
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": query,
            "search_depth": "advanced",
            "max_results": max_results,
            "include_answer": True
        }
        
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        
        results = response.json().get("results", [])
        logger.info(f"Tavily search returned {len(results)} results for: {query}")
        return results
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Tavily API request failed: {e}")
        return []
    except Exception as e:
        logger.error(f"Error during Tavily search: {e}")
        return []


def extract_content(url: str, max_paragraphs: int = 10) -> str:
    """Extract and clean content from a URL"""
    if not url or not url.strip():
        logger.warning("URL cannot be empty")
        return ""
    
    try:
        parsed = fetch_and_parse(url, timeout=10)
        
        if not parsed["success"]:
            logger.warning(f"Failed to parse content from {url}")
            return ""
        
        text = parsed["text"][:2000]  # Limit to first 2000 chars
        
        logger.info(f"Extracted {len(text)} characters from {url}")
        return text
    
    except Exception as e:
        logger.error(f"Error extracting content from {url}: {e}")
        return ""


def search_and_extract(query: str, max_results: int = 5) -> list:
    """Search and extract content from multiple sources"""
    try:
        search_results = tavily_search(query, max_results)
        
        extracted_data = []
        for result in search_results:
            url = result.get("url", "")
            content = extract_content(url)
            
            if content:
                extracted_data.append({
                    "title": result.get("title", ""),
                    "url": url,
                    "snippet": result.get("snippet", ""),
                    "content": content
                })
        
        logger.info(f"Successfully extracted content from {len(extracted_data)} sources")
        return extracted_data
    
    except Exception as e:
        logger.error(f"Error in search_and_extract: {e}")
        return []
