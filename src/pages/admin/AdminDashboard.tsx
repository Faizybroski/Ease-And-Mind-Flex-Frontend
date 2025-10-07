import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  Euro,
  Calendar,
  Clock,
  CalendarCheck,
  DollarSign,
  Star,
} from "lucide-react";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    bookingShedules: 0,
    activeBookings: 0,
    bookingToday: 0,
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

      const { data: totalRevenue, error: revenueError } = await supabase.rpc("get_completed_revenue");

      console.log("Total revenue:", totalRevenue);

      if (revenueError) throw revenueError;

      // 1. Booking schedules → any booking overlapping this month
      const { data: monthlyBookings, error: monthlyError } = await supabase.rpc(
        "get_monthly_bookings",
        {
          start_of_month: isoStartOfMonth,
          end_of_month: isoEndOfMonth,
        }
      );

      if (monthlyError) throw monthlyError;
      console.log("Monthly Bookings:", monthlyBookings);

      // 2. Active bookings (Completed this month)
      const { data: activeBookings, error: activeError } = await supabase
        .from("bookings")
        .select("id")
        .or(
          `and(status.eq.Completed,date.gte.${isoStartOfMonth},date.lte.${isoEndOfMonth}),and(status.eq.Completed,end_date.gte.${isoStartOfMonth},end_date.lte.${isoEndOfMonth})`
        );

      if (activeError) throw activeError;
      console.log("Active Bookings:", activeBookings);

      // 3. Bookings of today
      const { data: todayBookings, error: todayError } = await supabase
        .from("bookings")
        .select("id")
        .eq("date", isoToday);

      if (todayError) throw todayError;
      console.log("Today's Bookings:", todayBookings);

      // Update state
      setStats((prev) => ({
        ...prev,
        totalRevenue: totalRevenue || 0,
        bookingShedules: monthlyBookings?.length || 0,
        activeBookings: activeBookings?.length || 0,
        bookingToday: todayBookings?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Fout",
        description: "Het laden van de boekingsstatistieken is mislukt.",
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
        title: "Fout",
        description: "Fout bij het laden van dashboardboekingen",
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
                Welkom terug, Admin!
              </h1>
              <p className="text-primary text-sm">
                Dit is wat er momenteel gebeurt met uw coworkingruimte.
              </p>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Het beheerdersdashboard wordt geladen...</p>
          </div>
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
              Welkom terug, Admin!
            </h1>
            <p className="text-primary text-sm">
              Dit is wat er momenteel gebeurt met uw coworkingruimte.
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
              Winst
            </CardTitle>
            <div className="p-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className=" flex text-3xl font-bold text-primary mb-1 items-center">
              <Euro className="h-8 w-8 text-primary text-bold mr-1" />
              {stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
              Reserverings schema
            </CardTitle>
            <div className="p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">
              {stats.bookingShedules.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
              Voltooide boekingen
            </CardTitle>
            <div className="p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">
              {stats.activeBookings.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
              Boekingen vandaag
            </CardTitle>
            <div className="p-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-3xl font-bold text-primary mb-1">
              {stats.bookingToday.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings This Week */}
        <Card className="lg:col-span-2 overflow-x-auto border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-primary/30 rounded-full p-2 mr-2">
                <Star className="h-4 w-4 text-primary" />
              </span>
              <span className="text-primary">Boekingen deze week</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto flex flex-col gap-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 px-2 py-2 border border-primary/50 hover:bg-muted/10 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-primary">
                    {booking.profiles.full_name}
                  </p>
                  <span className="text-sm text-foreground">
                    Geboekt {booking.rooms.room_name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-primary">{booking.time_slot}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-primary">{booking.date}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-primary/30 rounded-full p-2 mr-2">
                <Clock className="h-4 w-4 text-primary" />
              </span>
              <span className="text-primary">Recente activiteit</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto flex flex-col gap-2">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex border border-primary/40 hover:bg-muted/10 rounded-lg p-3 transition-all"
              >
                <div className="flex-1 flex flex-col justify-between">
                  {/* Row 1: Name + email */}
                  <div>
                    <p className="text-primary font-medium">{activity.user}</p>
                    <p
                      title={activity.email}
                      className="text-primary truncate w-full sm:max-w-[215px]"
                    >
                      {activity.email}
                    </p>
                  </div>

                  {/* Row 2: Booking info */}
                  {activity.room && (
                    <div className="text-sm text-foreground">
                      Geboekt {activity.room}
                    </div>
                  )}
                  {activity.type === "user_registered" && (
                    <div className="text-sm text-foreground">Geregistreerd</div>
                  )}

                  {/* Row 3: Time + Type */}
                  <div className="flex justify-between items-center text-sm mt-1 flex-wrap gap-1">
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Clock className="h-3 w-3 text-primary" />
                      <span className="text-primary text-sm whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <span
                      className="capitalize text-primary text-center border border-primary/20 rounded-full px-3 py-1 text-xs whitespace-nowrap truncate max-w-full sm:max-w-[140px]"
                      title={activity.type.replace(/_/g, " ")}
                    >
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
