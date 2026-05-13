import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
    <div className="text-center px-4">
      <div className="text-8xl font-black text-brand/20 mb-4">404</div>
      <h1 className="text-3xl font-bold text-text-primary mb-2">Page Not Found</h1>
      <p className="text-text-secondary mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/" className="btn-primary">
          <Home size={18} /> Go Home
        </Link>
        <button onClick={() => window.history.back()} className="btn-secondary">
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
