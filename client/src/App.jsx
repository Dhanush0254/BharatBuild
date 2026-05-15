import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

// Layouts & UI
import MainLayout from './layouts/MainLayout';
import ServerWakeupLoader from './components/ui/ServerWakeupLoader';

// Pages
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProviderDashboard from './pages/ProviderDashboard';
import SeekerDashboard from './pages/SeekerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ListingDetailPage from './pages/ListingDetailPage';
import EstimatorPage from './pages/EstimatorPage';

// V3: Commerce & Logistics Pages
import MaterialsPage from './pages/MaterialsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import TransportPage from './pages/TransportPage';
import MapPage from './pages/MapPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to access this section.', { id: 'auth-toast' });
    }
  }, [loading, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        {/* Protected Routes (Everything except Home/Auth) */}
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/listings/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
        <Route path="/estimator" element={<ProtectedRoute><EstimatorPage /></ProtectedRoute>} />
        
        {/* V3: Commerce & Logistics */}
        <Route path="/materials" element={<ProtectedRoute><MaterialsPage /></ProtectedRoute>} />
        <Route path="/materials/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
        <Route path="/transport" element={<ProtectedRoute><TransportPage /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected: Cart & Orders */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute allowedRoles={['seeker', 'provider']}>
              <CartPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Provider Routes */}
        <Route 
          path="/dashboard/provider" 
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Seeker Routes */}
        <Route 
          path="/dashboard/seeker" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <SeekerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ServerWakeupLoader />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
