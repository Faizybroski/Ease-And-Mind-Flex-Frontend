import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // adjust to your setup
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type Settings = {
  morningSessionStart: string;
  morningSessionEnd: string;
  afternoonSessionStart: string;
  afternoonSessionEnd: string;
  eveningSessionStart: string;
  eveningSessionEnd: string;
};

const getWeekDates = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // start Monday
  start.setDate(diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const Dashboard = () => {
  const { profile } = useProfile();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: Date;
    slot: { name: string; range: string };
  } | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{
    name: string;
    price: number;
    roomId: string;
    date: string;
    slot: string;
  } | null>(null);

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<"instant" | "monthly">(
    "instant"
  );

  const navigate = useNavigate();
  const weekDates = getWeekDates(selectedDate);
  const now = new Date();

  const handleRoomSelect = (room: any) => {
    if (!selectedSlot) return;

    if (!profile) {
      toast({
        variant: "destructive", title: "Error", description: "You must be signed in for book a room."
      })
      navigate('/auth')
    }

    const dateStr = selectedSlot.day.toLocaleDateString("en-CA");
    const timeslot = selectedSlot.slot.name;

    const price =
      timeslot === "Morning"
        ? room.Morning_price
        : timeslot === "Afternoon"
        ? room.Afternoon_price
        : timeslot === "Evening"
        ? room.Night_price
        : room.Morning_price + room.Afternoon_price + room.Night_price;

    setSelectedRoom({
      name: room.room_name,
      price,
      roomId: room.id,
      date: dateStr,
      slot: timeslot,
    });

    setIsDialogOpen(false); // close room selection dialog
    setIsPaymentDialogOpen(true); // open payment dialog
  };

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!selectedSlot) return;
      setLoadingRooms(true);

      const dateStr = selectedSlot.day.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeslot = selectedSlot.slot.name; // "Morning" | "Afternoon" | "Evening" | "Full Day"
      const weekday = selectedSlot.day.toLocaleDateString("en-US", {
        weekday: "long",
      });

      try {
        // 1. Get all rooms
        const { data: rooms, error: roomsError } = await supabase
          .from("rooms")
          .select("*");
        if (roomsError) throw roomsError;

        // 2. Get all bookings (simple + recurring)
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("*");
        if (bookingsError) throw bookingsError;

        // 3. Find booked room IDs
        const bookedRoomIds = bookings
          .filter((b) => {
            if (!b.is_recurring) {
              // Simple booking: match exact date + timeslot
              return b.date === dateStr && b.timeslot === timeslot;
            } else {
              // Recurring booking
              const start = new Date(b.start_date);
              const end = new Date(b.end_date);
              const current = new Date(dateStr);

              const inRange = current >= start && current <= end;
              const weekdayMatch = b.weekdays?.includes(weekday);
              const timeslotMatch =
                b.timeslot === timeslot ||
                (b.timeslot === "Full Day" && timeslot !== ""); // Full day blocks all slots

              return inRange && weekdayMatch && timeslotMatch;
            }
          })
          .map((b) => b.room_id);

        // 4. Filter out booked rooms
        const unbookedRooms = rooms.filter(
          (room) => !bookedRoomIds.includes(room.id)
        );

        setAvailableRooms(unbookedRooms);
      } catch (err) {
        console.error("Error fetching available rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchAvailableRooms();
  }, [selectedSlot]);

  // Fetch settings once
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      if (error) {
        console.error(error);
      } else {
        setSettings(data as Settings);
      }
    };
    fetchSettings();
  }, []);

  const parseTime = (timeStr: string) => {
    // Normalize Supabase time string → "HH:mm:ss"
    const clean = timeStr.includes("+") ? timeStr.split("+")[0] : timeStr;
    const [h, m, s] = clean.split(":").map(Number);
    return { h, m: m || 0, s: s || 0 };
  };

  const formatTime = (timeStr: string) => {
    const { h, m } = parseTime(timeStr);
    const date = new Date();
    date.setHours(h, m, 0, 0);

    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  // Build timeslots dynamically
  const timeslots = settings
    ? [
        {
          name: "Morning",
          range: `${formatTime(settings.morningSessionStart)} - ${formatTime(
            settings.morningSessionEnd
          )}`,
          start: parseTime(settings.morningSessionStart),
        },
        {
          name: "Afternoon",
          range: `${formatTime(settings.afternoonSessionStart)} - ${formatTime(
            settings.afternoonSessionEnd
          )}`,
          start: parseTime(settings.afternoonSessionStart),
        },
        {
          name: "Evening",
          range: `${formatTime(settings.eveningSessionStart)} - ${formatTime(
            settings.eveningSessionEnd
          )}`,
          start: parseTime(settings.eveningSessionStart),
        },
        {
          name: "Full Day",
          range: `${formatTime(settings.morningSessionStart)} - ${formatTime(
            settings.afternoonSessionEnd
          )}`,
          start: parseTime(settings.morningSessionStart),
        },
      ]
    : [];

  // Weeks in current month
  const weeksOfMonth = (() => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    let weeks: { week: number; start: Date; end: Date }[] = [];
    let start = getWeekDates(firstDay)[0];
    let weekNum = 1;

    while (start <= lastDay) {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      weeks.push({ week: weekNum, start: new Date(start), end });
      start.setDate(start.getDate() + 7);
      weekNum++;
    }
    return weeks;
  })();

  const handleConfirmBooking = async (bookingData: {
    profileId: string;
    roomId: string;
    roomName: string;
    price: number;
    date: string;
    slot: string;
    userId: string;
    paymentType: "instant" | "monthly";
  }) => {
    try {
      // ✅ Store booking in DB
      const { error } = await supabase.from("bookings").insert([
        {
          room_id: bookingData.roomId,
          user_id: bookingData.profileId,
          date: bookingData.date,
          time_slot: bookingData.slot,
          final_revenue: bookingData.price,
          initial_revenue: bookingData.price,
          discount: 0,
          payment_type: bookingData.paymentType,
          is_recurring: false, // single booking
        },
      ]);
      if (error) throw error;

      alert("Booking confirmed!");
      toast({
        title: "Success", description: "Room booked successfuly"
      })
    } catch (err) {
      console.error("Error confirming booking:", err);
      toast({
        variant: "destructive", title: "Error", description: "Room booked successfuly"
      })
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Book Space</h1>
            <p className="text-muted-foreground mt-1">
              Select a time slot to see available spaces
            </p>
          </div>

          <div className="flex gap-2">
            {/* Month Navigator */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Week Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Week{" "}
                  {weeksOfMonth.findIndex(
                    (w) => selectedDate >= w.start && selectedDate <= w.end
                  ) + 1}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64">
                <div className="space-y-2">
                  {weeksOfMonth.map((w) => (
                    <Button
                      key={w.week}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedDate(w.start)}
                    >
                      Week {w.week}: {w.start.toLocaleDateString()} -{" "}
                      {w.end.toLocaleDateString()}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
          {weekDates.map((day, i) => (
            <div key={i} className="space-y-4">
              <div className="text-center">
                <p className="font-semibold">
                  {day.toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {day.toLocaleDateString()}
                </p>
              </div>
              {timeslots.map((slot) => {
                const slotDate = new Date(day); // clone the current day
                slotDate.setHours(slot.start.h, slot.start.m, 0, 0);

                const isPast =
                  day < new Date(now.toDateString()) || // any past day
                  (day.toDateString() === now.toDateString() &&
                    slotDate <= now); // today & already past

                return (
                  <Card
                    key={slot.name}
                    onClick={() => {
                      setSelectedSlot({ day, slot });
                      setIsDialogOpen(true);
                    }}
                    className={cn(
                      "cursor-pointer transition",
                      isPast && "opacity-50 pointer-events-none"
                    )}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{slot.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground p-3">
                      {slot.range}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Available Rooms</DialogTitle>
            <DialogDescription>
              {selectedSlot &&
                `${
                  selectedSlot.slot.name
                } on ${selectedSlot.day.toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>

          {loadingRooms ? (
            <p>Loading rooms...</p>
          ) : availableRooms.length === 0 ? (
            <p className="text-muted-foreground">No rooms available.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {availableRooms.map((room) => (
                <Card
                  key={room.id}
                  className="overflow-hidden"
                  onClick={() => handleRoomSelect(room)}
                >
                  <img
                    src={room.room_pics || "/placeholder.jpg"}
                    alt={room.room_name}
                    className="h-40 w-full object-cover"
                  />
                  <CardHeader>
                    <CardTitle>{room.room_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {room.amenities}
                    </p>
                    <p className="font-semibold text-primary">
                      Price:{" "}
                      {selectedSlot?.slot.name === "Morning"
                        ? room.Morning_price
                        : selectedSlot?.slot.name === "Afternoon"
                        ? room.Afternoon_price
                        : selectedSlot?.slot.name === "Evening"
                        ? room.Night_price
                        : room.Morning_price +
                          room.Afternoon_price +
                          room.Night_price}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              {selectedRoom &&
                `${selectedRoom.name} on ${selectedRoom.date} (${selectedRoom.slot})`}
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4">
              <p className="font-semibold">Price: {selectedRoom.price}</p>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment"
                    value="instant"
                    checked={paymentType === "instant"}
                    onChange={() => setPaymentType("instant")}
                  />
                  <span>Instant Payment</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment"
                    value="monthly"
                    checked={paymentType === "monthly"}
                    onChange={() => setPaymentType("monthly")}
                  />
                  <span>Pay after a month</span>
                </label>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  if (!selectedRoom) return;
                  if (!profile.id) return;

                  const bookingData = {
                    profileId: profile.id,
                    roomId: selectedRoom.roomId, 
                    roomName: selectedRoom.name,
                    price: selectedRoom.price,
                    date: selectedRoom.date,
                    slot: selectedRoom.slot,
                    paymentType,
                  };

                  handleConfirmBooking(bookingData); 

                  setIsPaymentDialogOpen(false); 
                }}
              >
                Confirm Booking
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
