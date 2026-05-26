#!/usr/bin/env python3
"""
Generate tracking URLs for existing campaigns/ads.

Usage:
    python generate_tracking_url.py --campaign CAMPAIGN --content CONTENT_ID --product PRODUCT

Example:
    python generate_tracking_url.py --campaign spoon_saver_v1 --content chat_not_forms --product spoon-saver
"""

import argparse
from urllib.parse import urlencode


def generate_tracking_url(base_url: str, campaign: str, content_id: str, source: str = "reddit", medium: str = "paid") -> str:
    """
    Generate a tracking URL with UTM parameters.

    Args:
        base_url: Base landing page URL
        campaign: Campaign identifier (utm_campaign)
        content_id: Content identifier (utm_content)
        source: Traffic source (utm_source, default: "reddit")
        medium: Traffic medium (utm_medium, default: "paid")

    Returns:
        Complete tracking URL with UTM parameters
    """
    params = {
        "utm_source": source,
        "utm_medium": medium,
        "utm_campaign": campaign,
        "utm_content": content_id
    }
    return f"{base_url}?{urlencode(params)}"


def main():
    parser = argparse.ArgumentParser(description="Generate tracking URL for campaign ad")
    parser.add_argument("--campaign", required=True, help="Campaign name (utm_campaign)")
    parser.add_argument("--content", required=True, help="Content identifier (utm_content)")
    parser.add_argument("--product", required=True, help="Product offering")
    parser.add_argument("--source", default="reddit", help="Traffic source (default: reddit)")
    parser.add_argument("--medium", default="paid", help="Traffic medium (default: paid)")
    parser.add_argument("--base-url", help="Base URL (defaults to https://chroniclife.app/{product})")

    args = parser.parse_args()

    # Generate base URL if not provided
    if not args.base_url:
        args.base_url = f"https://chroniclife.app/{args.product}"

    # Generate tracking URL
    tracking_url = generate_tracking_url(
        args.base_url,
        args.campaign,
        args.content,
        args.source,
        args.medium
    )

    print(tracking_url)


if __name__ == "__main__":
    main()
