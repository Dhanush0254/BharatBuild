import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

np.random.seed(42)

def generate_price_data(num_samples=5000):
    districts = ['Hyderabad', 'Ranga Reddy', 'Medchal', 'Sangareddy', 'Karimnagar', 'Warangal', 'Khammam', 'Nizamabad']
    categories = ['sand', 'cement', 'bricks', 'steel', 'machinery']
    seasons = ['summer', 'monsoon', 'winter']
    demand_levels = ['low', 'medium', 'high']
    
    data = []
    for _ in range(num_samples):
        district = np.random.choice(districts)
        category = np.random.choice(categories)
        season = np.random.choice(seasons)
        demand_level = np.random.choice(demand_levels)
        
        # Quantity depends on category roughly
        if category == 'sand':
            quantity = np.random.uniform(1, 10) # Tractors
            base_price = 4000
        elif category == 'cement':
            quantity = np.random.uniform(10, 500) # Bags
            base_price = 380
        elif category == 'bricks':
            quantity = np.random.uniform(1000, 20000) # Pieces
            base_price = 7
        elif category == 'steel':
            quantity = np.random.uniform(100, 5000) # Kg
            base_price = 65
        else: # machinery
            quantity = np.random.uniform(1, 48) # Hours
            base_price = 1500
            
        transport_distance = np.random.uniform(2, 50) # km
        
        # Calculate true price with rules
        price = base_price * quantity
        
        # Season modifier
        if season == 'monsoon' and category in ['sand', 'bricks']:
            price *= 1.2 # Hard to get
        
        # Demand modifier
        if demand_level == 'high':
            price *= 1.15
        elif demand_level == 'low':
            price *= 0.9
            
        # Transport cost
        transport_cost = transport_distance * 50 # 50 rs per km approx
        if category in ['sand', 'bricks', 'machinery']:
            transport_cost *= 2
            
        price += transport_cost
        
        # Noise
        price = price * (1 + np.random.normal(0, 0.05))
        
        data.append({
            'district': district,
            'category': category,
            'season': season,
            'demand_level': demand_level,
            'quantity': quantity,
            'transport_distance': transport_distance,
            'price': price
        })
        
    return pd.DataFrame(data)

def train():
    df = generate_price_data(10000)
    
    # Encode categoricals
    encoders = {}
    for col in ['district', 'category', 'season', 'demand_level']:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col])
        encoders[col] = le
        
    features = ['district_encoded', 'category_encoded', 'season_encoded', 'demand_level_encoded', 'quantity', 'transport_distance']
    X = df[features]
    y = df['price']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    print(f"MAE: {mean_absolute_error(y_test, y_pred):.2f}")
    print(f"R2: {r2_score(y_test, y_pred):.2f}")
    
    # Save model and encoders
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(model_dir, 'price_predictor.pkl'))
    joblib.dump(encoders, os.path.join(model_dir, 'price_encoders.pkl'))
    print("Saved price_predictor.pkl and price_encoders.pkl")

if __name__ == '__main__':
    train()
