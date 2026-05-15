"""
BharatBuild ML Training Script
Generates synthetic construction data based on Indian Civil Engineering standards
and trains a multi-output XGBoost/RandomForest model for material estimation.

Standards Reference (IS codes):
- Brickwork: ~500 bricks per 100 sq ft (9" wall), ~250 for 4.5" wall
- Cement mortar (1:6): ~0.012 bags/sqft for brickwork
- Plastering (1:4): ~0.08 bags/sqft
- Concrete (1:2:4 M20): ~8 bags cement per cubic meter
- Sand: proportional to cement in mortar/concrete
- Steel: 1-2% of concrete volume (residential)
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

np.random.seed(42)

# ══════════════════════════════════════════════════════════════════════
# WORK TYPE ENCODING
# 0 = Brickwork (wall construction)
# 1 = Plastering
# 2 = Flooring / Tiling
# 3 = Concrete (slab / foundation)
# 4 = Painting
# 5 = Roofing
# ══════════════════════════════════════════════════════════════════════

NUM_SAMPLES = 5000

def generate_data():
    """Generate realistic construction estimation data."""
    
    records = []
    
    for _ in range(NUM_SAMPLES):
        work_type = np.random.randint(0, 6)
        area_sqft = np.random.uniform(10, 5000)
        # Thickness matters for brickwork (4.5" or 9")
        thickness_inches = np.random.choice([4.5, 9.0]) if work_type == 0 else 0
        # Number of floors (affects steel and concrete)
        floors = np.random.choice([1, 2, 3]) if work_type == 3 else 1
        
        noise = lambda base: base * (1 + np.random.normal(0, 0.05))  # 5% noise
        
        if work_type == 0:  # Brickwork
            thickness_factor = 2.0 if thickness_inches == 9.0 else 1.0
            bricks = noise(area_sqft * 5.0 * thickness_factor)       # ~500/100sqft for 9", 250 for 4.5"
            cement_bags = noise(area_sqft * 0.012 * thickness_factor) # mortar cement
            sand_cft = noise(area_sqft * 0.035 * thickness_factor)    # mortar sand
            steel_kg = 0
            aggregate_cft = 0
            water_liters = noise(area_sqft * 0.3 * thickness_factor)
            labor_days = noise(area_sqft / 50)  # ~50 sqft/day per mason
            
        elif work_type == 1:  # Plastering
            bricks = 0
            cement_bags = noise(area_sqft * 0.08)
            sand_cft = noise(area_sqft * 0.04)
            steel_kg = 0
            aggregate_cft = 0
            water_liters = noise(area_sqft * 0.25)
            labor_days = noise(area_sqft / 100)
            
        elif work_type == 2:  # Flooring / Tiling
            bricks = 0
            cement_bags = noise(area_sqft * 0.04)
            sand_cft = noise(area_sqft * 0.02)
            steel_kg = 0
            aggregate_cft = 0
            water_liters = noise(area_sqft * 0.15)
            labor_days = noise(area_sqft / 60)
            
        elif work_type == 3:  # Concrete (slab/foundation)
            volume_cum = area_sqft * 0.0093 * 0.15 * floors  # area to m2, 6" slab
            bricks = 0
            cement_bags = noise(volume_cum * 8.0 * 100)   # bags per m3 scaled
            sand_cft = noise(volume_cum * 15.0 * 100)      # cft sand per m3
            steel_kg = noise(area_sqft * 0.8 * floors)     # ~0.8 kg/sqft residential
            aggregate_cft = noise(volume_cum * 30.0 * 100)  # aggregate
            water_liters = noise(area_sqft * 0.5 * floors)
            labor_days = noise(area_sqft / 30 * floors)
            
        elif work_type == 4:  # Painting
            bricks = 0
            cement_bags = 0
            sand_cft = 0
            steel_kg = 0
            aggregate_cft = 0
            water_liters = noise(area_sqft * 0.05)
            labor_days = noise(area_sqft / 150)  # painters cover ~150sqft/day
            
        else:  # Roofing (work_type == 5)
            bricks = 0
            cement_bags = noise(area_sqft * 0.05)
            sand_cft = noise(area_sqft * 0.03)
            steel_kg = noise(area_sqft * 0.3)
            aggregate_cft = noise(area_sqft * 0.02)
            water_liters = noise(area_sqft * 0.2)
            labor_days = noise(area_sqft / 40)
        
        records.append({
            'work_type': work_type,
            'area_sqft': round(area_sqft, 1),
            'thickness_inches': thickness_inches,
            'floors': floors,
            'bricks': max(0, round(bricks)),
            'cement_bags': max(0, round(cement_bags, 1)),
            'sand_cft': max(0, round(sand_cft, 1)),
            'steel_kg': max(0, round(steel_kg, 1)),
            'aggregate_cft': max(0, round(aggregate_cft, 1)),
            'water_liters': max(0, round(water_liters, 1)),
            'labor_days': max(0.5, round(labor_days, 1)),
        })
    
    return pd.DataFrame(records)


def train_model():
    """Train and save the multi-output regression model."""
    
    print("=" * 60)
    print("BharatBuild ML — Material Estimation Model Training")
    print("=" * 60)
    
    # Generate data
    df = generate_data()
    print(f"\n📊 Generated {len(df)} training samples")
    print(f"   Work types: {df['work_type'].value_counts().to_dict()}")
    print(f"   Area range: {df['area_sqft'].min()} - {df['area_sqft'].max()} sqft")
    
    # Features and targets
    feature_cols = ['work_type', 'area_sqft', 'thickness_inches', 'floors']
    target_cols = ['bricks', 'cement_bags', 'sand_cft', 'steel_kg', 'aggregate_cft', 'water_liters', 'labor_days']
    
    X = df[feature_cols]
    y = df[target_cols]
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train a multi-output Gradient Boosting model
    base_model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    model = MultiOutputRegressor(base_model)
    
    print("\n🔧 Training GradientBoosting MultiOutputRegressor...")
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_pred_df = pd.DataFrame(y_pred, columns=target_cols)
    
    print("\n📈 Model Performance (Test Set):")
    print("-" * 50)
    for i, col in enumerate(target_cols):
        mae = mean_absolute_error(y_test[col], y_pred_df[col])
        r2 = r2_score(y_test[col], y_pred_df[col])
        print(f"  {col:>15s}  →  MAE: {mae:>8.2f}  |  R²: {r2:.4f}")
    
    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'material_estimator.pkl')
    joblib.dump(model, model_path)
    print(f"\n✅ Model saved to: {model_path}")
    
    # Save training data sample for reference
    sample_path = os.path.join(model_dir, 'training_data_sample.csv')
    df.head(100).to_csv(sample_path, index=False)
    print(f"📄 Sample data saved to: {sample_path}")
    
    # Save feature/target metadata
    metadata = {
        'feature_cols': feature_cols,
        'target_cols': target_cols,
        'work_types': {
            0: 'Brickwork (Wall Construction)',
            1: 'Plastering',
            2: 'Flooring / Tiling',
            3: 'Concrete (Slab / Foundation)',
            4: 'Painting',
            5: 'Roofing',
        },
        'n_samples': len(df),
        'model_type': 'GradientBoostingRegressor (MultiOutput)',
    }
    joblib.dump(metadata, os.path.join(model_dir, 'metadata.pkl'))
    
    print("\n🎉 Training complete!")
    return model


if __name__ == '__main__':
    train_model()
