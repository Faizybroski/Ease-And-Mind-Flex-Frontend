import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  day: string;
  date: string;
  time: string;
  revenue: string;
  user_id: string;
  user_name: string;
  user_email: string;
  room_id: string;
  room_name: string;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Bookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [filteredBookings, setFilteredBookings] = useState<Bookings[]>([])
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (date) {
      const selectedDateStr = date.toLocaleDateString("en-CA") // e.g. "2025-09-16"
      setFilteredBookings(
        bookings.filter((b) => b.date === selectedDateStr)
      )
    } else {
      setFilteredBookings(bookings)
    }
  }, [date, bookings])

  const fetchBookings = async () => {
    try {
      setBookings([
        {
          id: "b1",
          status: "upcoming",
          day: "Monday, Sep 15",
          date: "2025-09-15",
          time: "Morning 08:00 - 13:00",
          revenue: "120",
          user_id: "u1",
          user_name: "Alice Johnson",
          user_email: "alice@example.com",
          room_id: "r1",
          room_name: "Conference Room A",
        },
        {
          id: "b2",
          status: "completed",
          day: "Monday, Sep 15",
          date: "2025-09-15",
          time: "Afternoon 13:00 - 18:00",
          revenue: "200",
          user_id: "u2",
          user_name: "Bob Smith",
          user_email: "bob@example.com",
          room_id: "r2",
          room_name: "Meeting Room 1",
        },
        {
          id: "b3",
          status: "canceled",
          day: "Tuesday, Sep 16",
          date: "2025-09-16",
          time: "Night 18:00 - 22:00",
          revenue: "0",
          user_id: "u3",
          user_name: "Charlie Davis",
          user_email: "charlie@example.com",
          room_id: "r3",
          room_name: "Training Hall",
        },
        {
          id: "b4",
          status: "upcoming",
          day: "Wednesday, Sep 17",
          date: "2025-09-17",
          time: "Morning 08:00 - 13:00",
          revenue: "150",
          user_id: "u4",
          user_name: "Diana Lopez",
          user_email: "diana@example.com",
          room_id: "r1",
          room_name: "Conference Room A",
        },
        {
          id: "b5",
          status: "completed",
          day: "Wednesday, Sep 17",
          date: "2025-09-17",
          time: "Night 18:00 - 22:00",
          revenue: "180",
          user_id: "u5",
          user_name: "Ethan Brown",
          user_email: "ethan@example.com",
          room_id: "r4",
          room_name: "Board Room",
        },
        {
          id: "b6",
          status: "upcoming",
          day: "Thursday, Sep 18",
          date: "2025-09-18",
          time: "Afternoon 13:00 - 18:00",
          revenue: "220",
          user_id: "u6",
          user_name: "Fiona White",
          user_email: "fiona@example.com",
          room_id: "r2",
          room_name: "Meeting Room 1",
        },
        {
          id: "b7",
          status: "completed",
          day: "Friday, Sep 19",
          date: "2025-09-19",
          time: "Morning 08:00 - 13:00",
          revenue: "90",
          user_id: "u7",
          user_name: "George Wilson",
          user_email: "george@example.com",
          room_id: "r5",
          room_name: "Small Cabin",
        },
        {
          id: "b8",
          status: "canceled",
          day: "Saturday, Sep 20",
          date: "2025-09-20",
          time: "Afternoon 13:00 - 18:00",
          revenue: "0",
          user_id: "u8",
          user_name: "Hannah Lee",
          user_email: "hannah@example.com",
          room_id: "r3",
          room_name: "Training Hall",
        },
        {
          id: "b9",
          status: "upcoming",
          day: "Sunday, Sep 21",
          date: "2025-09-21",
          time: "Night 18:00 - 22:00",
          revenue: "250",
          user_id: "u9",
          user_name: "Ian Clark",
          user_email: "ian@example.com",
          room_id: "r4",
          room_name: "Board Room",
        },
        {
          id: "b10",
          status: "completed",
          day: "Sunday, Sep 21",
          date: "2025-09-21",
          time: "Morning 08:00 - 13:00",
          revenue: "130",
          user_id: "u10",
          user_name: "Julia Adams",
          user_email: "julia@example.com",
          room_id: "r1",
          room_name: "Conference Room A",
        },
      ]);
      console.log("Bookings fetched successfuly");
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch RSVPs",
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
      toast({ title: `Booking deleted successfully ${bookingId}` });
      fetchBookings();
    } catch (error) {
      toast({ title: "Error deleting booking", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="text-green-700">Completed</span>;
      case "canceled":
        return <span className="text-red-700">Canceled</span>;
      case "upcoming":
        return <span className="text-blue-700">Upcoming</span>;
    }
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      console.log("Selected date:", selectedDate.toISOString())
      // 👉 Here you can call API or filter bookings by date
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Bookings Management</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading Bookings...</div>
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
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="canceled">Canceled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </div>
            <div className="flex">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-40 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {date ? date.toDateString() : <span className="text-muted-foreground">Pick a date</span>}
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
                        <TableCell>{booking.room_name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium truncate max-w-[150px]">
                              {booking.user_name}
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                              {booking.user_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{booking.day}</div>
                        </TableCell>
                        <TableCell>
                          <div>{booking.time}</div>
                        </TableCell>
                        <TableCell>
                          <div>{booking.revenue}</div>
                        </TableCell>
                        <TableCell>{getStatusColor(booking.status)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="border border-input bg-background text-primary hover:text-[white] hover:border-[destructive]"
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
        {["upcoming", "canceled", "completed"].map((status) => (
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
                      {filteredBookings
                        .filter((booking) => booking.status === status)
                        .map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.room_name}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium truncate max-w-[150px]">
                                  {booking.user_name}
                                </div>
                                <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                                  {booking.user_email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>{booking.day}</div>
                            </TableCell>
                            <TableCell>
                              <div>{booking.time}</div>
                            </TableCell>
                            <TableCell>
                              <div>{booking.revenue}</div>
                            </TableCell>
                            <TableCell>
                              {getStatusColor(booking.status)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="border border-input bg-background text-primary hover:text-[white] hover:border-[destructive]"
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
