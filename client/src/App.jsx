import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore.js';
import Layout from './components/Layout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CustomerList from './pages/CustomerList.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import CustomerForm from './pages/CustomerForm.jsx';
import OrderList from './pages/OrderList.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import OrderForm from './pages/OrderForm.jsx';
import MeasurementForm from './pages/MeasurementForm.jsx';
import MeasurementList from './pages/MeasurementList.jsx';
import Reports from './pages/Reports.jsx';
import Expenses from './pages/Expenses.jsx';
import StaffList from './pages/StaffList.jsx';
import StaffDetails from './pages/StaffDetails.jsx';
import Profile from './pages/Profile.jsx';
import Subscription from './pages/Subscription.jsx';
import SuperAdminLogin from './pages/SuperAdminLogin.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import SuperAdminTenants from './pages/SuperAdminTenants.jsx';
import SuperAdminPlans from './pages/SuperAdminPlans.jsx';
import OrderBill from './pages/OrderBill.jsx';
import MeasurementCard from './pages/MeasurementCard.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  const { fetchTenant } = useAuthStore();
  useEffect(() => { fetchTenant(); }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/tenants" element={<SuperAdminTenants />} />
        <Route path="/superadmin/plans" element={<SuperAdminPlans />} />
        <Route path="/orders/:id/bill" element={<ProtectedRoute><OrderBill /></ProtectedRoute>} />
        <Route path="/orders/:id/measurement-card" element={<ProtectedRoute><MeasurementCard /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/measurements" element={<MeasurementList />} />
          <Route path="/measurements/new" element={<MeasurementForm />} />
          <Route path="/measurements/:id/edit" element={<MeasurementForm />} />
          <Route path="/staff" element={<StaffList />} />
          <Route path="/staff/:id" element={<StaffDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<Subscription />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}
