import { useState } from 'react';
import { predictMaterials, predictPrice } from '../api/mlApi';
import {
  Calculator, Cpu, IndianRupee, Layers, Boxes, Droplets,
  HardHat, Hammer, ChevronDown, Loader2, TrendingUp, MapPin, BarChart3
} from 'lucide-react';

const WORK_TYPES = [
  { id: 0, label: 'Brickwork (Wall)', icon: '🧱', desc: 'Wall construction with bricks and mortar' },
  { id: 1, label: 'Plastering', icon: '🪣', desc: 'Wall/ceiling plastering with cement' },
  { id: 2, label: 'Flooring / Tiling', icon: '🏗️', desc: 'Floor tile or stone laying' },
  { id: 3, label: 'Concrete (Slab)', icon: '🏢', desc: 'RCC slab, foundation, or beam' },
  { id: 4, label: 'Painting', icon: '🎨', desc: 'Interior or exterior wall painting' },
  { id: 5, label: 'Roofing', icon: '🏠', desc: 'Roof construction or repair' },
];

const MATERIAL_ICONS = {
  bricks: '🧱',
  cement_bags: '📦',
  sand_cft: '⏳',
  steel_kg: '🔩',
  aggregate_cft: '🪨',
  water_liters: '💧',
  labor_days: '👷',
};

const MATERIAL_LABELS = {
  bricks: 'Bricks',
  cement_bags: 'Cement Bags (50kg)',
  sand_cft: 'Sand (cu.ft)',
  steel_kg: 'Steel (kg)',
  aggregate_cft: 'Aggregate (cu.ft)',
  water_liters: 'Water (liters)',
  labor_days: 'Labor Days',
};

const EstimatorPage = () => {
  const [tab, setTab] = useState('material');

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Cpu size={14} /> Powered by Machine Learning
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary">Smart Construction Calculator</h1>
          <p className="text-text-secondary mt-2 max-w-xl mx-auto">
            Get instant material estimates and fair price predictions — trained on 5,000+ construction data points from Telangana.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <button onClick={() => setTab('material')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'material' ? 'bg-brand text-white shadow-lg' : 'bg-white text-text-secondary border border-border hover:bg-slate-50'}`}>
            <Calculator size={18} /> Material Estimator
          </button>
          <button onClick={() => setTab('price')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'price' ? 'bg-brand text-white shadow-lg' : 'bg-white text-text-secondary border border-border hover:bg-slate-50'}`}>
            <TrendingUp size={18} /> Price Predictor
          </button>
        </div>

        {tab === 'material' ? <MaterialEstimator /> : <PricePredictor />}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MATERIAL ESTIMATOR
// ═══════════════════════════════════════════════════════════════════

