import { useState, useEffect } from 'react';
import { Map, Flame, Loader2 } from 'lucide-react';
import { getDemandHeatmap } from '../../api/mlApi';

// Mock recent inquiries to feed into the ML service
const mockInquiriesForML = [
  { district: 'Hyderabad', category: 'workers' },
  { district: 'Hyderabad', category: 'workers' },
  { district: 'Hyderabad', category: 'machinery' },
  { district: 'Ranga Reddy', category: 'materials' },
  { district: 'Medchal', category: 'workers' },
  { district: 'Hyderabad', category: 'workers' },
  { district: 'Sangareddy', category: 'materials' },
  { district: 'Khammam', category: 'machinery' },
  { district: 'Warangal', category: 'workers' },
  { district: 'Nizamabad', category: 'repairs' },
  { district: 'Ranga Reddy', category: 'workers' },
  { district: 'Hyderabad', category: 'repairs' },
  { district: 'Medchal', category: 'materials' },
  { district: 'Hyderabad', category: 'materials' },
];

const MLDemandHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const data = await getDemandHeatmap(mockInquiriesForML);
        setHeatmapData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  if (loading) {
    return <div className="card p-6 flex justify-center items-center h-48"><Loader2 className="animate-spin text-brand" /></div>;
  }

  if (!heatmapData) return null;

  const districts = Object.entries(heatmapData.districts || {}).sort((a,b) => b[1] - a[1]);
  const categories = Object.entries(heatmapData.categories || {}).sort((a,b) => b[1] - a[1]);

  return (
    <div className="card p-6 mb-8">
      <h3 className="font-bold mb-6 flex items-center gap-2 text-lg">
        <Flame className="text-red-500" /> ML Demand Heatmap Analytics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Hot Districts</h4>
          <div className="space-y-4">
            {districts.map(([district, score]) => (
              <div key={district}>
                <div className="flex justify-between text-sm mb-1 font-semibold">
                  <span>{district}</span>
                  <span className={score > 80 ? 'text-red-500' : score > 50 ? 'text-amber-500' : 'text-blue-500'}>
                    {score}% Demand
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${score > 80 ? 'bg-gradient-to-r from-red-400 to-red-600' : score > 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Trending Categories</h4>
          <div className="space-y-4">
            {categories.map(([category, score]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1 font-semibold capitalize">
                  <span>{category}</span>
                  <span className="text-indigo-600">{score}% Velocity</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLDemandHeatmap;
