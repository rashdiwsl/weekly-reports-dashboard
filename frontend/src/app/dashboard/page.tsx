"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MyReports from "@/components/MyReports";
import ManagerDashboard from "@/components/ManagerDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === "manager" ? <ManagerDashboard /> : <MyReports />}
    </ProtectedRoute>
  );
}