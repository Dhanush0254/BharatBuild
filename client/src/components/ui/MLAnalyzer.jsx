import { useState } from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { scoreListing, detectSpam } from '../../api/mlApi';

const MLAnalyzer = ({ listing }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const [scoreRes, spamRes] = await Promise.all([
        scoreListing(listing),
        detectSpam(listing)
      ]);
      setAnalysis({
        score: scoreRes.quality_score,
        grade: scoreRes.grade,
        suggestions: scoreRes.suggestions,
        isSpam: spamRes.is_spam,
        spamScore: spamRes.spam_score,
        spamReasons: spamRes.reasons
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <button onClick={runAnalysis} disabled={loading} className="btn-ghost btn-sm text-indigo-600 hover:bg-indigo-50 mt-3 w-fit">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Run ML Quality Analysis
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
      <h4 className="font-bold flex items-center gap-2 mb-3 text-indigo-900">
        <Sparkles size={16} className="text-indigo-600" /> AI Analysis Results
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quality Score */}
        <div className={`p-3 rounded-lg border ${analysis.score >= 80 ? 'bg-green-50 border-green-200' : analysis.score >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          <div className="font-bold mb-1">Quality Score: {analysis.score}/100</div>
          <div className="text-xs mb-2">Grade: {analysis.grade}</div>
          {analysis.suggestions?.length > 0 && (
            <ul className="text-xs space-y-1 list-disc pl-4 text-slate-700">
              {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}
        </div>

        {/* Spam Detection */}
        <div className={`p-3 rounded-lg border ${analysis.isSpam ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'}`}>
          <div className="font-bold mb-1 flex items-center gap-1">
            {analysis.isSpam ? <AlertTriangle size={14} className="text-red-600"/> : <ShieldCheck size={14} className="text-green-600"/>}
            Spam Status: {analysis.isSpam ? 'Likely Spam' : 'Clean'}
          </div>
          <div className="text-xs mb-2">Confidence Score: {analysis.spamScore}</div>
          {analysis.spamReasons?.length > 0 && (
            <ul className="text-xs space-y-1 list-disc pl-4">
              {analysis.spamReasons.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLAnalyzer;
