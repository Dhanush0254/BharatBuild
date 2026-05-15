from typing import List, Dict, Any

class WorkerRecommender:
    def recommend(self, user_req: Dict[str, Any], workers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank workers based on a weighted scoring system.
        """
        req_lat = user_req.get('lat')
        req_lng = user_req.get('lng')
        req_budget = user_req.get('budget_max')
        
        ranked_workers = []
        for worker in workers:
            score = 0.0
            
            # 1. Rating & Reviews (max 30 pts)
            rating = worker.get('rating', 0)
            reviews = worker.get('reviews', 0)
            rating_score = (rating / 5.0) * 20
            review_score = min(reviews / 50.0 * 10, 10) # cap at 50 reviews
            score += rating_score + review_score
            
            # 2. Completed Jobs (max 20 pts)
            jobs = worker.get('completed_jobs', 0)
            score += min(jobs / 100.0 * 20, 20)
            
            # 3. Response Speed (max 15 pts)
            # assume response_time in minutes
            resp_time = worker.get('response_time_mins', 60)
            if resp_time <= 15:
                score += 15
            elif resp_time <= 60:
                score += 10
            elif resp_time <= 120:
                score += 5
                
            # 4. Availability (max 15 pts)
            if worker.get('is_available', False):
                score += 15
                
            # 5. Budget Match (max 10 pts)
            worker_rate = worker.get('daily_rate', 0)
            if req_budget and worker_rate > 0:
                if worker_rate <= req_budget:
                    score += 10
                elif worker_rate <= req_budget * 1.2:
                    score += 5 # slightly over budget
                    
            # 6. Location Match (max 10 pts) - simplified
            # In a real system, compute Haversine distance
            if req_lat and req_lng and worker.get('lat') and worker.get('lng'):
                # Mocked distance check
                score += 10
                
            ranked_workers.append({
                **worker,
                "recommendation_score": round(score, 1)
            })
            
        # Sort descending
        ranked_workers.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return ranked_workers

worker_recommender = WorkerRecommender()
