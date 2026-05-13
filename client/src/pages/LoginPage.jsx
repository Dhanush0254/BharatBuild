import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/authApi';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock } from 'lucide-react';
import logoImg from '../assets/logo.png';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { user, token } = await loginUser(form);
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'provider') navigate('/provider');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-4">
            <img src={logoImg} alt="BharatBuild" className="h-28 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-text-secondary mt-1">Sign in to your BharatBuild account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  className="form-input pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="password"
                  className="form-input pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick login hints */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-text-muted text-center mb-3">Demo accounts for testing:</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Admin', email: 'admin@bharatbuild.in', pass: 'admin123' },
                { label: 'Seeker', email: 'seeker@bharatbuild.in', pass: 'seeker123' },
                { label: 'Provider', email: 'raju@bharatbuild.in', pass: 'provider123' },
              ].map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => setForm({ email: demo.email, password: demo.pass })}
                  className="text-xs text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-text-secondary transition-colors"
                >
                  <span className="font-semibold text-text-primary">{demo.label}:</span> {demo.email}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
