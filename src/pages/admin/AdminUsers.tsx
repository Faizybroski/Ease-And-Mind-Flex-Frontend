import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddUser from "@/components/addUser/AddUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { format, previousDay } from "date-fns";
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  CreditCard,
  User,
  Edit,
  Eye,
  Euro,
  Filter,
  Mail,
  MapPin,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import Axios from "axios";
import axios from "axios";

interface User {
  id: string;
  user_id: string;
  pic: string;
  email: string;
  full_name: string;
  totalBookings: number;
  recurringBookings: number;
  totalRevenue: number;
  status: string;
}

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  open,
  onOpenChange,
  onUserUpdate,
}) => {
  const { user: currentUser } = useAuth();
  const { profile } = useProfile();
  const [bookings, setBookings] = useState([]);
  const [recurringBookings, setRecurringBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
  }, [userId]);

  React.useEffect(() => {
    if (userId) {
      fetchUser(userId);
    } else {
      setUser(null);
    }
  }, [userId]);

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUser(data || {});

      console.info("User fetched", data);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: "Error loading user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `*,
        rooms: rooms(id, room_name)`
        )
        .eq("user_id", userId);

      if (error) throw error;

      const totalBookings = data.length;
      const totalRevenue = data.reduce((sum, b) => sum + (b.revenue || 0), 0);

      // update user state safely
      setUser((prev) => ({
        ...prev,
        totalBookings,
        totalRevenue,
      }));

      console.info(`booking of user ${userId}`, data);

      setBookings(data);
      setRecurringBookings([]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Error loading bookings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const handleSuspendUser = async () => {
    if (!confirm("Are you sure you want to suspend this user?")) return;

    try {
      toast({
        title: "Success",
        description: "User suspended successfully",
      });
      onUserUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error suspending user",
        variant: "destructive",
      });
      console.error("Error suspending user", error);
    }
  };

  const handleReactivateUser = async () => {
    try {
      toast({
        title: "Success",
        description: "User reactivated successfully",
      });
      onUserUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error reactivating user",
        variant: "destructive",
      });
      console.error("Error reactivating user", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      const { data, error } = await supabase.rpc("delete_user_account", {
        target_user: userId,
      });
      if (error) throw error;
      if (!error) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting user",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-[50px] font-bold leading-none text-primary">
                {user?.full_name}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex">
                  <User className="text-primary" />{" "}
                  <span className="text-primary">Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-primary">
                    Email:{" "}
                  </Label>
                  <span className="text-sm text-primary/70">{user?.email}</span>
                </div>
                <div>
                  <Label className="text-sm font-medium  text-primary">
                    Total Bookings:{" "}
                  </Label>
                  <span className="text-sm text-primary/70">
                    {user?.totalBookings}
                  </span>
                </div>
                <div>
                  <Label className="text-sm font-medium text-primary">
                    Total Recurring Bookings:{" "}
                  </Label>
                  <span className="text-sm text-primary/70">
                    {user?.recurringBookings}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Label className="text-sm font-medium text-primary">
                    Revenue:
                  </Label>
                  <div className="flex items-center">
                    <Euro className="h-4 w-4 text-primary/70" />
                    <span className="text-sm text-primary/70">
                      {user?.totalRevenue}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span className="text-primary text-lg">
                    Booking History ({user?.totalBookings || 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking?.id}>
                            <TableCell>{booking?.rooms?.room_name}</TableCell>
                            <TableCell>
                              {format(new Date(booking?.date), "PPP")}
                            </TableCell>
                            <TableCell>{booking?.revenue}</TableCell>
                            <TableCell>{booking?.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No Booking history found.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span className="text-primary text-lg">
                    Recurring Booking History ({user?.recurringBookings || 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.recurringBookings > 0 ? (
                  <div className="rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Recurrence</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking?.id}>
                            <TableCell>{booking?.room}</TableCell>
                            <TableCell>
                              {format(new Date(booking?.date_time), "PPP")}
                            </TableCell>
                            <TableCell>{booking?.recurrencePattern}</TableCell>
                            <TableCell>{booking?.revenue}</TableCell>
                            <TableCell>{booking?.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No Booking history found.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-primary hover:text-secondary"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              {user?.status === "suspend" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-[secondary] hover:text-secondary bg-secondary"
                  onClick={() => handleReactivateUser()}
                >
                  <UserCheck className="h-3 w-3" />
                  <span>Reactivate User</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-secondary hover:bg-destructive hover:text-secondary hover:border-destructive"
                  onClick={() => handleSuspendUser()}
                >
                  <Ban className="h-3 w-3" />
                  <span>Suspend User</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteUser(user.id)}
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete User</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const AdminUsers = () => {
  const { profile } = useProfile();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  useEffect(() => {
    if (profile && profile.role === "admin") {
      fetchUsers();
    }
  }, [profile]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .neq("role", "admin");

      if (profilesError) throw profilesError;

      // 2. Fetch all bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, user_id, revenue");

      if (bookingsError) throw bookingsError;

      // 3. Aggregate bookings per user
      const statsMap = bookings.reduce((acc, booking) => {
        if (!acc[booking.user_id]) {
          acc[booking.user_id] = { totalBookings: 0, totalRevenue: 0 };
        }
        acc[booking.user_id].totalBookings += 1;
        acc[booking.user_id].totalRevenue += booking.revenue || 0;
        return acc;
      }, {});

      // 4. Merge stats into profiles
      const usersWithStats = profiles.map((profile) => {
        const stats = statsMap[profile.id] || {
          totalBookings: 0,
          totalRevenue: 0,
        };
        return {
          ...profile,
          ...stats,
        };
      });

      setUsers(usersWithStats);

      console.info("Users fetched", usersWithStats);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Error loading users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      const { data, error } = await supabase.rpc("delete_user_account", {
        target_user: userId,
      });
      if (error) throw error;
      if (!error) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      }
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting user",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return <span className="text-green-700">Active</span>;
      case "suspend":
        return <span className="text-red-700">Suspended</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                All Users
              </h1>
              <p className="text-primary text-sm">Manage Your Users</p>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-4 gap-4">
            <div className="text-right flex gap-3">
              <Button className="text-sm bg-secondary border border-primary font-medium text-primary">
                Add Recurring Reservation
              </Button>
              <Button
                onClick={() => {
                  setShowAddUser(true);
                }}
                className="text-sm bg-primary font-medium text-secondary"
              >
                Send Invite
              </Button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">All Users</h1>
            <p className="text-primary text-sm">Manage Your Users</p>
          </div>
        </div>
        <div className="flex items-center justify-between space-x-4 gap-4">
          <div className="text-right flex gap-3">
            <Button className="text-sm bg-secondary border border-primary font-medium text-primary">
              Add Recurring Reservation
            </Button>
            <Button
              onClick={() => {
                setShowAddUser(true);
              }}
              className="text-sm bg-primary font-medium text-secondary"
            >
              Send Invite
            </Button>
          </div>
        </div>
      </header>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Bookings</TableHead>
                  <TableHead className="text-center max-w-[100px]">
                    Recurring Bookings
                  </TableHead>
                  <TableHead className="text-center border-b-2 border-border/30">
                    <div className="flex items-center justify-center gap-1">
                      Revenue <Euro className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center font-medium max-w-[150px]">
                      {user?.full_name}
                    </TableCell>
                    <TableCell className="text-center max-w-[150px]">
                      {user?.email}
                    </TableCell>
                    <TableCell className="text-center">
                      {user?.totalBookings}
                    </TableCell>
                    <TableCell className="text-center">
                      {user?.recurringBookings}
                    </TableCell>
                    <TableCell className="text-center">
                      {user?.totalRevenue}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusColor(user?.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-primary bg-secondary hover:text-secondary"
                          onClick={() => {
                            setSelectedUser(user?.id);
                            setShowUserDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-primary hover:text-secondary bg-secondary"
                          onClick={() => {
                            setEditUserData(user);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="border border-input bg-secondary text-destructive hover:text-[white] hover:border-destructive"
                          onClick={() => {
                            handleDeleteUser(user?.user_id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserDetailsModal
        userId={selectedUser}
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
        onUserUpdate={fetchUsers}
      />

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg text-primary">
              Edit User
            </DialogTitle>
          </DialogHeader>

          {editUserData && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editUserData.full_name}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      full_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={editUserData.email}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="border border-primary text-secondary hover:text-primary hover:border hover:border-primary hover:bg-secondary"
                  onClick={async () => {
                    if (!editUserData) {
                      toast({
                        title: "Error",
                        description: "No user is selected",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editUserData.full_name.trim()) {
                      toast({
                        title: "validation Error",
                        description: "Name is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editUserData.email.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "Email is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      const { error } = await supabase
                        .from("profiles")
                        .update({
                          full_name: editUserData.full_name.trim(),
                          email: editUserData.email.trim(),
                          status: editUserData.status,
                        })
                        .eq("id", editUserData.id);

                      if (error) throw error;
                      toast({
                        title: "Success",
                        description: "User updated successfully",
                      });
                      setShowEditModal(false);
                      fetchUsers();
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Error updating profile",
                        variant: "destructive",
                      });
                      console.error("Error updating profile", error);
                    }
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddUser open={showAddUser} onOpenChange={setShowAddUser} />
    </div>
  );
};

export default AdminUsers;
