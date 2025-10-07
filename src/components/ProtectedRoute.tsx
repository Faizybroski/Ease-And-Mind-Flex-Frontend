import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AdminLogin } from "@/components/adminLogin/AdminLogin";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const navigate = useNavigate();
  const location = useLocation();

  // ALL HOOKS MUST BE CALLED FIRST - before any conditional logic or early returns
  useEffect(() => {
    // Only run redirection logic when we have both user and profile data
    if (user && profile && !authLoading && !profileLoading) {
      const currentPath = location.pathname;

      console.log("🔍 ProtectedRoute: Checking user role and redirection", {
        userEmail: user.email,
        profileRole: profile.role,
        currentPath,
      });

      if (profile.status !== "Active" && currentPath !== "/suspended-user") {
        navigate("/suspended-user", { replace: true });
        return;
      }

      if (currentPath === "/suspended-user" && profile.status === "Active") {
        navigate("/", { replace: true });
        return;
      }

      if (currentPath.startsWith("/auth")) {
        console.log("🔄 ProtectedRoute: Skipping redirect - on auth page");
        return;
      }

      if (profile.role === "admin" && currentPath === "/admin/login") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      // Role-based redirection logic - Admins should ALWAYS be redirected to admin area
      if (profile.role === "admin") {
        console.log("🛡️ ProtectedRoute: Admin detected");
        // Admin should always go to /admin/dashboard unless already on admin routes
        if (!currentPath.startsWith("/admin")) {
          console.log(
            "🔄 ProtectedRoute: Redirecting admin to /admin/dashboard"
          );
          navigate("/admin/dashboard", { replace: true });
          return;
        }
      } else if (profile.role === "user") {
        console.log("👤 ProtectedRoute: Regular user detected");
        // Prevent users from accessing admin routes
        if (currentPath.startsWith("/admin")) {
          console.log(
            "🔒 ProtectedRoute: Redirecting user away from admin area to /"
          );
          navigate("/", { replace: true });
          return;
        }
      }
    } else {
      console.log("⏳ ProtectedRoute: Waiting for user/profile data", {
        hasUser: !!user,
        hasProfile: !!profile,
        authLoading,
        profileLoading,
      });
    }
  }, [user, profile, navigate, location.pathname, authLoading, profileLoading]);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && profile) {
      const currentPath = location.pathname;

      // Admins
      if (profile.role === "admin") {
        if (!currentPath.startsWith("/admin")) {
          navigate("/admin/dashboard", { replace: true });
        }
        return;
      }
    }
  }, [user, profile, authLoading, profileLoading, location.pathname, navigate]);

  // NOW we can do conditional logic and early returns
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Bezig met laden...</p>
        </div>
      </div>
    );
  }

  if (location.pathname === "/admin/login") {
    return <AdminLogin />; // render AdminLogin component
  }
  return <>{children}</>;
};

export default ProtectedRoute;
