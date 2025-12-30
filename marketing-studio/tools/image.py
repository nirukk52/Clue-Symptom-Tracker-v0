"""
Image generation tool using Google Imagen 3.
Why it exists: Creates ad creatives for marketing campaigns
using AI image generation with brand-appropriate styling.
"""
import os
import base64
from typing import Dict, Any
from functools import lru_cache

from langchain_core.tools import tool
from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def _get_client():
    """
    Lazy initialization of the Genai client.
    Why it exists: Avoids import-time errors if API key isn't set.
    """
    from google import genai
    return genai.Client()


@tool
def generate_image(prompt: str, style: str = "modern") -> Dict[str, Any]:
    """
    Generate an ad image using Google Imagen 3 for marketing campaigns.

    Args:
        prompt: Description of what the image should show (e.g., "chronic fatigue tracking app")
        style: Visual style - 'modern' (clean/minimal), 'emotional' (warm/empathetic),
               'community' (togetherness), or 'data' (infographic aesthetic)

    Returns:
        Dict with image_base64 (save as PNG), status, and metadata.
        On success: {"status": "success", "image_base64": "...", "instructions": "..."}
        On error: {"status": "error", "error": "..."}
    """
    # Style modifiers for chronic illness marketing
    style_modifiers = {
        "modern": "Clean, minimal design with soft warm colors. Professional but approachable. No text overlays.",
        "emotional": "Warm, empathetic imagery. Soft lighting, human connection. Supportive and hopeful tone.",
        "community": "Diverse people supporting each other. Togetherness, understanding. Inclusive representation.",
        "data": "Clean infographic aesthetic. Soft data visualization. Approachable health tracking theme."
    }

    # Brand colors from knowledge/brand/guidelines.md
    brand_context = """
    Brand Colors:
    - Primary (Dark Navy): #20132E
    - Background (Warm Cream): #FDFBF9
    - Accent Peach: #E8974F
    - Accent Blue: #A4C8D8
    - Accent Purple: #D0BDF4
    """

    enhanced_prompt = f"""Create a Reddit ad image (1200x628 aspect ratio) for a chronic illness symptom tracker app called "Chronic Life".

Theme: {prompt}
Style: {style_modifiers.get(style, style_modifiers['modern'])}

{brand_context}

Important:
- No text in the image (text will be added separately)
- Warm, supportive aesthetic (not clinical)
- Suitable for chronic illness communities (endometriosis, PCOS, fibromyalgia, long COVID)
- Avoid toxic positivity imagery
- No medical imagery (hospitals, pills, stethoscopes)
- Premium, fintech-like clarity
"""

    # Check API key first
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your_google_api_key_here":
        return {
            "status": "error",
            "error": "GOOGLE_API_KEY not configured. Please set it in your .env file.",
            "prompt_used": prompt,
            "hint": "Get your API key from https://aistudio.google.com/app/apikey"
        }

    try:
        from google.genai import types

        client = _get_client()

        response = client.models.generate_images(
            model="imagen-3.0-generate-002",
            prompt=enhanced_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="16:9",
                safety_filter_level="BLOCK_MEDIUM_AND_ABOVE",
            )
        )

        if response.generated_images:
            image = response.generated_images[0]
            image_base64 = base64.b64encode(image.image.image_bytes).decode('utf-8')

            return {
                "status": "success",
                "prompt_used": prompt,
                "style": style,
                "image_base64": image_base64,
                "mime_type": "image/png",
                "recommended_size": "1200x628 for Reddit ads",
                "instructions": "Save the base64 data as a PNG file. Use: import base64; open('ad.png', 'wb').write(base64.b64decode(image_base64))"
            }
        else:
            return {
                "status": "error",
                "error": "No image generated - may have been filtered for safety or API quota exceeded",
                "prompt_used": prompt,
                "hint": "Check if Imagen API is enabled for your API key at https://console.cloud.google.com/apis/library"
            }

    except ImportError as e:
        return {
            "status": "error",
            "error": f"Missing dependency: {str(e)}",
            "prompt_used": prompt,
            "hint": "Run: pip install google-genai>=0.3.0"
        }
    except Exception as e:
        error_str = str(e)
        error_type = type(e).__name__

        # Provide more specific error messages
        if "API key" in error_str or "authentication" in error_str.lower():
            error_msg = "API key authentication failed. Please verify your GOOGLE_API_KEY is correct."
        elif "quota" in error_str.lower() or "limit" in error_str.lower():
            error_msg = "API quota exceeded. Please check your Google Cloud quota limits."
        elif "permission" in error_str.lower() or "not enabled" in error_str.lower():
            error_msg = "Imagen API not enabled. Enable it at https://console.cloud.google.com/apis/library"
        else:
            error_msg = f"Image generation failed: {error_type}: {error_str}"

        return {
            "status": "error",
            "error": error_msg,
            "prompt_used": prompt,
            "error_details": error_str,
            "hint": "Ensure GOOGLE_API_KEY is set correctly and Imagen API is enabled for your project."
        }
