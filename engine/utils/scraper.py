"""Web scraping utilities for content extraction"""

import requests
from bs4 import BeautifulSoup
from typing import Optional, List, Dict
import logging

logger = logging.getLogger(__name__)

# Default headers to avoid being blocked
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def scrape_url(url: str, timeout: int = 10) -> Optional[str]:
    """Scrape text content from a URL with error handling"""
    try:
        response = requests.get(url, headers=DEFAULT_HEADERS, timeout=timeout)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        logger.warning(f"Failed to scrape {url}: {e}")
        return None


def extract_text_from_html(html: str, max_paragraphs: int = 20) -> str:
    """Extract clean text from HTML content"""
    try:
        soup = BeautifulSoup(html, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extract paragraphs
        paragraphs = [p.get_text(strip=True) for p in soup.find_all("p")]
        
        # Filter empty paragraphs
        paragraphs = [p for p in paragraphs if len(p.strip()) > 20]
        
        # Limit to max paragraphs
        paragraphs = paragraphs[:max_paragraphs]
        
        return " ".join(paragraphs)
    except Exception as e:
        logger.error(f"Error extracting text from HTML: {e}")
        return ""


def extract_headings_from_html(html: str) -> List[str]:
    """Extract all headings from HTML"""
    try:
        soup = BeautifulSoup(html, "html.parser")
        headings = []
        
        for tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            for heading in soup.find_all(tag):
                text = heading.get_text(strip=True)
                if text:
                    headings.append(text)
        
        return headings
    except Exception as e:
        logger.error(f"Error extracting headings: {e}")
        return []


def extract_images_from_html(html: str) -> List[Dict[str, str]]:
    """Extract all images from HTML"""
    try:
        soup = BeautifulSoup(html, "html.parser")
        images = []
        
        for img in soup.find_all("img"):
            image_data = {
                "src": img.get("src", ""),
                "alt": img.get("alt", ""),
                "title": img.get("title", "")
            }
            if image_data["src"]:
                images.append(image_data)
        
        return images
    except Exception as e:
        logger.error(f"Error extracting images: {e}")
        return []


def extract_links_from_html(html: str) -> List[Dict[str, str]]:
    """Extract all links from HTML"""
    try:
        soup = BeautifulSoup(html, "html.parser")
        links = []
        
        for link in soup.find_all("a", href=True):
            link_data = {
                "url": link["href"],
                "text": link.get_text(strip=True)
            }
            if link_data["url"] and link_data["text"]:
                links.append(link_data)
        
        return links[:20]  # Limit to first 20 links
    except Exception as e:
        logger.error(f"Error extracting links: {e}")
        return []


def extract_code_blocks_from_html(html: str) -> List[str]:
    """Extract code blocks from HTML"""
    try:
        soup = BeautifulSoup(html, "html.parser")
        code_blocks = []
        
        for code in soup.find_all(["code", "pre"]):
            text = code.get_text(strip=True)
            if text:
                code_blocks.append(text)
        
        return code_blocks
    except Exception as e:
        logger.error(f"Error extracting code blocks: {e}")
        return []


def fetch_and_parse(url: str, timeout: int = 10) -> Dict:
    """Fetch a URL and extract various content types"""
    html = scrape_url(url, timeout)
    
    if not html:
        return {
            "url": url,
            "success": False,
            "text": "",
            "headings": [],
            "images": [],
            "code_blocks": []
        }
    
    return {
        "url": url,
        "success": True,
        "text": extract_text_from_html(html),
        "headings": extract_headings_from_html(html),
        "images": extract_images_from_html(html),
        "code_blocks": extract_code_blocks_from_html(html)
    }
