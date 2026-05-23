import os
import requests
from dotenv import load_dotenv

load_dotenv()

APP_TOKEN = os.getenv("SOCRATA_APP_TOKEN")
BASE_URL = "https://data.cityofnewyork.us/resource/erm2-nwe9.json"


def get_live_complaints(limit=100):
    headers = {
        "X-App-Token": APP_TOKEN
    }

    params = {
        "$limit": limit,
        "$order": "created_date DESC",
        "$where": "latitude IS NOT NULL AND longitude IS NOT NULL"
    }

    response = requests.get(BASE_URL, headers=headers, params=params)
    response.raise_for_status()

    rows = response.json()

    return [
        {
            "unique_key": item.get("unique_key"),
            "created_date": item.get("created_date"),
            "complaint_type": item.get("complaint_type"),
            "descriptor": item.get("descriptor"),
            "incident_zip": item.get("incident_zip"),
            "borough": item.get("borough"),
            "status": item.get("status"),
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude"),
        }
        for item in rows
    ]