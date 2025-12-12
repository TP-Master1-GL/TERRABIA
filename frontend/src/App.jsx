import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';

// Dashboards par rôle
import BuyerDashboard from './pages/buyer/Dashboard';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import DriverDashboard from './pages/driver/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Pages farmer
import AddProduct from './pages/farmer/AddProduct';

import { PageLoader } from './components/common/LoadingSpinner';

// Route protégée avec vérification de rôle
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <NavigateToRoleDashboard />;
  }
  
  return children;
};

// Composant pour rediriger vers le bon dashboard
const NavigateToRoleDashboard = () => {
  const { user } = useAuth();
  
  const roleDashboardMap = {
    'buyer': '/buyer/dashboard',
    'farmer': '/farmer/dashboard',
    'driver': '/driver/dashboard',
    'admin': '/admin/dashboard'
  };
  
  const dashboardPath = roleDashboardMap[user?.role] || '/buyer/dashboard';
  return <Navigate to={dashboardPath} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes communes protégées */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={['buyer', 'farmer']}>
              <Layout><Orders /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <Layout><Checkout /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Dashboard principal - redirige selon le rôle */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <NavigateToRoleDashboard />
            </ProtectedRoute>
          } />
          
          {/* Dashboards spécifiques par rôle */}
          <Route path="/buyer/dashboard" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <Layout><BuyerDashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/farmer/dashboard" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <Layout><FarmerDashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/farmer/products/new" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <Layout><AddProduct /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/driver/dashboard" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <Layout><DriverDashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Route de fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;