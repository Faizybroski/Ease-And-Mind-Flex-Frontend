import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Compass, Ghost } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const NotFound = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // ✅ Prevent crash during loading
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  // ✅ Determine redirect route
  let homeRoute = "/auth"; // default for non-logged-in users

  if (user && profile) {
    if (profile.role === "admin") {
      homeRoute = "/admin/dashboard";
    } else {
      homeRoute = "/";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-primary/5 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-12 left-12 animate-bounce">
        <Ghost size={50} className="text-primary/70 drop-shadow-md" />
      </div>

      <div className="absolute bottom-12 right-12 animate-spin-slow">
        <Compass size={60} className="text-secondary/70 drop-shadow-md" />
      </div>

      <div className="text-center max-w-xl z-10">
        <h1 className="text-[7rem] sm:text-[9rem] font-extrabold mb-2 text-primary leading-none animate-pulse drop-shadow-lg">
          404
        </h1>
        <p className="text-2xl font-medium mb-4 text-foreground animate-fadeIn">
          Oei! Je bent verdwaald in de leegte.
        </p>
        <p className="text-lg text-muted-foreground mb-8">
          Het lijkt erop dat deze pagina nog niet is aangemaakt.
        </p>

        {/* ✅ Only ONE Button, Smart Redirect */}
        <Link
          to={homeRoute}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <Home size={20} /> Neem me mee naar huis
        </Link>
      </div>

      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-primary rounded-full animate-ping"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary rounded-full animate-ping"></div>
      <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-[#FEFEFE] rounded-full animate-ping"></div>
    </div>
  );
};

export default NotFound;
