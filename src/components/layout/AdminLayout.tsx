import React, { useState } from "react";
// import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from "@/hooks/useProfile";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Shield,
  Bell,
  Search,
  LogOut,
  Sparkles,
  UserPlus,
  Plus,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AddUser from "@/components/addUser/AddUser"

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // const { signOut } = useAuth();
  // const { profile } = useProfile();
  const [showAddUser, setShowAddUser] = useState(false)
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background/95 to-muted/20">
        <AdminSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-20 border-b border-border/50 bg-card/80 backdrop-blur-sm px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-6">
              <SidebarTrigger className="h-10 w-10 rounded-lg text-primary hover:bg-transparent" />
              <div className="flex items-center space-x-3">
                <div className="relative w-full">
                  {!searchTerm && (
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <Search className="h-4 w-4 text-primary/50" />
                      <span className="ml-2 text-primary/50">Search anything...</span>
                    </span>
                  )}
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border border-primary/20 bg-secondary placeholder-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="text-right flex gap-3">
                <Button 
                  onClick={() => setShowAddUser(true)}
                  className="text-sm bg-secondary border border-primary font-medium text-primary hover:bg-primary hover:text-secondary">
                  <UserPlus className="h-4 w-4" />
                  Send Invite
                </Button>
                <Button className="text-sm bg-primary border border-primary font-medium text-secondary hover:text-primary hover:border hover:border-primary hover:bg-secondary">
                  <Plus className="h-4 w-4" />
                  Add Room
                </Button>
              </div>
              <Button
                // onClick={signOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 border bg-secondary border-primary hover:bg-primary text-primary hover:text-secondary"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-b from-background/50 to-muted/10 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-full mx-auto">{children}</div>
          </main>
        </div>
      </div>
      <AddUser open={showAddUser} onOpenChange={setShowAddUser} />
    </SidebarProvider>
  );
};

export default AdminLayout;
