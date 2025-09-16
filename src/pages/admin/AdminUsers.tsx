// import { useAuth } from "@/contexts/AuthContext";
// import { useProfile } from "@/hooks/useProfile";
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
import AddUser from "@/components/addUser/AddUser"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
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

interface User {
  id: string;
  pic: string;
  email: string;
  name: string;
  bookings: number;
  recurringBookings: number;
  revenue: number;
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
  // const { user: currentUser } = useAuth();
  // const { profile } = useProfile();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
  }, [userId]);

  React.useEffect(() => {
    if (userId) {
      // fetch user data here
      fetchUser(userId);
    } else {
      setUser(null);
    }
  }, [userId]);

  const fetchUser = (userId) => {
    setUser({
      id: userId,
      name: "John Doe",
      email: "john.doe@example.com",
      pic: "https://i.pravatar.cc/150?u=" + userId,
      bookings: 12,
      recurringBookings: 4,
      revenue: 530,
      status: "active",
    });
  };

  const fetchBookings = () => {
    if (!userId) return;
    try {
      setBookings([
        {
          id: 1,
          room: "Conference Room A",
          date_time: "2025-09-15T10:30:00",
          revenue: "$120",
          status: "upcomming",
        },
        {
          id: 2,
          room: "Conference Room B",
          date_time: "2025-09-16T14:00:00",
          revenue: "$200",
          status: "upcomming",
        },
        {
          id: 3,
          room: "Private Office 1",
          date_time: "2025-09-17T09:00:00",
          revenue: "$80",
          status: "canceled",
        },
        {
          id: 4,
          room: "Event Hall",
          date_time: "2025-09-18T18:30:00",
          revenue: "$500",
          status: "upcomming",
        },
        {
          id: 5,
          room: "Meeting Pod 2",
          date_time: "2025-09-19T11:15:00",
          revenue: "$60",
          status: "completed",
        },
        {
          id: 6,
          room: "Training Room",
          date_time: "2025-09-20T15:45:00",
          revenue: "$300",
          status: "upcomming",
        },
        {
          id: 7,
          room: "Board Room",
          date_time: "2025-09-21T13:00:00",
          revenue: "$400",
          status: "completed",
        },
        {
          id: 8,
          room: "Hot Desk Area",
          date_time: "2025-09-22T08:45:00",
          revenue: "$50",
          status: "upcomming",
        },
        {
          id: 9,
          room: "Workshop Studio",
          date_time: "2025-09-23T17:00:00",
          revenue: "$250",
          status: "canceled",
        },
        {
          id: 10,
          room: "Private Office 2",
          date_time: "2025-09-24T09:30:00",
          revenue: "$100",
          status: "upcomming",
        },
      ]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({ title: "Error loading bookings", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const handleSuspendUser = async () => {
    if (!confirm("Are you sure you want to suspend this user?")) return;

    try {
      toast({ title: "User suspended successfully" });
      onUserUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error suspending user", variant: "destructive" });
    }
  };

  const handleReactivateUser = async () => {
    try {
      toast({ title: "User reactivated successfully" });
      onUserUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error reactivating user", variant: "destructive" });
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
      toast({ title: `User deleted successfully ${userId}` });
      onUserUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error deleting user", variant: "destructive" });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <img
                src={user?.pic}
                alt={user?.name}
                className="h-20 w-20 rounded-full"
              />
              <span className="text-[50px] font-bold leading-none text-primary">
                {user?.name}
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
                    {user?.bookings}
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
                      {user?.revenue}
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
                    Booking History ({user?.bookings || 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.bookings > 0 ? (
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
                            <TableCell>{booking?.room}</TableCell>
                            <TableCell>
                              {format(new Date(booking?.date_time), "PPP")}
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
  // const { profile } = useProfile();

  const profile = {
    role: "admin",
  };

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  // useEffect(() => {
  //   if (profile && profile.role === "admin") {
  //     fetchUsers();
  //   }
  // }, [profile]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsers([
        {
          id: "1",
          pic: "https://randomuser.me/api/portraits/men/32.jpg",
          name: "Ali Raza",
          email: "ali.raza@example.com",
          bookings: 12,
          recurringBookings: 4,
          revenue: 5600,
          status: "active",
        },
        {
          id: "2",
          pic: "https://randomuser.me/api/portraits/women/45.jpg",
          name: "Fatima Khan",
          email: "fatima.khan@example.com",
          bookings: 18,
          recurringBookings: 7,
          revenue: 8900,
          status: "active",
        },
        {
          id: "3",
          pic: "https://randomuser.me/api/portraits/men/76.jpg",
          name: "Ahmed Malik",
          email: "ahmed.malik@example.com",
          bookings: 9,
          recurringBookings: 2,
          revenue: 3400,
          status: "suspend",
        },
        {
          id: "4",
          pic: "https://randomuser.me/api/portraits/women/62.jpg",
          name: "Ayesha Siddiqui",
          email: "ayesha.siddiqui@example.com",
          bookings: 15,
          recurringBookings: 6,
          revenue: 7100,
          status: "suspend",
        },
        {
          id: "5",
          pic: "https://randomuser.me/api/portraits/men/12.jpg",
          name: "Usman Tariq",
          email: "usman.tariq@example.com",
          bookings: 7,
          recurringBookings: 1,
          revenue: 2800,
          status: "suspend",
        },
        {
          id: "6",
          pic: "https://randomuser.me/api/portraits/women/19.jpg",
          name: "Hina Qureshi",
          email: "hina.qureshi@example.com",
          bookings: 20,
          recurringBookings: 9,
          revenue: 11200,
          status: "active",
        },
        {
          id: "7",
          pic: "https://randomuser.me/api/portraits/men/89.jpg",
          name: "Imran Sheikh",
          email: "imran.sheikh@example.com",
          bookings: 11,
          recurringBookings: 3,
          revenue: 4700,
          status: "active",
        },
        {
          id: "8",
          pic: "https://randomuser.me/api/portraits/women/21.jpg",
          name: "Sara Butt",
          email: "sara.butt@example.com",
          bookings: 14,
          recurringBookings: 5,
          revenue: 6400,
          status: "active",
        },
        {
          id: "9",
          pic: "https://randomuser.me/api/portraits/men/50.jpg",
          name: "Hamza Nadeem",
          email: "hamza.nadeem@example.com",
          bookings: 6,
          recurringBookings: 2,
          revenue: 2300,
          status: "active",
        },
        {
          id: "10",
          pic: "https://randomuser.me/api/portraits/women/36.jpg",
          name: "Maryam Javed",
          email: "maryam.javed@example.com",
          bookings: 22,
          recurringBookings: 10,
          revenue: 13500,
          status: "suspend",
        },
      ]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error loading users", variant: "destructive" });
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
      toast({ title: `User deleted successfully ${userId}` });
      fetchUsers();
    } catch (error) {
      toast({ title: "Error deleting user", variant: "destructive" });
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading users...</p>
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
              onClick={() => {setShowAddUser(true)}}
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
                  <TableHead>Pic</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Recurring Bookings</TableHead>
                  <TableHead className="text-center border-b-2 border-border/30">
                    <div className="flex items-center justify-center gap-1">
                      Revenue <Euro className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium truncate">
                      <img
                        src={user.pic}
                        alt={user.name}
                        className="h-10 w-10 max-w-[100px] rounded-full"
                      />
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-[150px]">
                      {user.name}
                    </TableCell>
                    <TableCell className="truncate max-w-[8rem]">
                      {user.email}
                    </TableCell>
                    <TableCell>{user.bookings}</TableCell>
                    <TableCell>{user.recurringBookings}</TableCell>
                    <TableCell>{user.revenue}</TableCell>
                    <TableCell>{getStatusColor(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-primary bg-secondary hover:text-secondary"
                          onClick={() => {
                            setSelectedUser(user.id);
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
                            handleDeleteUser(user.id);
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
                  value={editUserData.name}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      name: e.target.value,
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
              <div>
                <Label>Password</Label>
                <Input
                  value={editUserData.password}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      password: e.target.value,
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
                    if (!editUserData) return;
                    if (
                      !editUserData.first_name.trim() ||
                      !editUserData.last_name.trim()
                    ) {
                      toast({
                        title: "First and Last name are required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!["user", "admin"].includes(editUserData.role)) {
                      toast({
                        title: "Invalid role selected",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (
                      editUserData.job_title &&
                      editUserData.job_title.length > 100
                    ) {
                      toast({
                        title: "Job title is too long",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editUserData.job_title.trim()) {
                      toast({
                        title: "Job title is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editUserData.location_city.trim()) {
                      toast({
                        title: "City is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (
                      editUserData.location_city &&
                      editUserData.location_city.length > 100
                    ) {
                      toast({
                        title: "City name is too long",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (
                      editUserData.instagram_username &&
                      editUserData.instagram_username.length > 30
                    ) {
                      toast({
                        title: "Instagram username is too long",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (
                      editUserData.linkedin_username &&
                      editUserData.linkedin_username.length > 30
                    ) {
                      toast({
                        title: "LinkedIn username is too long",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (
                      !editUserData.instagram_username.trim() &&
                      !editUserData.linkedin_username.trim()
                    ) {
                      toast({
                        title: "At least one social link is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    // const { error } = await supabase
                    //   .from("profiles")
                    //   .update({
                    //     first_name: editUserData.first_name.trim(),
                    //     last_name: editUserData.last_name.trim(),
                    //     role: editUserData.role.trim(),
                    //     job_title: editUserData.job_title.trim(),
                    //     location_city: editUserData.location_city.trim(),
                    //     instagram_username:
                    //       editUserData.instagram_username.trim() || null,
                    //     linkedin_username:
                    //       editUserData.linkedin_username.trim() || null,
                    //   })
                    //   .eq("id", editUserData.id);

                    // if (error) {
                    //   toast({
                    //     title: "Error updating user",
                    //     variant: "destructive",
                    //   });
                    // } else {
                    toast({ title: "User updated successfully" });
                    setShowEditModal(false);
                    fetchUsers();
                    // }
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
