import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminBilling from "./pages/admin/AdminBillings";
import AdminSettings from "./pages/admin/AdminSettings";

import AdminLayout from "./components/layout/AdminLayout";
import Navigation from "./components/layout/Navigation";

import { AdminLogin } from "./components/adminLogin/AdminLogin";
import AuthPage from "@/components/auth/AuthPage";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/MyBookings";

import NotFound from "./pages/NotFound";

import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                {/* Default /admin → dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />

                {/* Nested admin pages */}
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="rooms" element={<AdminRooms />} />
                <Route path="billing" element={<AdminBilling />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
