import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, UserPlus, Plus } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AddUser from "../addUser/AddUser";
import AddRoom from "../addRoom/AddRoom";

const AdminLayout: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full ">
        <AdminSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-20 border-b border-border/50 bg-card/80 backdrop-blur-sm px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-6">
              <SidebarTrigger className="h-8 w-8 rounded-lg text-primary hover:bg-transparent hover" />
              <div className="flex items-center space-x-3"></div>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="text-right flex gap-3">
                {/* <Button
                  onClick={() => setShowAddUser(true)}
                  className="text-sm bg-secondary border border-primary font-medium text-primary hover:bg-primary hover:text-secondary"
                >
                  <UserPlus className="h-4 w-4" />
                  Send Invite
                </Button> */}
                <Button
                  onClick={() => setShowAddRoom(true)}
                  className="text-sm bg-primary border border-primary font-medium text-secondary hover:text-primary hover:border hover:border-primary hover:bg-secondary"
                >
                  <Plus className="h-4 w-4" />
                  Kamer toevoegen
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSignOut}
                className="border bg-secondary border-primary hover:bg-primary text-primary hover:text-secondary"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <AddUser open={showAddUser} onOpenChange={setShowAddUser} />
      <AddRoom open={showAddRoom} onOpenChange={setShowAddRoom} />
    </SidebarProvider>
  );
};

export default AdminLayout;
