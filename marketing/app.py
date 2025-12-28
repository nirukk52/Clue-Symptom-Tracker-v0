"""
Clue Marketing Agent - Streamlit App with RAG Memory
Uses OpenAI SDK (works with OpenAI, Gemini, or any OpenAI-compatible API).
"""
import streamlit as st
import os
import random
import requests
import sqlite3
import json
from bs4 import BeautifulSoup
from openai import OpenAI

# ============== DATABASE ==============
DB_PATH = os.path.join(os.path.dirname(__file__), "memory.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_message(role: str, content: str):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO messages (role, content) VALUES (?, ?)", (role, content))
    conn.commit()
    conn.close()

def get_recent_messages(limit: int = 10) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute("SELECT role, content FROM messages ORDER BY created_at DESC LIMIT ?", (limit,))
    messages = cursor.fetchall()
    conn.close()
    return list(reversed(messages))

def get_all_messages():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute("SELECT role, content, created_at FROM messages ORDER BY created_at DESC")
    messages = cursor.fetchall()
    conn.close()
    return messages

# ============== TOOLS ==============
def analyze_seo(url: str) -> str:
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string if soup.title else "No title"
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        h1s = [h1.get_text(strip=True) for h1 in soup.find_all('h1')]
        return f"URL: {url}\nTitle: {title}\nDescription: {meta_desc['content'] if meta_desc else 'None'}\nH1 Tags: {h1s}"
    except Exception as e:
        return f"Error: {e}"

def generate_reddit_image(prompt: str) -> str:
    return f"Generated image for: '{prompt}'\nURL: https://via.placeholder.com/1024x1024.png?text=Reddit+Ad"

def get_ad_performance(platform: str) -> str:
    data = [{"ad": f"{platform}_{i}", "impr": random.randint(1000, 50000), "clicks": random.randint(50, 2000)} for i in range(3)]
    return f"Ad Performance for {platform}:\n" + "\n".join([f"  {d['ad']}: {d['impr']} impressions, {d['clicks']} clicks" for d in data])

TOOLS = [
    {"type": "function", "function": {"name": "analyze_seo", "description": "Analyze SEO of a website URL", "parameters": {"type": "object", "properties": {"url": {"type": "string", "description": "The URL to analyze"}}, "required": ["url"]}}},
    {"type": "function", "function": {"name": "generate_reddit_image", "description": "Generate an image for Reddit ads", "parameters": {"type": "object", "properties": {"prompt": {"type": "string", "description": "Image prompt"}}, "required": ["prompt"]}}},
    {"type": "function", "function": {"name": "get_ad_performance", "description": "Get ad performance for reddit or twitter", "parameters": {"type": "object", "properties": {"platform": {"type": "string", "enum": ["reddit", "twitter"]}}, "required": ["platform"]}}},
]

def call_tool(name: str, args: dict) -> str:
    if name == "analyze_seo":
        return analyze_seo(args["url"])
    elif name == "generate_reddit_image":
        return generate_reddit_image(args["prompt"])
    elif name == "get_ad_performance":
        return get_ad_performance(args["platform"])
    return "Unknown tool"

# ============== UI ==============
st.set_page_config(page_title="Clue Marketing Agent", page_icon="🍌", layout="wide")
init_db()

with st.sidebar:
    st.header("⚙️ Settings")
    api_key = st.text_input("OpenAI API Key", type="password", value=os.getenv("OPENAI_API_KEY", ""))
    model = st.selectbox("Model", ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"], index=0)
    
    st.divider()
    st.header("📚 Memory")
    if st.button("View Memories"):
        st.session_state.show_memory = True
    if st.button("Clear Memory"):
        conn = sqlite3.connect(DB_PATH)
        conn.execute("DELETE FROM messages")
        conn.commit()
        conn.close()
        st.success("Cleared!")

st.title("🍌 Clue Marketing Agent")
st.caption("With RAG Memory • Tools: SEO, Reddit Ads, Analytics")

if st.session_state.get("show_memory"):
    with st.expander("📚 Saved Messages", expanded=True):
        for role, content, ts in get_all_messages()[:15]:
            st.text(f"[{ts}] {role}: {content[:80]}...")
        if st.button("Close"):
            st.session_state.show_memory = False

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

SYSTEM = """You are a marketing expert for Clue, a symptom tracker for chronic illness patients.
Be empathetic, focus on "Spoonie" friendly marketing. Use tools when helpful."""

if prompt := st.chat_input("Ask the marketing agent..."):
    if not api_key:
        st.error("Enter API key!")
    else:
        save_message("user", prompt)
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                try:
                    client = OpenAI(api_key=api_key)
                    
                    # Build messages with RAG context
                    history = get_recent_messages(10)
                    msgs = [{"role": "system", "content": SYSTEM}]
                    for role, content in history:
                        msgs.append({"role": role, "content": content})
                    msgs.append({"role": "user", "content": prompt})
                    
                    response = client.chat.completions.create(model=model, messages=msgs, tools=TOOLS, tool_choice="auto")
                    
                    # Handle tool calls
                    msg = response.choices[0].message
                    if msg.tool_calls:
                        tool_results = []
                        for tc in msg.tool_calls:
                            args = json.loads(tc.function.arguments)
                            result = call_tool(tc.function.name, args)
                            tool_results.append(f"**{tc.function.name}**:\n```\n{result}\n```")
                            msgs.append({"role": "assistant", "content": None, "tool_calls": [{"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}]})
                            msgs.append({"role": "tool", "tool_call_id": tc.id, "content": result})
                        
                        response = client.chat.completions.create(model=model, messages=msgs)
                        final_text = response.choices[0].message.content
                    else:
                        final_text = msg.content
                    
                    save_message("assistant", final_text)
                    st.markdown(final_text)
                    st.session_state.messages.append({"role": "assistant", "content": final_text})
                except Exception as e:
                    st.error(f"Error: {e}")
