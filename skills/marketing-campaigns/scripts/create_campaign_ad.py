#!/usr/bin/env python3
"""
Create a new ad in a campaign using Supabase MCP.

This script creates an ad entry in the campaign_config table and returns
the tracking URL for use in Reddit ads or other marketing channels.

Usage:
    python create_campaign_ad.py --campaign CAMPAIGN_NAME --headline "Ad headline" --product PRODUCT_NAME --content-id CONTENT_ID

Example:
    python create_campaign_ad.py --campaign spoon_saver_v1 --headline "Too tired to track symptoms? Same." --product spoon-saver --content-id chat_not_forms
"""

import argparse
import sys
from urllib.parse import urlencode


def generate_tracking_url(base_url: str, campaign: str, content_id: str, source: str = "reddit", medium: str = "paid") -> str:
    """
    Generate a tracking URL with UTM parameters.

    Args:
        base_url: Base landing page URL (e.g., "https://chroniclife.app/spoon-saver")
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
    parser = argparse.ArgumentParser(description="Create a campaign ad and generate tracking URL")
    parser.add_argument("--campaign", required=True, help="Campaign name (utm_campaign)")
    parser.add_argument("--headline", required=True, help="Ad headline text")
    parser.add_argument("--product", required=True, help="Product offering (e.g., spoon-saver, flare-forecast)")
    parser.add_argument("--content-id", required=True, help="Unique content identifier (utm_content)")
    parser.add_argument("--description", default="Track symptoms without draining your energy. Log symptoms in 20 seconds, even on your worst days.", help="Ad description")
    parser.add_argument("--cta", default="Start a 20-second check-in", help="Primary CTA text")
    parser.add_argument("--base-url", help="Base URL (defaults to https://chroniclife.app/{product})")
    parser.add_argument("--display-order", type=int, default=20, help="Display order for sorting")

    args = parser.parse_args()

    # Generate base URL if not provided
    if not args.base_url:
        args.base_url = f"https://chroniclife.app/{args.product}"

    # Generate tracking URL
    tracking_url = generate_tracking_url(
        args.base_url,
        args.campaign,
        args.content_id
    )

    # Print SQL INSERT statement for Supabase
    print("-- SQL to create ad in Supabase:")
    print("-- Run this query using Supabase MCP:")
    print()
    print(f"""INSERT INTO campaign_config (
  config_type,
  config_key,
  product_offering,
  config_data,
  active,
  display_order
) VALUES (
  'ad',
  '{args.content_id}',
  '{args.product}',
  jsonb_build_object(
    'headline', '{args.headline.replace("'", "''")}',
    'description', '{args.description.replace("'", "''")}',
    'primary_cta', '{args.cta.replace("'", "''")}',
    'utm_content', '{args.content_id}',
    'utm_campaign', '{args.campaign}',
    'ad_group', '{args.campaign}',
    'target_subreddits', ARRAY['r/cfs', 'r/ChronicIllness', 'r/Fibromyalgia', 'r/LongCOVID', 'r/spoonies', 'r/endometriosis', 'r/PCOS']
  ),
  true,
  {args.display_order}
)
RETURNING id, config_key, config_data->>'headline' as headline;""")

    print()
    print("-- Tracking URL for Reddit ad:")
    print(tracking_url)
    print()
    print(f"-- Campaign: {args.campaign}")
    print(f"-- Content ID: {args.content_id}")
    print(f"-- Product: {args.product}")


if __name__ == "__main__":
    main()
