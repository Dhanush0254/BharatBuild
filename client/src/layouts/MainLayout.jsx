import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Shield,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/logo.png';

const MainLayout = () => {
  const { user, isAuthenticated, isSeeker, isProvider, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isProvider) return '/dashboard/provider';
    if (isSeeker) return '/dashboard/seeker';
    return '/';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        {/* Industrial caution stripe */}
        <div className="h-1 bg-gradient-to-r from-brand via-amber-400 to-brand" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group py-2">
              <img src={logoImg} alt="BharatBuild" className="h-24 sm:h-28 w-auto group-hover:scale-105 transition-transform origin-left" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {['workers', 'machinery', 'materials', 'repairs'].map((cat) => (
                <Link key={cat} to={`/search?category=${cat}`} className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all capitalize">
                  {cat}
                </Link>
              ))}
              <Link to="/estimator" className="px-3 py-2 text-sm font-medium text-indigo-300 hover:text-white hover:bg-indigo-600/30 rounded-lg transition-all flex items-center gap-1.5 border border-indigo-500/20">
                <span className="text-xs">🤖</span> ML Calculator
              </Link>
              
              {isProvider && (
                <Link to="/dashboard/provider" className="ml-2 px-3 py-2 text-sm font-medium text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-all border border-brand/20">
                  Provider Dashboard
                </Link>
              )}

              {isAdmin && (
                <Link to="/admin" className="ml-2 px-3 py-2 text-sm font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 rounded-lg transition-all border border-amber-400/20">
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/search" className="p-2 text-slate-400 hover:text-white transition-colors">
                <Search size={20} />
              </Link>

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center">
                      <User size={14} className="text-brand" />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                        <span className="badge-amber mt-1.5 capitalize">{user?.role}</span>
                      </div>
                      <div className="py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Shield size={16} /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">
                    Log In
                  </Link>
                  <Link to="/register" className="btn-primary btn-sm">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-300">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900">
            <div className="px-4 py-4 space-y-2">
              {['workers', 'machinery', 'materials', 'repairs'].map((cat) => (
                <Link key={cat} to={`/search?category=${cat}`} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 capitalize font-medium">
                  {cat}
                </Link>
              ))}
              <Link to="/estimator" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-600/20 font-medium">
                🤖 ML Calculator
              </Link>
              
              {isProvider && (
                <Link to="/dashboard/provider" onClick={() => setMobileOpen(false)} className="block px-3 py-2 mt-2 rounded-lg text-brand bg-brand/10 font-bold">Provider Dashboard</Link>
              )}

              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 mt-2 rounded-lg text-amber-400 bg-amber-400/10 font-bold">Admin Panel</Link>
              )}

              <hr className="border-slate-800 my-2" />
              
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-slate-800 font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium">Log In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-brand font-medium">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6 mt-[-10px]">
                <img src={logoImg} alt="BharatBuild" className="h-24 w-auto origin-left" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Telangana's premier construction marketplace. Find workers, machinery, and materials near you.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Categories</h4>
              <div className="space-y-2">
                {['Workers', 'Machinery', 'Materials', 'Repairs'].map((cat) => (
                  <Link key={cat} to={`/search?category=${cat.toLowerCase()}`} className="block text-sm text-slate-400 hover:text-brand transition-colors">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">For Providers</h4>
              <div className="space-y-2">
                <Link to="/register" className="block text-sm text-slate-400 hover:text-brand transition-colors">Register as Provider</Link>
                <Link to="/dashboard/provider" className="block text-sm text-slate-400 hover:text-brand transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">Locations</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p>Hyderabad</p>
                <p>Secunderabad</p>
                <p>Kukatpally</p>
                <p>Miyapur</p>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-800 text-sm text-slate-500 space-y-3">
            <p className="text-xs text-slate-600 bg-slate-800/50 rounded-lg px-4 py-2.5 text-center leading-relaxed">
              ⚠️ <span className="font-semibold text-slate-400">Disclaimer:</span> This is NOT a government application. BharatBuild is a portfolio/demo project. All listings, user data, and provider details shown are simulated and do not represent real individuals or businesses.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} BharatBuild. All rights reserved.</p>
              <p>Developed by <span className="text-brand font-semibold">Dhanush A</span></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
