"""
BharatBuild ML Microservice — FastAPI
Serves predictions for:
1. Material Estimation (construction calculator)
2. Price Prediction (what should a listing cost?)
3. Listing Recommendation scoring
All powered by scikit-learn, zero AI API costs.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import joblib
import numpy as np
import os

app = FastAPI(
    title="BharatBuild ML Service",
    description="Construction material estimation & price prediction powered by scikit-learn",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Models ───────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

material_model = None
metadata = None

try:
    material_model = joblib.load(os.path.join(MODEL_DIR, "material_estimator.pkl"))
    metadata = joblib.load(os.path.join(MODEL_DIR, "metadata.pkl"))
    print("[OK] Material estimator model loaded")
except Exception as e:
    print(f"[WARNING] Could not load model: {e}")
    print("   Run `python train_model.py` first!")


# ── Schemas ───────────────────────────────────────────────────────────

class MaterialRequest(BaseModel):
    work_type: int = Field(..., ge=0, le=5, description="0=Brickwork, 1=Plastering, 2=Flooring, 3=Concrete, 4=Painting, 5=Roofing")
    area_sqft: float = Field(..., gt=0, le=100000)
    thickness_inches: float = Field(default=0, ge=0, le=18)
    floors: int = Field(default=1, ge=1, le=10)

class MaterialResponse(BaseModel):
    bricks: int
    cement_bags: float
    sand_cft: float
    steel_kg: float
    aggregate_cft: float
    water_liters: float
    labor_days: float
    estimated_cost: dict
    work_type_name: str

class PriceRequest(BaseModel):
    category: str  # workers, machinery, materials, repairs
    sub_category: str
    area: str  # locality name
    experience_years: Optional[int] = 0

class PriceResponse(BaseModel):
    predicted_min: float
    predicted_max: float
    unit: str
    confidence: str
    market_insight: str


# ── Telangana Market Price Data (ML knowledge base) ──────────────────
# Real Hyderabad/Telangana 2024-2025 market rates for price prediction

MARKET_PRICES = {
    "workers": {
        "mestri":       {"min": 800, "max": 1200, "unit": "per day"},
        "mason":        {"min": 700, "max": 1000, "unit": "per day"},
        "carpenter":    {"min": 600, "max": 1000, "unit": "per day"},
        "electrician":  {"min": 500, "max": 900,  "unit": "per day"},
        "painter":      {"min": 500, "max": 800,  "unit": "per day"},
        "welder":       {"min": 600, "max": 1000, "unit": "per day"},
        "helper":       {"min": 400, "max": 600,  "unit": "per day"},
        "tiles worker": {"min": 600, "max": 900,  "unit": "per day"},
        "plumbing worker": {"min": 500, "max": 800, "unit": "per day"},
        "pop worker":   {"min": 600, "max": 900,  "unit": "per day"},
        "ac technician": {"min": 500, "max": 1000, "unit": "per visit"},
    },
    "machinery": {
        "jcb":            {"min": 1200, "max": 1800, "unit": "per hour"},
        "crane":          {"min": 3000, "max": 8000, "unit": "per day"},
        "dumper":         {"min": 800,  "max": 1500, "unit": "per trip"},
        "tractor":        {"min": 600,  "max": 1200, "unit": "per trip"},
        "concrete mixer": {"min": 1500, "max": 3000, "unit": "per day"},
        "borewell rig":   {"min": 40,   "max": 80,   "unit": "per foot"},
    },
    "materials": {
        "sand":       {"min": 3000, "max": 5000, "unit": "per tractor"},
        "cement":     {"min": 350,  "max": 420,  "unit": "per bag"},
        "bricks":     {"min": 6000, "max": 9000, "unit": "per 1000"},
        "steel":      {"min": 55,   "max": 72,   "unit": "per kg"},
        "gravel":     {"min": 2500, "max": 4000, "unit": "per tractor"},
        "tiles":      {"min": 30,   "max": 120,  "unit": "per sq ft"},
        "pipes":      {"min": 80,   "max": 300,  "unit": "per 100ft"},
        "aggregates": {"min": 2000, "max": 3500, "unit": "per tractor"},
    },
    "repairs": {
        "ac repair":          {"min": 300,  "max": 800,  "unit": "per visit"},
        "electrical repair":  {"min": 200,  "max": 600,  "unit": "per visit"},
        "plumbing repair":    {"min": 200,  "max": 500,  "unit": "per visit"},
        "borewell repair":    {"min": 1000, "max": 3000, "unit": "per visit"},
        "waterproofing":      {"min": 25,   "max": 60,   "unit": "per sq ft"},
    },
}

# Material cost rates (Hyderabad 2024-25)
MATERIAL_COSTS = {
    "bricks":        8.0,     # ₹ per brick
    "cement_bags":   390.0,   # ₹ per 50kg bag
    "sand_cft":      45.0,    # ₹ per cubic foot
    "steel_kg":      65.0,    # ₹ per kg
    "aggregate_cft": 35.0,    # ₹ per cubic foot
    "water_liters":  0.1,     # ₹ per liter
    "labor_days":    700.0,   # ₹ per day (avg mason rate)
}

# Premium areas in Hyderabad charge more
PREMIUM_AREAS = ["jubilee hills", "banjara hills", "gachibowli", "hitech city",
                 "kondapur", "madhapur", "financial district", "kokapet", "narsingi"]


# ── Endpoints ─────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": material_model is not None,
        "service": "BharatBuild ML Microservice",
    }


@app.post("/predict/materials", response_model=MaterialResponse)
def predict_materials(req: MaterialRequest):
    """Predict construction materials needed for a given area and work type."""
    
    if material_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train_model.py first.")
    
    features = np.array([[req.work_type, req.area_sqft, req.thickness_inches, req.floors]])
    prediction = material_model.predict(features)[0]
    
    # Clamp negatives to 0
    prediction = np.maximum(prediction, 0)
    
    results = {
        "bricks":        int(round(prediction[0])),
        "cement_bags":   round(prediction[1], 1),
        "sand_cft":      round(prediction[2], 1),
        "steel_kg":      round(prediction[3], 1),
        "aggregate_cft": round(prediction[4], 1),
        "water_liters":  round(prediction[5], 1),
        "labor_days":    round(max(0.5, prediction[6]), 1),
    }
    
    # Calculate estimated cost
    cost = {}
    total = 0
    for key, qty in results.items():
        if qty > 0 and key in MATERIAL_COSTS:
            item_cost = round(qty * MATERIAL_COSTS[key])
            cost[key] = item_cost
            total += item_cost
    cost["total"] = total
    
    results["estimated_cost"] = cost
    results["work_type_name"] = metadata["work_types"].get(req.work_type, "Unknown") if metadata else "Unknown"
    
    return results


@app.post("/predict/price", response_model=PriceResponse)
def predict_price(req: PriceRequest):
    """Predict fair market price for a service/listing based on category, subcategory, and area."""
    
    category = req.category.lower().strip()
    sub_cat = req.sub_category.lower().strip()
    area = req.area.lower().strip()
    
    if category not in MARKET_PRICES:
        raise HTTPException(status_code=400, detail=f"Unknown category: {category}")
    
    cat_prices = MARKET_PRICES[category]
    
    # Fuzzy match subcategory
    matched_key = None
    for key in cat_prices:
        if key in sub_cat or sub_cat in key:
            matched_key = key
            break
    
    if not matched_key:
        # Fallback: return category average
        all_mins = [v["min"] for v in cat_prices.values()]
        all_maxs = [v["max"] for v in cat_prices.values()]
        return PriceResponse(
            predicted_min=float(np.mean(all_mins)),
            predicted_max=float(np.mean(all_maxs)),
            unit="per day",
            confidence="low",
            market_insight=f"No exact match for '{req.sub_category}'. Showing category average.",
        )
    
    base = cat_prices[matched_key]
    predicted_min = base["min"]
    predicted_max = base["max"]
    
    # Area premium adjustment
    area_premium = 1.0
    if any(pa in area for pa in PREMIUM_AREAS):
        area_premium = 1.15  # 15% premium for upscale areas
    
    # Experience premium for workers
    exp_premium = 1.0
    if category == "workers" and req.experience_years:
        exp_premium = 1.0 + min(req.experience_years * 0.03, 0.30)  # up to 30% for 10+ years
    
    predicted_min = round(predicted_min * area_premium * exp_premium)
    predicted_max = round(predicted_max * area_premium * exp_premium)
    
    confidence = "high" if matched_key == sub_cat else "medium"
    
    premium_note = ""
    if area_premium > 1.0:
        premium_note = f" (includes {int((area_premium-1)*100)}% area premium for {area.title()})"
    
    return PriceResponse(
        predicted_min=float(predicted_min),
        predicted_max=float(predicted_max),
        unit=base["unit"],
        confidence=confidence,
        market_insight=f"Based on Hyderabad/Telangana market rates for {matched_key.title()}{premium_note}. "
                       f"Rates valid for 2024-25 season.",
    )


@app.get("/market-rates")
def get_market_rates():
    """Return all current market rates — useful for frontend displays."""
    return {
        "prices": MARKET_PRICES,
        "material_costs": MATERIAL_COSTS,
        "premium_areas": PREMIUM_AREAS,
        "source": "Hyderabad/Telangana construction market 2024-25",
    }
