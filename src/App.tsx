import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminPricingPage } from './pages/admin/AdminPricingPage';
import { LandingPage } from './pages/customer/LandingPage';
import { CustomerAuthPage } from './pages/customer/CustomerAuthPage';
import { OrderPage } from './pages/customer/OrderPage';
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';

export default function App() {
  return <Routes>
    <Route element={<CustomerLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<CustomerAuthPage />} />
      <Route path="/daftar" element={<CustomerAuthPage />} />
      <Route path="/pesan" element={<ProtectedRoute role="customer"><OrderPage /></ProtectedRoute>} />
      <Route path="/pesanan" element={<ProtectedRoute role="customer"><OrderHistoryPage /></ProtectedRoute>} />
      <Route path="/pesanan/:id" element={<ProtectedRoute role="customer"><OrderDetailPage /></ProtectedRoute>} />
    </Route>
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/pesanan" element={<AdminOrdersPage />} />
      <Route path="/admin/pesanan/:id" element={<AdminOrderDetailPage />} />
      <Route path="/admin/harga" element={<AdminPricingPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
