import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import StoreManagement from "@/pages/admin/Stores/StoreManagement";
import StoreRegistrationRequests from "@/pages/admin/Stores/StoreRegistrationRequests";
import SubscriptionManagement from "@/pages/admin/Subscriptions/SubscriptionManagement";
import UserManagement from "@/pages/admin/Users/UserManagement";
import SystemReports from "@/pages/admin/Reports/SystemReports";
import SystemSettings from "@/pages/admin/Settings/SystemSettings";
import PaymentNotifications from "@/components/admin/PaymentNotifications";

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="registration-requests" element={<StoreRegistrationRequests />} />
        <Route path="stores" element={<StoreManagement />} />
        <Route path="subscriptions" element={<SubscriptionManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<SystemReports />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="payments" element={<PaymentNotifications />} />
        <Route path="payment-notifications" element={<Navigate to="/admin/payments" replace />} />
      </Routes>
    </AdminLayout>
  );
}