const MaterialEstimator = () => {
  const [workType, setWorkType] = useState(null);
  const [area, setArea] = useState('');
  const [thickness, setThickness] = useState(9);
  const [floors, setFloors] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (workType === null || !area) return;
    try {
      setLoading(true);
      setError('');
      const data = await predictMaterials({
        work_type: workType,
        area_sqft: parseFloat(area),
        thickness_inches: workType === 0 ? thickness : 0,
        floors: workType === 3 ? floors : 1,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'ML service is currently unavailable. It may be waking up — please try again in 30 seconds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handlePredict} className="card p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
          <Calculator size={20} className="text-brand" /> Enter Project Details
        </h2>

        {/* Work Type Selection */}
        <div className="mb-6">
          <label className="form-label mb-3">What type of work?</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {WORK_TYPES.map(wt => (
              <button key={wt.id} type="button" onClick={() => setWorkType(wt.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${workType === wt.id ? 'border-brand bg-brand/5 shadow-md' : 'border-border hover:border-slate-300'}`}>
                <div className="text-2xl mb-1">{wt.icon}</div>
                <div className="font-bold text-sm text-text-primary">{wt.label}</div>
                <div className="text-xs text-text-muted mt-0.5">{wt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Area Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-1">
            <label className="form-label">Area (sq.ft) *</label>
            <input type="number" className="form-input h-12 text-lg font-bold" placeholder="e.g. 500"
              value={area} onChange={(e) => setArea(e.target.value)} required min="1" max="100000" />
          </div>
          {workType === 0 && (
            <div>
              <label className="form-label">Wall Thickness</label>
              <select className="form-select h-12" value={thickness} onChange={(e) => setThickness(parseFloat(e.target.value))}>
                <option value={4.5}>4.5 inches (Half Brick)</option>
                <option value={9}>9 inches (Full Brick)</option>
              </select>
            </div>
          )}
          {workType === 3 && (
            <div>
              <label className="form-label">Number of Floors</label>
              <select className="form-select h-12" value={floors} onChange={(e) => setFloors(parseInt(e.target.value))}>
                {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>{f} Floor{f > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || workType === null || !area}
          className="btn-primary w-full py-3.5 text-base font-bold">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Predicting...</> : <><Cpu size={18} /> Get ML Prediction</>}
        </button>

        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="card p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                <BarChart3 size={20} /> ML Prediction Results
              </h3>
              <span className="badge-green text-xs">R² = 0.99+</span>
            </div>
            <p className="text-sm text-indigo-700 mb-1">
              <strong>{result.work_type_name}</strong> — {area} sq.ft
              {workType === 0 ? ` (${thickness}" wall)` : ''}
              {workType === 3 ? ` (${floors} floor${floors > 1 ? 's' : ''})` : ''}
            </p>
          </div>

          {/* Material Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(MATERIAL_LABELS).map(([key, label]) => {
              const qty = result[key];
              if (qty <= 0) return null;
              const cost = result.estimated_cost?.[key] || 0;
              return (
                <div key={key} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">{MATERIAL_ICONS[key]}</div>
                  <div className="text-2xl font-black text-text-primary">{qty.toLocaleString('en-IN')}</div>
                  <div className="text-xs font-semibold text-text-secondary mt-1">{label}</div>
                  {cost > 0 && (
                    <div className="flex items-center gap-0.5 text-brand font-bold text-sm mt-2">
                      <IndianRupee size={12} />{cost.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Cost */}
          {result.estimated_cost?.total > 0 && (
            <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">Estimated Total Cost</h3>
                  <p className="text-xs text-amber-600 mt-1">Based on Hyderabad market rates (2024-25)</p>
                </div>
                <div className="text-3xl font-black text-amber-700 flex items-center">
                  <IndianRupee size={24} />{result.estimated_cost.total.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PRICE PREDICTOR
// ═══════════════════════════════════════════════════════════════════

const CATEGORIES = {
  workers: ['Mestri', 'Mason', 'Carpenter', 'Electrician', 'Painter', 'Welder', 'Helper', 'Tiles Worker', 'Plumbing Worker'],
  machinery: ['JCB', 'Crane', 'Dumper', 'Tractor', 'Concrete Mixer', 'Borewell Rig'],
  materials: ['Sand', 'Cement', 'Bricks', 'Steel', 'Gravel', 'Tiles', 'Pipes'],
  repairs: ['AC Repair', 'Electrical Repair', 'Plumbing Repair', 'Borewell Repair'],
};

const PricePredictor = () => {
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [area, setArea] = useState('');
  const [experience, setExperience] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!category || !subCategory) return;
    try {
      setLoading(true);
      setError('');
      const data = await predictPrice({
        category,
        sub_category: subCategory.toLowerCase(),
        area: area || 'hyderabad',
        experience_years: parseInt(experience) || 0,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'ML service is currently unavailable. It may be waking up — please try again in 30 seconds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handlePredict} className="card p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-brand" /> Predict Fair Market Price
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Category *</label>
            <select className="form-select h-12" value={category}
              onChange={(e) => { setCategory(e.target.value); setSubCategory(''); }} required>
              <option value="">Select Category</option>
              <option value="workers">Workers</option>
              <option value="machinery">Machinery</option>
              <option value="materials">Materials</option>
              <option value="repairs">Repairs</option>
            </select>
          </div>
          <div>
            <label className="form-label">Subcategory *</label>
            <select className="form-select h-12" value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)} required disabled={!category}>
              <option value="">Select</option>
              {category && CATEGORIES[category]?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="form-label"><MapPin size={12} className="inline mr-1" />Area / Locality</label>
            <input type="text" className="form-input h-12" placeholder="e.g. Kukatpally, Gachibowli"
              value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          {category === 'workers' && (
            <div>
              <label className="form-label"><HardHat size={12} className="inline mr-1" />Experience (years)</label>
              <input type="number" className="form-input h-12" min="0" max="30"
                value={experience} onChange={(e) => setExperience(e.target.value)} />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || !category || !subCategory}
          className="btn-primary w-full py-3.5 text-base font-bold">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Predicting...</> : <><TrendingUp size={18} /> Predict Price</>}
        </button>
        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
      </form>

      {/* Price Result */}
      {result && (
        <div className="card p-6 sm:p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-in fade-in duration-500">
          <div className="text-center mb-6">
            <p className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2">Predicted Fair Price Range</p>
            <div className="flex items-center justify-center gap-3 text-4xl font-black text-green-800">
              <span className="flex items-center"><IndianRupee size={28} />{result.predicted_min.toLocaleString('en-IN')}</span>
              <span className="text-green-400 text-2xl">—</span>
              <span className="flex items-center"><IndianRupee size={28} />{result.predicted_max.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-green-600 font-semibold mt-1">{result.unit}</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.confidence === 'high' ? 'bg-green-200 text-green-800' : result.confidence === 'medium' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>
              Confidence: {result.confidence.toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-green-700 text-center bg-green-100 rounded-xl p-3">{result.market_insight}</p>
        </div>
      )}
    </div>
  );
};

export default EstimatorPage;
