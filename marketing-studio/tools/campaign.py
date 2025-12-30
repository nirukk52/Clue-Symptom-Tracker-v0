"""
Campaign creation tool.
Why it exists: Generates structured marketing campaign artifacts
based on target condition, pain point angle, and user intent.
"""
import random
from typing import Dict, Any, List
from datetime import datetime

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class CampaignArtifact(BaseModel):
    """
    Structured campaign brief output.
    Why it exists: Ensures consistent campaign documentation
    that can be logged to knowledge/campaigns/.
    """
    campaign_id: str = Field(..., description="Unique campaign identifier")
    campaign_name: str = Field(..., description="Human-readable name")
    condition: str = Field(..., description="Target condition (endo, pcos, etc.)")
    angle: str = Field(..., description="Pain point angle (pain, fatigue, etc.)")

    target_audience: str = Field(..., description="Who this targets")
    tone: str = Field(..., description="Messaging tone")

    hero_headline: str = Field(..., description="Main headline")
    hero_subhead: str = Field(..., description="Supporting text")
    primary_cta: str = Field(..., description="Main call-to-action")
    secondary_cta: str = Field(default="", description="Alternative CTA")

    utm_url: str = Field(..., description="Full trackable URL")

    image_prompt: str = Field(..., description="Prompt for image generation")

    suggested_channels: List[str] = Field(default_factory=list, description="Where to run")

    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


# Pain point to messaging mapping (from knowledge base)
PAIN_POINT_MAP = {
    "fatigue": {
        "headline": "Track symptoms without draining your energy",
        "tone": "Empathetic, energy-conscious",
        "angle_name": "Track Without Effort",
    },
    "pain": {
        "headline": "Track symptoms without draining your energy",
        "tone": "Validating, supportive",
        "angle_name": "Pain Pattern Tracking",
    },
    "memory": {
        "headline": "Never forget a symptom again",
        "tone": "Reassuring, helpful",
        "angle_name": "Memory Support",
    },
    "doctor": {
        "headline": "Give your doctor data they can't dismiss",
        "tone": "Empowering, evidence-focused",
        "angle_name": "Doctor-Ready Evidence",
    },
    "flare": {
        "headline": "Log the flare without explaining your whole life",
        "tone": "Understanding, minimal",
        "angle_name": "Flare Mode",
    },
}

# Condition to subreddit mapping
CONDITION_CHANNELS = {
    "endo": ["r/endometriosis", "r/Endo", "Instagram #EndoWarrior"],
    "pcos": ["r/PCOS", "Instagram #PCOSAwareness"],
    "longcovid": ["r/covidlonghaulers", "r/LongCovid"],
    "fibro": ["r/Fibromyalgia", "r/ChronicPain"],
    "chronic": ["r/ChronicIllness", "r/Spoonie"],
}


@tool
def create_campaign(condition: str, angle: str, version: int = 1) -> Dict[str, Any]:
    """
    Create a marketing campaign brief with copy, UTM, and image prompt.

    Args:
        condition: Target condition (endo, pcos, longcovid, fibro, chronic)
        angle: Pain point angle (fatigue, pain, memory, doctor, flare)
        version: Campaign version number (default 1)

    Returns:
        Campaign artifact with all components ready for execution.
        Includes: headline, subhead, CTAs, UTM URL, image prompt, channels.
    """
    # Normalize inputs
    condition = condition.lower().strip()
    angle = angle.lower().strip()

    # Get messaging from map
    pain_config = PAIN_POINT_MAP.get(angle, PAIN_POINT_MAP["fatigue"])

    # Build campaign name
    campaign_name = f"{condition}_{angle}_v{version}"

    # Build UTM URL
    utm_url = (
        f"https://chronic-life-landing.vercel.app/?"
        f"utm_source=reddit&"
        f"utm_medium=cpc&"
        f"utm_campaign={condition}_{angle}&"
        f"utm_content=image_v{version}"
    )

    # Get channels
    channels = CONDITION_CHANNELS.get(condition, CONDITION_CHANNELS["chronic"])

    # Build image prompt (based on brand guidelines)
    image_prompt = f"""Vertical and horizontal versions of a modern, calming mobile-app hero image for a chat-first symptom tracker.

Scene: Abstract representation of {angle} relief and support. Soft, organic shapes suggesting calm and control.

Visual style: warm cream background (#FDFBF9), soft purple (#D0BDF4) + peach (#E8974F) accents, minimal gradients, gentle shadows, premium fintech-like clarity.

No text in image. No medical imagery, no hospitals, no stock-photo look.

Ultra clean, product-marketing aesthetic, high resolution.
"""

    # Build artifact
    artifact = CampaignArtifact(
        campaign_id=f"camp_{random.randint(10000, 99999)}",
        campaign_name=campaign_name,
        condition=condition,
        angle=angle,
        target_audience=f"People managing {condition.upper()} who struggle with {angle}",
        tone=pain_config["tone"],
        hero_headline=pain_config["headline"],
        hero_subhead="20-second check-ins, flare mode on bad days, and a history that works when brain fog hits.",
        primary_cta="Start a 20-second check-in",
        secondary_cta="Meet your assistant",
        utm_url=utm_url,
        image_prompt=image_prompt,
        suggested_channels=channels,
    )

    return {
        "status": "success",
        "campaign": artifact.model_dump(),
        "next_steps": [
            f"1. Review the copy and adjust for {condition} specifics",
            "2. Generate image using the image_prompt with generate_image tool",
            f"3. Log campaign to knowledge/campaigns/{campaign_name}.md",
            "4. Update knowledge/campaigns/index.md registry",
        ]
    }
