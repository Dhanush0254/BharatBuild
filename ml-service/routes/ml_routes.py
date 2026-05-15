from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np
import joblib
import os

from services.worker_recommender import worker_recommender
from services.demand_heatmap import demand_heatmap
from services.spam_detector import spam_detector
from services.listing_scorer import listing_scorer

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

# ── Load ML Models ────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

price_model = None
price_encoders = None

try:
    price_model = joblib.load(os.path.join(MODEL_DIR, "price_predictor.pkl"), mmap_mode='r')
    price_encoders = joblib.load(os.path.join(MODEL_DIR, "price_encoders.pkl"))
except Exception as e:
    print(f"[WARNING] Could not load price prediction model: {e}")

# ── Schemas ───────────────────────────────────────────────────────────────

class PricePredictRequest(BaseModel):
    district: str
    category: str
    season: str
    demand_level: str
    quantity: float
    transport_distance: float

class WorkerRecommendRequest(BaseModel):
    user_req: Dict[str, Any]
    workers: List[Dict[str, Any]]

class InquiriesRequest(BaseModel):
    inquiries: List[Dict[str, Any]]

class ListingRequest(BaseModel):
    listing: Dict[str, Any]

# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/predict-price")
def predict_price(req: PricePredictRequest):
    if price_model is None or price_encoders is None:
        raise HTTPException(status_code=503, detail="Price model not loaded.")
        
    try:
        # Encode inputs
        d_enc = price_encoders['district'].transform([req.district])[0]
        c_enc = price_encoders['category'].transform([req.category])[0]
        s_enc = price_encoders['season'].transform([req.season])[0]
        dl_enc = price_encoders['demand_level'].transform([req.demand_level])[0]
        
        features = np.array([[d_enc, c_enc, s_enc, dl_enc, req.quantity, req.transport_distance]])
        price = price_model.predict(features)[0]
        
        # Calculate confidence based on tree variance
        preds = np.array([tree.predict(features) for tree in price_model.estimators_])
        std = np.std(preds)
        
        return {
            "estimated_price": round(price, 2),
            "confidence_range": {
                "min": round(price - std, 2),
                "max": round(price + std, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/recommend-workers")
def recommend_workers(req: WorkerRecommendRequest):
    return worker_recommender.recommend(req.user_req, req.workers)

@router.post("/demand-heatmap")
def get_demand_heatmap(req: InquiriesRequest):
    return demand_heatmap.analyze_demand(req.inquiries)

@router.post("/detect-spam")
def detect_spam(req: ListingRequest):
    return spam_detector.detect_spam(req.listing)

@router.post("/score-listing")
def score_listing(req: ListingRequest):
    return listing_scorer.score_listing(req.listing)
