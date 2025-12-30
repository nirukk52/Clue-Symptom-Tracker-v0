import os
import sys
from dotenv import load_dotenv
from google import genai

# Load env from marketing/.env
env_path = 'marketing/.env'
print(f"Loading .env from {env_path}")
load_dotenv(env_path)

api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    print("ERROR: GOOGLE_API_KEY not found in environment or .env file.")
    print("Please run: echo 'GOOGLE_API_KEY=your_key_here' > marketing/.env")
    sys.exit(1)

print(f"Found API key: {api_key[:5]}...{api_key[-5:]}")

try:
    print("Testing Gemini 1.5 Flash...")
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents="Hello, are you working?"
    )
    print("SUCCESS! Response received:")
    print(response.text)
except Exception as e:
    print("\nFAILED. Error details:")
    print(str(e))

