import requests
from bs4 import BeautifulSoup

def analyze_seo(url: str):
    """
    Analyzes the SEO of a given URL by checking meta tags and title.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = soup.title.string if soup.title else "No title found"
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc['content'] if meta_desc else "No description found"
        
        h1s = [h1.get_text(strip=True) for h1 in soup.find_all('h1')]
        
        return {
            "url": url,
            "title": title,
            "description": description,
            "h1_tags": h1s,
            "status_code": response.status_code
        }
    except Exception as e:
        return {"error": str(e)}

