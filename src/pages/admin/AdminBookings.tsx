import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, previousDay } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  UserCheck,
  Search,
  Users,
  Filter,
  CalendarIcon,
  CheckCircle,
  AlertTriangle,
  Trash2,
  XCircle,
  Clock,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Bookings {
  id: string;
  status: string;
  date: string;
  time_slot: string;
  final_revenue: string;
  is_recurring: boolean;
  end_date: string;
  start_date: string;
  rooms: {
    room_id: string;
    room_name: string;
  };
  profiles: {
    user_id: string;
    full_name: string;
    email: string;
  };
}

const AdminBookings = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [bookings, setBookings] = useState<Bookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [filteredBookings, setFilteredBookings] = useState<Bookings[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (date) {
      const selectedDateStr = date.toLocaleDateString("en-CA"); // e.g. "2025-09-16"
      setFilteredBookings(bookings.filter((b) => b.date === selectedDateStr));
    } else {
      setFilteredBookings(bookings);
    }
  }, [date, bookings]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase.from("bookings").select(`
        *,
        profiles!bookings_user_id_fkey(id, full_name, email),
        rooms!bookings_room_id_fkey(room_name)
      `);
      if (error) throw error;

      console.info("bookings data=====>", data);

      setBookings(data);
      console.log("Bookings fetched successfuly");
    } catch (error) {
      console.error("Error fetch bookings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch Bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletebooking = async (bookingId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Booking deleted successfully.`,
      });
      fetchBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting booking.",
        variant: "destructive",
      });
      console.error("Error deleting booking", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return <span className="text-green-700">Completed</span>;
      case "Recurring":
        return <span className="text-green-700">Recurring</span>;
      case "Canceled":
        return <span className="text-red-700">Canceled</span>;
      case "Upcoming":
        return <span className="text-blue-700">Upcoming</span>;
    }
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      console.log("Selected date:", selectedDate.toISOString());
      // 👉 Here you can call API or filter bookings by date
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
                Booking Management
              </h1>
              <p className="text-primary text-sm">Manage all Bookings</p>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading Bookings...</p>
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
            <h1 className="text-3xl font-bold text-primary mb-2">
              Booking Management
            </h1>
            <p className="text-primary text-sm">Manage all Bookings</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex">
          <TabsList className="flex justify-between w-full">
            <div className="flex justify-start flex-wrap gap-2">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="Canceled">Canceled</TabsTrigger>
              <TabsTrigger value="Completed">Completed</TabsTrigger>
              <TabsTrigger value="Recurring">Recurring</TabsTrigger>
            </div>
            <div className="flex">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-40 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {date ? (
                      date.toDateString()
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    className="bg-secondary"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </TabsList>
        </div>

        {/* All RSVPs Table */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell
                          className="w-[120px] truncate"
                          title={booking.rooms.room_name}
                        >
                          {booking.rooms.room_name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap max-w-[200px]">
                          <div>
                            <div
                              className="font-medium max-w-[150px] truncate"
                              title={booking.profiles.full_name}
                            >
                              {booking.profiles.full_name}
                            </div>
                            <div
                              className="text-sm text-muted-foreground truncate"
                              title={booking.profiles.email}
                            >
                              {booking.profiles.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[220px]">
                          {booking.is_recurring ? (
                            booking.start_date ? (
                              <div>
                                {format(
                                  new Date(booking.start_date),
                                  "dd/MM/yy"
                                )}{" "}
                                →{" "}
                                {booking.end_date
                                  ? format(
                                      new Date(booking.end_date),
                                      "dd/MM/yy"
                                    )
                                  : "Ongoing"}
                              </div>
                            ) : (
                              <div>-</div>
                            )
                          ) : (
                            booking.date && (
                              <div>
                                {format(new Date(booking.date), "dd/MM/yy")}
                              </div>
                            )
                          )}
                        </TableCell>
                        <TableCell className="w-[70px]">
                          <div>{booking.time_slot}</div>
                        </TableCell>
                        <TableCell className="w-[70px]">
                          <div>{booking.final_revenue}</div>
                        </TableCell>
                        <TableCell>{getStatusColor(booking.status)}</TableCell>
                        <TableCell className="w-[70px]">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="border border-primary bg-background text-primary hover:text-[white] hover:border-destructive"
                            onClick={() => {
                              handleDeletebooking(booking.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Status Tabs */}
        {["Upcoming", "Canceled", "Completed", "Recurring"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {status.charAt(0).toUpperCase() + status.slice(1)} Bookings (
                  {filteredBookings.filter((b) => b.status === status).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-x-auto">
                  <Table className="min-w-full ">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings
                        .filter((booking) => booking.status === status)
                        .map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell
                              className="w-[120px] truncate"
                              title={booking.rooms.room_name}
                            >
                              {booking.rooms.room_name}
                            </TableCell>
                            <TableCell className="whitespace-nowrap max-w-[200px]">
                              <div>
                                <div
                                  className="font-medium max-w-[150px] truncate"
                                  title={booking.profiles.full_name}
                                >
                                  {booking.profiles.full_name}
                                </div>
                                <div
                                  className="text-sm text-muted-foreground truncate"
                                  title={booking.profiles.email}
                                >
                                  {booking.profiles.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="w-[220px]">
                              {booking.is_recurring ? (
                                booking.start_date ? (
                                  <div>
                                    {format(
                                      new Date(booking.start_date),
                                      "dd/MM/yy"
                                    )}{" "}
                                    →{" "}
                                    {booking.end_date
                                      ? format(
                                          new Date(booking.end_date),
                                          "dd/MM/yy"
                                        )
                                      : "Ongoing"}
                                  </div>
                                ) : (
                                  <div>-</div>
                                )
                              ) : (
                                booking.date && (
                                  <div>
                                    {format(new Date(booking.date), "dd/MM/yy")}
                                  </div>
                                )
                              )}
                            </TableCell>
                            <TableCell className="w-[70px]">
                              <div>{booking.time_slot}</div>
                            </TableCell>
                            <TableCell className="w-[70px]">
                              <div>{booking.final_revenue}</div>
                            </TableCell>
                            <TableCell className="w-[70px]">
                              {getStatusColor(booking.status)}
                            </TableCell>
                            <TableCell className="w-[10px]">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="border border-input bg-background text-primary hover:text-[white] hover:border-destructive"
                                onClick={() => {
                                  handleDeletebooking(booking.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminBookings;
