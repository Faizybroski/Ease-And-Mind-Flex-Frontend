import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { useProfile } from "@/hooks/useProfile";
import AppLogo from "@/components/ui/logo"
import AuthPage from  "@/components/auth/AuthPage"

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getNavItems = () => {
    const baseItems = [
      { icon: Calendar, label: "Booking", path: "/" },
      { icon: Search, label: "My Bookings", path: "/explore" },
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

  const showAuthFun = () => {
    navigate('auth');
  }

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
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
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
    </nav>
  );
};

export default Navigation;
