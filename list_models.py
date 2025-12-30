import os
import sys
from dotenv import load_dotenv
from google import genai

load_dotenv('marketing/.env')
api_key = os.getenv('GOOGLE_API_KEY')
client = genai.Client(api_key=api_key)

print("Listing available models...")
try:
    for m in client.models.list(config={"page_size": 100}):
        if "gemini" in m.name and "flash" in m.name:
            print(f"- {m.name} ({m.display_name})")
except Exception as e:
    print(f"Error listing models: {e}")

