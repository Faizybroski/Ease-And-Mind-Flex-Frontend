import React from 'react';
import { NavLink, 
  useLocation 
} from 'react-router-dom';
// import { useProfile } from '@/hooks/useProfile';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  CreditCard,
  Building2,
  Shield,
} from 'lucide-react';
import AppLogo from "@/components/ui/logo"

const AdminSidebar = () => {
  const location = useLocation();
  // const { profile } = useProfile();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground shadow-md font-medium" 
      : "hover:bg-muted/50 hover:text-foreground transition-all duration-200";

  // Define navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "All bookings", url: "/admin/bookings", icon: Calendar },
      { title: "Rooms", url: "/admin/rooms", icon: Building2 },
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Billing & Invoicing", url: "/admin/billing-invoicing", icon: CreditCard },
      { title: "Settings", url: "/admin/settings", icon: Settings }
    ];

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  const isExpanded = navigationItems.some((i) => isActive(i.url));

  return (
    <Sidebar className="border-r border-border/50 bg-card/50 backdrop-blur-sm">
      <SidebarContent className="py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-6 mb-4 mx-4 border-b border-primary/50">
            <AppLogo />
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-3">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => `
                        ${getNavCls({ isActive })}
                        flex items-center space-x-3 px-4 py-5 rounded-lg text-sm font-medium shadow
                        ${isActive ? 'shadow-lg' : ''}
                      `}
                    >
                      <item.icon className="h-6 w-6 flex-shrink-0 text-primary text-lg" />
                      <span className="truncate text-primary text-md">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;