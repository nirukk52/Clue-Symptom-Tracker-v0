"""
Copy analysis and UTM generation tools.
Why it exists: Provides utilities for analyzing marketing copy
and generating trackable URLs following UTM conventions.
"""
from typing import Dict, Any, List

from langchain_core.tools import tool


# Words that resonate with Spoonie audience
EMPATHY_WORDS = [
    "understand", "support", "help", "together", "journey", "manage",
    "ease", "gentle", "care", "respect", "energy", "rest", "pace"
]

# Action words for CTAs
ACTION_WORDS = [
    "try", "start", "discover", "join", "get", "begin", "track",
    "check", "see", "find", "learn", "explore"
]

# Words to avoid (toxic positivity, generic health app speak)
AVOID_WORDS = [
    "just", "simply", "easy", "quick fix", "cure", "heal",
    "control", "manage your health", "take charge", "positive",
    "comprehensive", "all-in-one", "platform"
]


@tool
def analyze_copy(copy_text: str) -> Dict[str, Any]:
    """
    Analyze marketing copy for Spoonie-friendliness and effectiveness.

    Args:
        copy_text: The marketing copy to analyze (headline, body, or CTA)

    Returns:
        Analysis with score (0-100), feedback, and specific suggestions.
        Score 70+ is considered Spoonie-friendly.
    """
    copy_lower = copy_text.lower()
    word_count = len(copy_text.split())

    score = 50  # Base score
    feedback: List[str] = []
    suggestions: List[str] = []

    # Check for empathy words
    empathy_found = [w for w in EMPATHY_WORDS if w in copy_lower]
    if empathy_found:
        score += min(20, len(empathy_found) * 5)
        feedback.append(f"✅ Good empathetic language: {', '.join(empathy_found[:3])}")
    else:
        feedback.append("⚠️ Missing empathetic language")
        suggestions.append("Add words like 'understand', 'support', or 'gentle'")

    # Check for action words
    action_found = [w for w in ACTION_WORDS if w in copy_lower]
    if action_found:
        score += 15
        feedback.append(f"✅ Clear call-to-action: {', '.join(action_found[:2])}")
    else:
        feedback.append("⚠️ No clear call-to-action")
        suggestions.append("Add action verbs like 'start', 'try', or 'discover'")

    # Check for words to avoid
    avoid_found = [w for w in AVOID_WORDS if w in copy_lower]
    if avoid_found:
        score -= len(avoid_found) * 10
        feedback.append(f"❌ Avoid these words: {', '.join(avoid_found)}")
        suggestions.append("Replace generic health-app speak with specific benefits")

    # Check length (Spoonies have limited energy for reading)
    if word_count <= 15:
        score += 15
        feedback.append("✅ Concise - good for low-energy readers")
    elif word_count <= 30:
        score += 5
        feedback.append("⚠️ Moderate length - consider shortening")
    else:
        score -= 10
        feedback.append("❌ Too long for Spoonie audience")
        suggestions.append("Aim for under 15 words for headlines, under 30 for body")

    # Check for specificity (numbers are good)
    if any(char.isdigit() for char in copy_text):
        score += 10
        feedback.append("✅ Specific with numbers")
    else:
        suggestions.append("Add specificity: '20 seconds', '30-second', etc.")

    # Clamp score
    score = max(0, min(100, score))

    return {
        "status": "success",
        "copy": copy_text,
        "score": score,
        "spoonie_friendly": score >= 70,
        "word_count": word_count,
        "feedback": feedback,
        "suggestions": suggestions,
        "verdict": (
            "Excellent! Ready to use." if score >= 80
            else "Good, minor tweaks suggested." if score >= 70
            else "Needs revision for Spoonie audience." if score >= 50
            else "Significant revision needed."
        )
    }


@tool
def generate_utm_url(
    condition: str,
    angle: str,
    source: str = "reddit",
    medium: str = "cpc",
    content_format: str = "image",
    version: int = 1
) -> Dict[str, Any]:
    """
    Generate a UTM-tagged URL following Chronic Life conventions.

    Args:
        condition: Target condition (endo, pcos, longcovid, fibro, chronic)
        angle: Pain point angle (pain, fatigue, tracking, doctor, flare)
        source: Traffic source (reddit, facebook, instagram, google, email)
        medium: Medium type (cpc for paid, social for organic)
        content_format: Ad format (image, text, video, carousel, testimonial)
        version: Content version number

    Returns:
        Full UTM URL and breakdown of parameters.
    """
    base_url = "https://chronic-life-landing.vercel.app"

    # Normalize inputs
    condition = condition.lower().strip()
    angle = angle.lower().strip()
    source = source.lower().strip()
    medium = medium.lower().strip()
    content_format = content_format.lower().strip()

    # Build campaign name
    campaign = f"{condition}_{angle}"
    content = f"{content_format}_v{version}"

    # Build URL
    url = (
        f"{base_url}?"
        f"utm_source={source}&"
        f"utm_medium={medium}&"
        f"utm_campaign={campaign}&"
        f"utm_content={content}"
    )

    return {
        "status": "success",
        "url": url,
        "parameters": {
            "utm_source": source,
            "utm_medium": medium,
            "utm_campaign": campaign,
            "utm_content": content,
        },
        "tracking_info": {
            "condition": condition,
            "angle": angle,
            "format": content_format,
            "version": version,
        }
    }
