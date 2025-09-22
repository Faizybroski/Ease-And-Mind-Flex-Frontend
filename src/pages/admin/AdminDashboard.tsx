import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
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
import {
  formatDistanceToNow,
  format,
  subMonths,
  getMonth,
  getYear,
} from "date-fns";
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
  CalendarCheck,
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

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 300,
    percentTotalRevenue: "+20.1%",
    bookingShedules: 5,
    percentageBookingSchedule: "+12.5%",
    activeBookings: 2,
    percentageActiveBookings: "+5.2%",
    bookingToday: 1,
    percentageAverageBooking: "+20.1%",
  });

  const [bookings, setBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchDashboardData();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const isoToday = today.toISOString().split("T")[0]; // YYYY-MM-DD
      const isoStartOfMonth = startOfMonth.toISOString().split("T")[0];
      const isoEndOfMonth = endOfMonth.toISOString().split("T")[0];

      // 1. Booking schedules → any booking overlapping this month
      const { data: monthlyBookings, error: monthlyError } = await supabase
        .from("bookings")
        .select("id")
        .or(
          `and(start_date.lte.${isoEndOfMonth},end_date.gte.${isoStartOfMonth}),and(date.gte.${isoStartOfMonth},date.lte.${isoEndOfMonth})`
        );

      if (monthlyError) throw monthlyError;

      // 2. Active bookings (Completed this month)
      const { data: activeBookings, error: activeError } = await supabase
        .from("bookings")
        .select("id")
        .or(
          `and(status.eq.Completed,date.gte.${isoStartOfMonth},date.lte.${isoEndOfMonth}),and(status.eq.Completed,end_date.gte.${isoStartOfMonth},end_date.lte.${isoEndOfMonth})`
        );

      if (activeError) throw activeError;

      // 3. Bookings of today
      const { data: todayBookings, error: todayError } = await supabase
        .from("bookings")
        .select("id")
        .eq("date", isoToday);

      if (todayError) throw todayError;

      // Update state
      setStats((prev) => ({
        ...prev,
        bookingShedules: monthlyBookings?.length || 0,
        activeBookings: activeBookings?.length || 0,
        bookingToday: todayBookings?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to load booking stats.",
        variant: "destructive",
      });
    }
  };

  const fetchDashboardData = async () => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);

    try {
      setLoading(true);

      // Run all queries in parallel
      const [
        { data: recentBookings, error: recentBookingsError },
        { data: newBookings, error: newBookingsError },
        { data: cancelledBookings, error: cancelledBookingsError },
        { data: newUsers, error: newUsersError },
      ] = await Promise.all([
        // Bookings from last 7 days
        supabase
          .from("bookings")
          .select(
            `
            *,
            profiles!bookings_user_id_fkey(id, full_name, email),
            rooms!bookings_room_id_fkey(room_name)
          `
          )
          .gte("date", now.toISOString())
          .lte("date", sevenDaysFromNow.toISOString())
          .order("date", { ascending: true }),

        // New bookings in last 48h
        supabase
          .from("bookings")
          .select(
            `
            id,
            created_at,
            status,
            rooms:rooms!bookings_room_id_fkey(room_name),
            profiles:profiles!bookings_user_id_fkey(full_name, email)
          `
          )
          .gte("created_at", twoDaysAgo.toISOString()),

        // Cancelled bookings in last 48h
        supabase
          .from("bookings")
          .select(
            `
            id,
            updated_at,
            status,
            rooms:rooms!bookings_room_id_fkey(room_name),
            profiles:profiles!bookings_user_id_fkey(full_name, email)
          `
          )
          .eq("status", "canceled")
          .gte("updated_at", twoDaysAgo.toISOString()),

        // New users in last 48h
        supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .gte("created_at", twoDaysAgo.toISOString()),
      ]);

      if (
        recentBookingsError ||
        newBookingsError ||
        cancelledBookingsError ||
        newUsersError
      ) {
        throw (
          recentBookingsError ||
          newBookingsError ||
          cancelledBookingsError ||
          newUsersError
        );
      }

      // Update bookings list
      setBookings(recentBookings || []);

      // Normalize activity feed
      const activities = [
        ...(newBookings || []).map((b) => ({
          type:
            b.status === "Recurring"
              ? "recurring_booking_created"
              : "booking_created",
          at: b.created_at,
          user: b.profiles?.full_name,
          email: b.profiles?.email,
          room: b.rooms?.room_name,
          status: b.status,
        })),
        ...(cancelledBookings || []).map((b) => ({
          type: "booking_cancelled",
          at: b.updated_at,
          user: b.profiles?.full_name,
          email: b.profiles?.email,
          room: b.rooms?.room_name,
          status: b.status,
        })),
        ...(newUsers || []).map((u) => ({
          type: "user_registered",
          at: u.created_at,
          user: u.full_name,
          email: u.email,
        })),
      ];

      // Sort by most recent
      activities.sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      );

      setRecentActivity(activities);
    } catch (error) {
      console.error("Error fetching dashboard bookings:", error);
      toast({
        title: "Error",
        description: "Error loading dashboard bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
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
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
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
            <div className=" flex text-3xl font-bold text-primary mb-1 items-center">
              <Euro className="h-8 w-8 text-primary text-bold" />
              {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-primary flex items-center space-x-1">
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
              Bookings Today
            </CardTitle>
            <div className="p-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-3xl font-bold text-primary mb-1">
              {stats.bookingToday.toLocaleString()}
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
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 px-2 py-2 border border-primary/50 hover:bg-muted/10 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-primary">
                    {booking.profiles.full_name}
                  </p>
                  <span className="text-sm text-foreground">
                    Booked {booking.rooms.room_name}
                  </span>
                </div>
                <div className="w-32 flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-primary">{booking.time_slot}</span>
                </div>
                <div className="w-32 flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-primary">{booking.date}</span>
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
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex border border-primary/40 hover:bg-muted/10 rounded-lg p-3 transition-all"
              >
                <div className="flex-1 flex flex-col justify-between ml-3">
                  {/* Row 1: Name + activity type */}
                  <div className=" items-center justify-between">
                    <p className="text-primary font-medium">{activity.user}</p>
                    <p className="text-primary">{activity.email}</p>
                  </div>

                  {/* Row 2: Room info (only for bookings) */}
                  {activity.room && (
                    <div className="text-sm text-foreground">
                      Booked {activity.room}
                    </div>
                  )}
                  {activity.type === "user_registered" && (
                    <div className="text-sm text-foreground">Registered</div>
                  )}

                  {/* Row 3: Time + Type */}
                  <div className="flex justify-between items-center text-sm mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-primary">
                        {formatDistanceToNow(new Date(activity.at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <span className="capitalize text-primary text-center border border-primary/20 rounded-full px-3 py-1 text-xs font-medium">
                      {activity.type.replace(/_/g, " ")}
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
