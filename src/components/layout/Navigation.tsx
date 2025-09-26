import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Search,
  User,
  LogOut,
  Heart,
  Star,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  UtensilsCrossed,
  Receipt,
  Menu,
  X,
} from "lucide-react";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import Code from "@/components/codeDialog/codeDialog"
import { useProfile } from "@/hooks/useProfile";
import AppLogo from "@/components/ui/logo";
import AuthPage from "@/components/auth/AuthPage";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getNavItems = () => {
    const baseItems = [
      { icon: Calendar, label: "Booking", path: "/" },
      { icon: Search, label: "My Bookings", path: "/my-bookings" },
    ];

    if (profile?.role === "admin") {
      baseItems.push({
        icon: CreditCard,
        label: "Subscription",
        path: "/subscription",
      });
    }

    return baseItems;
  };

  useEffect(() => {
    fetchTodayBookings();
  }, [profile]);

  const fetchTodayBookings = async () => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekday = weekdayNames[new Date().getDay()]; // e.g. "friday"

    try {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", profile.id)
        .or(
          `and(is_recurring.eq.false,date.eq.${today}),and(is_recurring.eq.true,start_date.lte.${today},end_date.gte.${today},weekdays.cs.{"${weekday}"})`
        );

      if (error) throw error;

      console.log("booooking fetched", bookings)

      if (bookings.length > 0) {
        setBooking(true);
      }
    } catch (error) {
      console.error("error fetching bookings for today.", error);
    }
  };

  const showAuthFun = () => {
    navigate("/auth");
  };

  const navItems = getNavItems();

  return (
    <nav className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <AppLogo />
          </div>
          {!user ? (
            <div className="flex items-center space-x-4">
              <Button onClick={() => showAuthFun()} variant="outline">
                Sign In
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant="outline"
                      className={`flex border bg-background border-none items-center space-x-1 ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-secondary"
                      }`}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-4">
                {booking && <Button className="border border-primary bg-primary text-secondary hover:bg-secondary hover:text-primary" onClick={() => setShowCode(true)}>Code</Button>}
                <NotificationCenter />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 border border-primary rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary text-primary">
                          {profile?.full_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="flex items-center justify-center w-max hover:bg-primary hover:text-secondary bg-secondary text-primary border border-primary cursor-pointer"
                    align="end"
                    forceMount
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Hamburger Icon */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {isOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-2 text-left ${
                    isActive
                      ? "bg-peach-gold/10 text-peach-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <Code open={showCode} onOpenChange={setShowCode}/>
    </nav>
  );
};

export default Navigation;
