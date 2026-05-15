from typing import List, Dict, Any
import pandas as pd

class DemandHeatmap:
    def analyze_demand(self, inquiries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze inquiries to generate heatmap data.
        inquiries: list of dicts with 'district', 'category', 'timestamp'
        """
        if not inquiries:
            return {"districts": {}, "categories": {}}
            
        df = pd.DataFrame(inquiries)
        
        # Calculate district demand
        if 'district' in df.columns:
            district_counts = df['district'].value_counts().to_dict()
            max_d_count = max(district_counts.values()) if district_counts else 1
            district_scores = {d: round((c / max_d_count) * 100, 1) for d, c in district_counts.items()}
        else:
            district_scores = {}
            
        # Calculate category demand
        if 'category' in df.columns:
            category_counts = df['category'].value_counts().to_dict()
            max_c_count = max(category_counts.values()) if category_counts else 1
            category_scores = {c: round((count / max_c_count) * 100, 1) for c, count in category_counts.items()}
        else:
            category_scores = {}
            
        return {
            "districts": district_scores,
            "categories": category_scores
        }

demand_heatmap = DemandHeatmap()
