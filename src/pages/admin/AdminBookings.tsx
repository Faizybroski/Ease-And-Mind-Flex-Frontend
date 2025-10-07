import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Trash2 } from "lucide-react";
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
        title: "Fout",
        description: "Het ophalen van boekingen is mislukt.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletebooking = async (bookingId: string) => {
    if (
      !confirm(
        "Weet u zeker dat u deze gebruiker wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
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
        title: "Succes",
        description: `Reservering succesvol verwijderd.`,
      });
      fetchBookings();
    } catch (error) {
      toast({
        title: "Fout",
        description: "Fout bij het verwijderen van de boeking.",
        variant: "destructive",
      });
      console.error("Error deleting booking", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return <span className="text-green-700">Voltooid</span>;
      case "Recurring":
        return <span className="text-green-700">Terugkerend</span>;
      case "Canceled":
        return <span className="text-red-700">Geannuleerd</span>;
      case "Upcoming":
        return <span className="text-blue-700">Aankomende</span>;
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
                Boekingsbeheer
              </h1>
              <p className="text-primary text-sm">Beheer alle boekingen</p>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Boekingen laden...</p>
          </div>
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
              Boekingsbeheer
            </h1>
            <p className="text-primary text-sm">Beheer alle boekingen</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex w-full overflow-x-auto">
          <TabsList className="flex justify-between w-full">
            <div className="flex justify-start flex gap-2 overflow-x-auto">
              <TabsTrigger value="all">Alle boekingen</TabsTrigger>
              <TabsTrigger value="Upcoming">Aankomende</TabsTrigger>
              <TabsTrigger value="Canceled">Geannuleerd</TabsTrigger>
              <TabsTrigger value="Completed">Voltooid</TabsTrigger>
              <TabsTrigger value="Recurring">Terugkerend</TabsTrigger>
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
                      <span className="text-muted-foreground">
                        Kies een datum
                      </span>
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
              <CardTitle>Alle boekingen ({filteredBookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  Geen boekingen gevonden.
                </div>
              ) : (
                <div className="rounded-lg overflow-x-auto">
                  <Table className="min-w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kamer</TableHead>
                        <TableHead>Gebruiker</TableHead>
                        <TableHead>Dag</TableHead>
                        <TableHead>Tijd</TableHead>
                        <TableHead>Winst</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell
                            className="truncate max-w-[90px] sm:max-w-[120px] md:max-w-[160px]"
                            title={booking.rooms.room_name}
                          >
                            {booking.rooms.room_name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap max-w-[200px]">
                            <div>
                              <div
                                className="font-medium truncate max-w-full"
                                title={booking.profiles.full_name}
                              >
                                {booking.profiles.full_name}
                              </div>
                              <div
                                className="text-sm text-muted-foreground truncate max-w-full"
                                title={booking.profiles.email}
                              >
                                {booking.profiles.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
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
                          <TableCell>
                            {getStatusColor(booking.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Status Tabs */}
        {["Upcoming", "Canceled", "Completed", "Recurring"].map((status) => {
          const bookingsByStatus = filteredBookings.filter(
            (b) => b.status === status
          );

          return (
            <TabsContent key={status} value={status} className="space-y-4">
              <Card className="overflow-x-auto">
                <CardHeader>
                  <CardTitle>
                    {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                    Reserveringen ({bookingsByStatus.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsByStatus.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">
                      Geen boekingen gevonden.
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-x-auto">
                      <Table className="min-w-full  table-fixed">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kamer</TableHead>
                            <TableHead>Gebruiker</TableHead>
                            <TableHead>Dag</TableHead>
                            <TableHead>Tijd</TableHead>
                            <TableHead>Winst</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookingsByStatus.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell
                                className="truncate max-w-[90px] sm:max-w-[120px] md:max-w-[160px]"
                                title={booking.rooms.room_name}
                              >
                                {booking.rooms.room_name}
                              </TableCell>
                              <TableCell className="whitespace-nowrap max-w-[200px]">
                                <div>
                                  <div
                                    className="font-medium truncate max-w-full"
                                    title={booking.profiles.full_name}
                                  >
                                    {booking.profiles.full_name}
                                  </div>
                                  <div
                                    className="text-sm text-muted-foreground truncate max-w-full"
                                    title={booking.profiles.email}
                                  >
                                    {booking.profiles.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
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
                                      {format(
                                        new Date(booking.date),
                                        "dd/MM/yy"
                                      )}
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default AdminBookings;
