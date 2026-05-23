from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from queries import (
    top_complaints,
    electric_breakdown,
    search_zip,
    report_card,
    peak_noise_hours,
    quietest_rankings,
    cleanest_rankings,
    map_pins,
)

app = FastAPI(title="BlockScore API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "BlockScore API"}

@app.get("/complaints/top")
def get_top_complaints(limit: int = Query(10, ge=1, le=50)):
    return top_complaints(limit)

@app.get("/complaints/electric")
def get_electric_breakdown():
    return electric_breakdown()

@app.get("/neighborhoods/search")
def get_neighborhood_search(zip_code: str):
    result = search_zip(zip_code)
    if not result:
        raise HTTPException(status_code=404, detail="ZIP code not found")
    return result

@app.get("/neighborhoods/report-card/{zip_code}")
def get_report_card(zip_code: str):
    result = report_card(zip_code)
    if not result:
        raise HTTPException(status_code=404, detail="ZIP code not found")
    return result

@app.get("/noise/peak-hours/{zip_code}")
def get_peak_noise_hours(zip_code: str):
    return peak_noise_hours(zip_code)

@app.get("/rankings/quietest")
def get_quietest(limit: int = Query(10, ge=1, le=50)):
    return quietest_rankings(limit)

@app.get("/rankings/cleanest")
def get_cleanest(limit: int = Query(10, ge=1, le=50)):
    return cleanest_rankings(limit)

@app.get("/map/pins")
def get_map_pins(category: str = "noise", limit: int = Query(500, ge=1, le=2000)):
    return map_pins(category, limit)