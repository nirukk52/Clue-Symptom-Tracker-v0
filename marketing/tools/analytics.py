import pandas as pd
import random

def get_ad_performance(platform: str):
    """
    Retrieves performance metrics for ads on a given platform (reddit or twitter).
    (Mock implementation with random data)
    """
    data = []
    for i in range(5):
        data.append({
            "ad_id": f"ad_{platform}_{i}",
            "impressions": random.randint(1000, 50000),
            "clicks": random.randint(50, 2000),
            "conversions": random.randint(1, 50),
            "spend": round(random.uniform(50.0, 500.0), 2)
        })
    
    df = pd.DataFrame(data)
    df['ctr'] = df['clicks'] / df['impressions']
    df['cpc'] = df['spend'] / df['clicks']
    
    return df.to_dict(orient='records')

