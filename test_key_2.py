import os
import sys
from dotenv import load_dotenv
from google import genai

load_dotenv('marketing/.env')
api_key = os.getenv('GOOGLE_API_KEY')
client = genai.Client(api_key=api_key)

try:
    print("Testing Gemini 2.0 Flash...")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Hello!"
    )
    print("SUCCESS! Response received:")
    print(response.text)
except Exception as e:
    print("\nFAILED. Error details:")
    print(str(e))

