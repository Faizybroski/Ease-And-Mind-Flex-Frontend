// import { useAuth } from "@/contexts/AuthContext";
// import { useProfile } from "@/hooks/useProfile";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { format, subMonths, getMonth, getYear } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
// import { sendEventInvite } from "@/lib/sendInvite";
import {
  AlertTriangle,
  Ban,
  BarChart3,
  Euro,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const profile = {
  role: "admin",
  firstName: "Hasan",
  lastName: "Munir",
};

const AdminDashboard = () => {
  // const { user, signOut } = useAuth();
  // const { profile } = useProfile();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 300,
    percentTotalRevenue: "+20.1%",
    bookingShedules: 5,
    percentageBookingSchedule: "+12.5%",
    activeBookings: 2,
    percentageActiveBookings: "+5.2%",
    averageBooking: 60,
    percentageAverageBooking: "+20.1%",
  });

  const [data, setdata] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (profile && profile.role === "admin") {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setdata([
        {
          id: 1,
          profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
          first_name: "John",
          last_name: "Doe",
          bookedRoom: "Room 101",
          bookedTime: "10:00 AM",
          bookedDate: "2025-09-12",
        },
        {
          id: 2,
          profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
          first_name: "Jane",
          last_name: "Smith",
          bookedRoom: "Room 202",
          bookedTime: "2:30 PM",
          bookedDate: "2025-09-13",
        },
        {
          id: 3,
          profilePic: "https://randomuser.me/api/portraits/men/65.jpg",
          first_name: "Mike",
          last_name: "Johnson",
          bookedRoom: "Room 303",
          bookedTime: "11:15 AM",
          bookedDate: "2025-09-14",
        },
        {
          first_name: "Ayesha",
          last_name: "Khan",
          profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
          bookedRoom: "Room 101",
          bookedTime: "11:15 AM",
          bookedDate: "2025-09-14",
        },
        {
          first_name: "Bilal",
          last_name: "Ahmad",
          profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
          bookedTime: "11:15 AM",
          bookedDate: "2025-09-14",
        },
        {
          id: 3,
          profilePic: "https://randomuser.me/api/portraits/men/65.jpg",
          first_name: "Mike",
          last_name: "Johnson",
          bookedRoom: "Room 303",
          bookedTime: "11:15 AM",
          bookedDate: "2025-09-14",
        },
      ]);

      setRecentActivity([
        {
          name: "Ayesha Khan",
          profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
          timeAgo: "2 min",
          room: "Room 101",
          status: "booked",
          icon: "calendar",
        },
        {
          name: "Bilal Ahmed",
          profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
          timeAgo: "25 min",
          room: "Room 204",
          status: "completed",
          icon: "check-circle",
        },
        {
          name: "Sana Malik",
          profilePic: "https://randomuser.me/api/portraits/women/12.jpg",
          timeAgo: "40 min",
          room: "Room 305",
          status: "canceled",
          icon: "x-circle",
        },
        {
          name: "Hamza Iqbal",
          profilePic: "https://randomuser.me/api/portraits/men/55.jpg",
          timeAgo: "1 hr",
          room: "Room 110",
          status: "booked",
          icon: "calendar",
        },
        // {
        //   name: "Fatima Noor",
        //   profilePic: "https://randomuser.me/api/portraits/women/65.jpg",
        //   timeAgo: "1 hr 20 min",
        //   room: "Room 407",
        //   status: "completed",
        //   icon: "check-circle",
        // },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({ title: "Error loading dashboard data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "booked":
        return (
          <div className="p-1.5 rounded-full bg-primary/20 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
        );
      case "completed":
        return (
          <div className="p-1.5 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
        );
      case "canceled":
      return (
        <div className="p-1.5 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-4 w-4 text-red-600" />
        </div>
      );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return <span className="h-4 w-4 text-primary">{status}</span>;
      case "completed":
        return <span className="h-4 w-4 text-primary" >{status}</span>;
      case "canceled":
        return <span className="h-4 w-4 text-red-500" >{status}</span>;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome back, Admin!
            </h1>
            <p className="text-primary text-sm">
              Here's what's happening with your coworking space today.
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
              Revenue
            </CardTitle>
            <div className="p-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">
              <Euro className="h-10 w-10 text-primary text-bold" />
              {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground flex items-center space-x-1">
              <span>{stats.percentTotalRevenue} from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
              Bookings Schedule
            </CardTitle>
            <div className="p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">
              {stats.bookingShedules.toLocaleString()}
            </div>
            <p className="text-sm text-primary flex items-center space-x-1">
              <span>{stats.percentageBookingSchedule} from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
              Active Bookings
            </CardTitle>
            <div className="p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">
              {stats.activeBookings.toLocaleString()}
            </div>
            <p className="text-sm text-primary flex items-center space-x-1">
              <span>{stats.percentageActiveBookings} from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
              Average Bookings
            </CardTitle>
            <div className="p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">
              <Euro className="h-10 w-10 text-primary text-bold" />
              {stats.averageBooking.toLocaleString()}
            </div>
            <p className="text-sm text-primary flex items-center space-x-1">
              <span>{stats.percentageAverageBooking} from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Card className="w-2/3 overflow-x-auto border border-primary/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <CardTitle className="flex">
                <span className="bg-primary/30 rounded-full p-2 mr-2">
                  <Star className="h-4 w-4 text-primary" />
                </span>{" "}
                <span className="text-primary">Bookings This Week</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto flex flex-col gap-2">
            {data.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 px-2 py-2 border border-primary/50 hover:bg-muted/10 rounded-md"
              >
                <div className="w-24 flex items-center pl-2">
                  <img
                    src={user.profilePic}
                    alt={user.first_name}
                    className="h-10 w-10 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-primary">
                    {user.first_name} {user.last_name}
                  </p>
                  <span className="text-sm text-foreground">
                    Booked {user.bookedRoom}
                  </span>
                </div>
                <div className="w-32 flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-primary">{user.bookedTime}</span>
                </div>
                <div className="w-32 flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-primary">{user.bookedDate}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="w-1/3 border border-primary/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <CardTitle className="flex">
                <span className="bg-primary/30 rounded-full p-2 mr-2">
                  <Clock className="h-4 w-4 text-primary" />
                </span>{" "}
                <span className="text-primary">Recent Activity</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto flex flex-col gap-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex border border-primary/40 hover:bg-muted/10 rounded-lg p-3 transition-all"
              >
                {/* Profile column */}
                <div className="w-16 flex items-center justify-center">
                  <img
                    src={activity.profilePic}
                    alt={`${activity.first_name} ${activity.last_name}`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>

                {/* Content column */}
                <div className="flex-1 flex flex-col justify-between ml-3">
                  {/* Row 1: Name + status icon */}
                  <div className="flex items-center justify-between">
                    <p className="text-primary font-medium">{activity.name}</p>
                    <div className="flex items-center">
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>

                  {/* Row 2: Room */}
                  <div className="text-sm text-foreground">
                    Booked {activity.room}
                  </div>

                  {/* Row 3: Time ago + Status text */}
                  <div className="flex justify-between items-center text-sm mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-primary">{activity.timeAgo}</span>
                    </div>
                    <span className="capitalize text-primary border border-primary/20 rounded-full px-3 py-1 text-xs font-medium">
                      {getStatusColor(activity.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
