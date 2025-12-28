import os
import base64
from google import genai
from google.genai import types

# Initialize the Genai client (uses GOOGLE_API_KEY env var)
_client = None

def _get_client():
    """
    Lazy initialization of the Genai client.
    Avoids import-time errors if API key isn't set.
    """
    global _client
    if _client is None:
        _client = genai.Client()
    return _client


def generate_reddit_image(prompt: str, style: str = "modern") -> dict:
    """
    Generates an actual image for Reddit ads using Google Imagen 3.
    Returns base64 image data and metadata.
    
    Args:
        prompt: Description of the image to generate
        style: Visual style - 'modern', 'emotional', 'community', 'data'
    """
    # Enhance prompt for chronic illness marketing context
    style_modifiers = {
        "modern": "Clean, minimal design with soft warm colors. Professional but approachable. No text overlays.",
        "emotional": "Warm, empathetic imagery. Soft lighting, human connection. Supportive and hopeful tone.",
        "community": "Diverse people supporting each other. Togetherness, understanding. Inclusive representation.",
        "data": "Clean infographic aesthetic. Soft data visualization. Approachable health tracking theme."
    }
    
    enhanced_prompt = f"""Create a Reddit ad image (1200x628 aspect ratio) for a chronic illness symptom tracker app.
    
Theme: {prompt}
Style: {style_modifiers.get(style, style_modifiers['modern'])}

Important: 
- No text in the image
- Warm, supportive aesthetic (not clinical)
- Suitable for chronic illness communities (endometriosis, PCOS, fibromyalgia, long COVID)
- Avoid toxic positivity imagery
"""
    
    try:
        client = _get_client()
        
        # Generate image using Imagen 3
        response = client.models.generate_images(
            model="imagen-3.0-generate-002",
            prompt=enhanced_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="16:9",  # Good for Reddit ads
                safety_filter_level="BLOCK_MEDIUM_AND_ABOVE",
            )
        )
        
        if response.generated_images:
            image = response.generated_images[0]
            # Convert to base64 for easy transport
            image_base64 = base64.b64encode(image.image.image_bytes).decode('utf-8')
            
            return {
                "status": "success",
                "prompt_used": enhanced_prompt,
                "style": style,
                "image_base64": image_base64,
                "mime_type": "image/png",
                "recommended_size": "1200x628 for Reddit ads",
                "platform": "reddit",
                "instructions": "Save the base64 data as a PNG file to use in your ad campaign."
            }
        else:
            return {
                "status": "error",
                "error": "No image generated - may have been filtered for safety",
                "prompt_used": enhanced_prompt
            }
            
    except Exception as e:
        return {
            "status": "error", 
            "error": str(e),
            "prompt_used": prompt,
            "hint": "Ensure GOOGLE_API_KEY is set and has Imagen API access enabled."
        }

