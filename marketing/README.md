# Clue Marketing Agent

Marketing agent for Clue Symptom Tracker using **Google ADK** with built-in development UI.

## Features

- **Built-in Dev UI**: Chat interface with image upload, session persistence, and debugging
- **Tools**:
  - `analyze_seo`: Website SEO analysis
  - `generate_reddit_image`: **Actually generates images** using Imagen 3
  - `get_ad_performance`: Ad metrics for Reddit/Twitter
  - `analyze_marketing_copy`: Copy analysis for chronic illness audience
  - `get_reddit_community_insights`: Subreddit engagement tips
  - `google_search`: Web search

## Setup

1. Get your Google API key from [AI Studio](https://aistudio.google.com/apikey)

2. Create a `.env` file in the `marketing/` folder:

```bash
echo "GOOGLE_API_KEY=your_key_here" > marketing/.env
```

3. Install dependencies:

```bash
pip install -r marketing/requirements.txt
```

4. Run the ADK dev UI **from the project root** (not from inside marketing/):

```bash
# IMPORTANT: Run from project root, not from inside marketing/
cd /path/to/Clue-Symptom-Tracker-v0
adk web
```

5. Open http://localhost:8000 in your browser and select the `marketing` agent

## Image Generation

The agent can now **actually generate images** for Reddit ads using Google Imagen 3.

Example prompts:

- "Generate a Reddit ad image for chronic fatigue tracking"
- "Create an emotional style image for endometriosis awareness"
- "Make a community-focused image for fibromyalgia support"

Styles available: `modern`, `emotional`, `community`, `data`

The generated image is returned as base64 - save it as a PNG file to use in your campaigns.

## Agent Capabilities

- **Spoonie-Friendly Marketing**: Low-energy audience content
- **Community Marketing**: Reddit, Twitter, support groups
- **SEO & Content**: Health-related search optimization
- **Ad Performance**: Campaign analysis and optimization
- **Image Generation**: Create actual ad images with Imagen 3
