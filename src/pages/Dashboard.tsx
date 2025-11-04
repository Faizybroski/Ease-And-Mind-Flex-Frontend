import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // adjust to your setup
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import PaymentFields from "@/components/instantPayment/CardPayment";
import { MonthlyPaymentWrapper } from "@/components/monthlyPaymentCard/MonthlyPaymentCard";
import { DateTime } from "luxon";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  IdealBankElement,
} from "@stripe/react-stripe-js";
import IdealPayment from "@/components/instantPayment/IdealPayment";

const BUSINESS_ZONE = "Europe/Amsterdam";

type Settings = {
  morningSessionStart: string;
  morningSessionEnd: string;
  afternoonSessionStart: string;
  afternoonSessionEnd: string;
  eveningSessionStart: string;
  eveningSessionEnd: string;
  advancedBooking: number;
  cancelationPolicy: number;
};

// const toAmsterdam = (utcTime: string) =>
//   DateTime.fromISO(utcTime, { zone: "utc" })
//     .setZone("Europe/Amsterdam")
//     .toFormat("HH:mm");

function formatAmsterdamTime(timeStr) {
  return DateTime.fromFormat(timeStr, "HH:mm", {
    zone: BUSINESS_ZONE,
  }).toFormat("HH:mm");
}

function displayBusinessHours(settings) {
  return {
    morning: `${formatAmsterdamTime(
      settings.morning_session_start
    )} - ${formatAmsterdamTime(settings.morning_session_end)}`,
    afternoon: `${formatAmsterdamTime(
      settings.afternoon_session_start
    )} - ${formatAmsterdamTime(settings.afternoon_session_end)}`,
    evening: `${formatAmsterdamTime(
      settings.evening_session_start
    )} - ${formatAmsterdamTime(settings.evening_session_end)}`,
  };
}

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
  const [agreeToTerms, setAgreeToTerms] = useState(false);
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
  const [checkboxOpen, setCheckboxOpen] = useState(false);
  const [isStripePaymentDialogOpen, setIsStripePaymentDialogOpen] =
    useState(false);
  const [paymentType, setPaymentType] = useState<"Instant" | "Monthly">(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [
    isMonthlyStripePaymentDialogOpen,
    setIsMonthlyStripePaymentDialogOpen,
  ] = useState(false);
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [isIDealPaymentDialogOpen, setIsIDealPaymentDialogOpen] =
    useState(false);
  const [isIdealLoading, setIsIdealLoading] = useState(false);
  const navigate = useNavigate();
  const weekDates = getWeekDates(selectedDate);
  const now = new Date();
  const [hours, setHours] = useState(null);

  const handleRoomSelect = (room: any) => {
    if (!selectedSlot) return;

    if (!profile) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "You must be signed in for book a room.",
      });
      navigate("/auth");
    }

    // const dateStr = selectedSlot.day.toLocaleDateString("nl-NL");
    // const dateISO = selectedSlot.day.toISOString().split("T")[0]; // "2025-10-18"
    const dateISO = DateTime.fromJSDate(selectedSlot.day, {
      zone: "Europe/Amsterdam",
    }).toISODate(); // ✅ YYYY-MM-DD consistent with NL time
    const timeslot = selectedSlot.slot.name;

    const price =
      timeslot === "Ochtend"
        ? room.Morning_price
        : timeslot === "Middag"
        ? room.Afternoon_price
        : timeslot === "Avond"
        ? room.Night_price
        : room.Morning_price + room.Afternoon_price;

    setSelectedRoom({
      name: room.room_name,
      price,
      roomId: room.id,
      date: dateISO,
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
      const weekday = selectedSlot.day.toLocaleDateString("nl-NL", {
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

        const normalizeSlot = (s?: string) => {
          if (!s) return "";
          const v = s.trim().toLowerCase();
          const map: Record<string, string> = {
            // Dutch -> canonical
            ochtend: "morning",
            morgen: "morning",
            middag: "afternoon",
            avond: "evening",
            "hele dag": "hele_dag",
            // English -> canonical
            morning: "morning",
            afternoon: "afternoon",
            evening: "evening",
            "full day": "hele_dag",
            "full-day": "hele_dag",
            fullday: "hele_dag",
            heledag: "hele_dag",
          };
          return map[v] || v; // fallback to raw lowercase if unknown
        };

        const slotConflicts = (
          bookedRaw: string | undefined,
          selectedRaw: string | undefined
        ) => {
          const booked = normalizeSlot(bookedRaw);
          const selected = normalizeSlot(selectedRaw);

          // If either is empty, no conflict
          if (!booked || !selected) return false;

          // Canonical keys:
          // - "morning"
          // - "afternoon"
          // - "evening"
          // - "hele_dag"  (full-day that covers morning+afternoon ONLY)

          // 1) If user selects "hele_dag" -> block if any morning/afternoon/full-day booking exists
          if (selected === "hele_dag") {
            return (
              booked === "morning" ||
              booked === "afternoon" ||
              booked === "hele_dag"
            );
          }

          // 2) If booking is "hele_dag" -> it only blocks morning or afternoon selections
          if (booked === "hele_dag") {
            return selected === "morning" || selected === "afternoon";
          }

          // 3) Otherwise only exact same partial slot conflicts
          return booked === selected;
        };

        // 3. Find booked room IDs
        const bookedRoomIds = bookings
          .filter((b) => {
            if (!b.is_recurring) {
              // Simple booking: match exact date + timeslot
              // return b.date === dateStr && b.time_slot === timeslot;

              // Conflict logic:
              // If user selected "Hele dag" → only check for "Hele dag"
              if (!b.date || !b.time_slot) return false;

              // Normalize and compare dates safely (both YYYY-MM-DD)
              const bookingDateStr =
                typeof b.date === "string"
                  ? b.date
                  : new Date(b.date).toISOString().split("T")[0];

              if (bookingDateStr !== dateStr) return false; // must be same date

              // Now apply the slot conflict rules
              const isConflict = slotConflicts(b.time_slot, timeslot);

              // DEBUG: remove or comment out in production
              console.debug("booking-check:", {
                room_id: b.room_id,
                bookingDateStr,
                bookingSlotRaw: b.time_slot,
                selectedSlotRaw: timeslot,
                bookingSlotNorm: normalizeSlot(b.time_slot),
                selectedSlotNorm: normalizeSlot(timeslot),
                conflict: isConflict,
              });

              return isConflict;
            } else {
              const start = new Date(b.start_date);
              const end = new Date(b.end_date);
              const current = new Date(dateStr);

              // Check if current date is within recurrence window
              const inRange = current >= start && current <= end;
              if (!inRange) return false;

              // Check weekday inclusion
              const weekdayMatch = b.weekdays?.includes(weekday);
              if (!weekdayMatch) return false;

              // Parse JSON safely
              let daySlots = {};
              try {
                if (typeof b.day_time_slots === "string") {
                  daySlots = JSON.parse(b.day_time_slots);
                } else {
                  daySlots = b.day_time_slots || {};
                }
              } catch (e) {
                console.warn("Invalid day_time_slots JSON:", b.day_time_slots);
                return false;
              }

              // Get the booked slot for this weekday
              const bookedSlotForDay = daySlots?.[weekday];
              if (!bookedSlotForDay) return false;

              // Determine timeslot conflict
              const timeslotConflict =
                bookedSlotForDay === "Hele dag" ||
                timeslot === "Hele dag" ||
                bookedSlotForDay === timeslot;

              console.log("heeeeey", {
                current: dateStr,
                start: b.start_date,
                end: b.end_date,
                weekday,
                weekdays: b.weekdays,
                parsedDaySlots: daySlots,
                bookedSlotForDay,
                timeslot,
              });

              return timeslotConflict;
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
        .neq("room_code")
        .single();
      if (error) {
        console.error(error);
      } else {
        setSettings({
          morningSessionStart: data.morningSessionStart,
          morningSessionEnd: data.morningSessionEnd,
          afternoonSessionStart: data.afternoonSessionStart,
          afternoonSessionEnd: data.afternoonSessionEnd,
          eveningSessionStart: data.eveningSessionStart,
          eveningSessionEnd: data.eveningSessionEnd,
          cancelationPolicy: data.cancelationPolicy,
          advancedBooking: data.advancedBooking,
        });
      }
    };
    fetchSettings();
  }, []);

  // const parseTime = (timeStr: string) => {
  //   // Normalize Supabase time string → "HH:mm:ss"
  //   const clean = timeStr.includes("+") ? timeStr.split("+")[0] : timeStr;
  //   const [h, m, s] = clean.split(":").map(Number);
  //   return { h, m: m || 0, s: s || 0 };
  // };

  // const formatTime = (timeStr: string) => {
  //   const { h, m } = parseTime(timeStr);
  //   const date = new Date();
  //   date.setHours(h, m, 0, 0);

  //   return new Intl.DateTimeFormat("en-US", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   }).format(date);
  // };

  const parseTime = (timeStr: string) => {
    // In case the Supabase value includes seconds or "+00", clean it
    const clean = timeStr.includes("+")
      ? timeStr.split("+")[0]
      : timeStr.split(":").slice(0, 2).join(":");
    const dt = DateTime.fromFormat(clean, "HH:mm", {
      zone: "Europe/Amsterdam",
    });
    return { h: dt.hour, m: dt.minute, s: 0 };
  };

  // Format "HH:mm" → "08:00 AM" (Amsterdam time)
  const formatTime = (timeStr) => {
    if (!timeStr) return "";

    // Clean possible seconds or timezone suffixes
    const clean = timeStr.split(":").slice(0, 2).join(":"); // e.g., "14:30:00" → "14:30"

    // Parse as a generic 24h time (no timezone)
    const dt = DateTime.fromFormat(clean, "HH:mm");

    // Format to 12-hour time
    return dt.toFormat("hh:mm a"); // → "02:30 PM"
  };

  // Build timeslots dynamically
  const timeslots = settings
    ? [
        {
          name: "Ochtend",
          range: `${formatTime(settings.morningSessionStart)} - ${formatTime(
            settings.morningSessionEnd
          )}`,
          start: parseTime(settings.morningSessionStart),
        },
        {
          name: "Middag",
          range: `${formatTime(settings.afternoonSessionStart)} - ${formatTime(
            settings.afternoonSessionEnd
          )}`,
          start: parseTime(settings.afternoonSessionStart),
        },
        {
          name: "Avond",
          range: `${formatTime(settings.eveningSessionStart)} - ${formatTime(
            settings.eveningSessionEnd
          )}`,
          start: parseTime(settings.eveningSessionStart),
        },
        {
          name: "Hele dag",
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

  const handleMonthlyBooking = async (bookingData: {
    profileId: string;
    roomId: string;
    roomName: string;
    price: number;
    date: string;
    slot: string;
    paymentType: "Monthly";
  }) => {
    try {
      // const { error } = await supabase.from("bookings").insert([
      //   {
      //     room_id: bookingData.roomId,
      //     user_id: bookingData.profileId,
      //     date: bookingData.date,
      //     time_slot: bookingData.slot,
      //     final_revenue: bookingData.price,
      //     initial_revenue: bookingData.price,
      //     discount: 0,
      //     payment_type: bookingData.paymentType,
      //     status: "Upcoming",
      //     is_recurring: false, // single booking
      //   },
      // ]);
      // if (error) throw error;

      // toast({
      //   title: "Succes",
      //   description: "Room booked successfuly",
      // });

      // setSelectedRoom(bookingData);

      const slotTimes = {
        Ochtend: {
          start: settings.morningSessionStart, // e.g. "08:00:00"
          end: settings.morningSessionEnd,
        },
        Middag: {
          start: settings.afternoonSessionStart,
          end: settings.afternoonSessionEnd,
        },
        Avond: {
          start: settings.eveningSessionStart,
          end: settings.eveningSessionEnd,
        },
      };

      const slot = slotTimes[bookingData.slot];
      if (!slot) throw new Error(`Invalid slot: ${bookingData.slot}`);

      // Convert the local Netherlands slot start to UTC
      const slotStartUTC = DateTime.fromISO(
        `${bookingData.date}T${slot.start}`,
        { zone: "Europe/Amsterdam" }
      )
        .toUTC()
        .toISO(); // e.g. "2025-10-22T06:00:00Z"

      const now = DateTime.now().setZone("Europe/Amsterdam");
      const slotStart = DateTime.fromISO(`${bookingData.date}T${slot.start}`, {
        zone: "Europe/Amsterdam",
      });

      const daysUntilBooking = slotStart.diff(now, "days").days;

      if (daysUntilBooking < settings.advancedBooking) {
        toast({
          variant: "destructive",
          title: "Te laat om te boeken",
          description: `Je moet minstens ${settings.advancedBooking} dagen van tevoren reserveren.`,
        });
        return;
      }

      const { data, error: monthlyError } = await supabase
        .from("bookings")
        .insert({
          user_id: bookingData.profileId,
          room_id: bookingData.roomId,
          date: slotStartUTC,
          time_slot: bookingData.slot,
          final_revenue: bookingData.price,
          initial_revenue: bookingData.price,
          discount: 0,
          payment_type: bookingData.paymentType,
          status: "Upcoming",
          payment_status: "Pending",
          is_recurring: false,
          // stripe_payment_method_id: setupIntent.payment_method,
          // stripe_customer_id: customerId,
        });
      if (monthlyError) throw monthlyError;

      setIsPaymentDialogOpen(false);

      toast({
        title: "Succes",
        description: "Reservering succesvol aangemaakt.",
        variant: "default",
      });

      // setIsMonthlyStripePaymentDialogOpen(true);
    } catch (err) {
      console.error("Error confirming booking:", err);
      toast({
        variant: "destructive",
        title: "Fout",
        description:
          "Het boeken van een kamer is mislukt. Probeer het opnieuw.",
      });
    }
  };

  const handleInstantBooking = async (bookingData: any) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const slotTimes = {
        Ochtend: {
          start: settings.morningSessionStart, // e.g. "08:00:00"
          end: settings.morningSessionEnd,
        },
        Middag: {
          start: settings.afternoonSessionStart,
          end: settings.afternoonSessionEnd,
        },
        Avond: {
          start: settings.eveningSessionStart,
          end: settings.eveningSessionEnd,
        },
        "Hele dag": {
          start: settings.morningSessionStart,
          end: settings.afternoonSessionEnd,
        },
      };

      const slot = slotTimes[bookingData.slot];
      if (!slot) throw new Error(`Invalid slot: ${bookingData.slot}`);

      // Convert the local Netherlands slot start to UTC
      const slotStartUTC = DateTime.fromISO(
        `${bookingData.date}T${slot.start}`,
        { zone: "Europe/Amsterdam" }
      )
        .toUTC()
        .toISO(); // e.g. "2025-10-22T06:00:00Z"

      const now = DateTime.now().setZone("Europe/Amsterdam");
      const slotStart = DateTime.fromISO(`${bookingData.date}T${slot.start}`, {
        zone: "Europe/Amsterdam",
      });

      const daysUntilBooking = slotStart.diff(now, "days").days;

      if (daysUntilBooking < settings.advancedBooking) {
        toast({
          variant: "destructive",
          title: "Te laat om te boeken",
          description: `Je moet minstens ${settings.advancedBooking} dagen van tevoren reserveren.`,
        });
        return;
      }

      const resp = await fetch(
        "https://njmscbbdzkdvgkdnylxx.supabase.co/functions/v1/payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            price: selectedRoom.price,
            roomId: selectedRoom.roomId,
            date: selectedRoom.date,
            slot: selectedRoom.slot,
            paymentType,
          }),
        }
      );

      const data = await resp.json();
      const cs = data.client_secret ?? data.clientSecret ?? null;
      const pk = data.publishableKey ?? data.publishable_key ?? null;

      if (!cs || !pk)
        throw new Error(
          "Het is niet gelukt om een ​​betalingsintentie aan te maken"
        );

      // First update the state
      setClientSecret(cs);
      setPublishableKey(pk);
      const promise = loadStripe(pk);
      setStripePromise(promise);

      // Then, after state updates, open the Stripe dialog
      setTimeout(() => {
        setIsPaymentDialogOpen(false);
        setIsStripePaymentDialogOpen(true);
      }, 0);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: err.message || "Betalingsinstelling mislukt",
      });
    }
  };

  const handleIDealBooking = async (bookingData: any) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const slotTimes = {
        Ochtend: {
          start: settings.morningSessionStart, // e.g. "08:00:00"
          end: settings.morningSessionEnd,
        },
        Middag: {
          start: settings.afternoonSessionStart,
          end: settings.afternoonSessionEnd,
        },
        Avond: {
          start: settings.eveningSessionStart,
          end: settings.eveningSessionEnd,
        },
        "Hele dag": {
          start: settings.morningSessionStart,
          end: settings.afternoonSessionEnd,
        },
      };

      const slot = slotTimes[bookingData.slot];
      if (!slot) throw new Error(`Invalid slot: ${bookingData.slot}`);

      // Convert the local Netherlands slot start to UTC
      const slotStartUTC = DateTime.fromISO(
        `${bookingData.date}T${slot.start}`,
        { zone: "Europe/Amsterdam" }
      )
        .toUTC()
        .toISO(); // e.g. "2025-10-22T06:00:00Z"

      const now = DateTime.now().setZone("Europe/Amsterdam");
      const slotStart = DateTime.fromISO(`${bookingData.date}T${slot.start}`, {
        zone: "Europe/Amsterdam",
      });

      const daysUntilBooking = slotStart.diff(now, "days").days;

      if (daysUntilBooking < settings.advancedBooking) {
        toast({
          variant: "destructive",
          title: "Te laat om te boeken",
          description: `Je moet minstens ${settings.advancedBooking} dagen van tevoren reserveren.`,
        });
        return;
      }

      const resp = await fetch(
        "https://njmscbbdzkdvgkdnylxx.supabase.co/functions/v1/ideal-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            bookingData,
            price: selectedRoom.price,
            roomId: selectedRoom.roomId,
            date: selectedRoom.date,
            slot: selectedRoom.slot,
            paymentType: "ideal",
          }),
        }
      );

      const data = await resp.json();
      const cs = data.client_secret ?? data.clientSecret ?? null;
      const pk = data.publishableKey ?? data.publishable_key ?? null;

      if (!cs || !pk)
        throw new Error(
          "Het is niet gelukt om een ​​betalingsintentie aan te maken"
        );

      // First update the state
      setClientSecret(cs);
      setPublishableKey(pk);
      const promise = loadStripe(pk);
      setStripePromise(promise);

      // Then, after state updates, open the Stripe dialog
      setTimeout(() => {
        setIsPaymentDialogOpen(false);
        setIsIDealPaymentDialogOpen(true);
      }, 0);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: err.message || "Betalingsinstelling mislukt",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Boekruimte</h1>
            <p className="text-primary mt-1">
              Selecteer een tijdslot om beschikbare plaatsen te bekijken
            </p>
          </div>

          <div className="flex gap-2">
            {/* Month Navigator */}
            <div className="flex items-center border rounded-lg bg-secondary">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary"
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
              <span className="px-4 py-2 text-primary">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary"
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
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-primary"
                >
                  Week{" "}
                  {weeksOfMonth.findIndex(
                    (w) => selectedDate >= w.start && selectedDate <= w.end
                  ) + 1}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 bg-secondary">
                <div className="space-y-2">
                  {weeksOfMonth.map((w) => (
                    <Button
                      key={w.week}
                      variant="ghost"
                      className="w-full justify-start text-primary hover:text-secondary"
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
                <p className="font-semibold text-primary">
                  {(() => {
                    const weekday = day.toLocaleDateString("nl-NL", {
                      weekday: "long",
                    });
                    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
                  })()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {day.toLocaleDateString()}
                </p>
              </div>
              {/* {timeslots.map((slot) => {
                const slotDate = new Date(day); // clone the current day
                slotDate.setHours(slot.start.h, slot.start.m, 0, 0);

                // const isPast =
                //   day < new Date(now.toDateString()) || // any past day
                //   (day.toDateString() === now.toDateString() &&
                //     slotDate <= now); // today & already past
                const isPast =
                  slotDateTime < amsterdamNow.startOf("day") || // past days
                  slotDateTime <= amsterdamNow; // same day but time already passed */}
              {timeslots.map((slot) => {
                const slotDate = new Date(day); // clone the day
                slotDate.setHours(slot.start.h, slot.start.m, 0, 0);

                // Convert both to Amsterdam zone
                const slotDateTime = DateTime.fromJSDate(slotDate, {
                  zone: "Europe/Amsterdam",
                });
                const amsterdamNow = DateTime.now().setZone("Europe/Amsterdam");

                const isPast =
                  slotDateTime < amsterdamNow.startOf("day") || // past days
                  slotDateTime <= amsterdamNow; // same day but time already passed

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
                      {slot.range}{" "}
                      <span className="block text-[10px] italic text-gray-400">
                        (Tijd in Amsterdam)
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Beschikbare kamers
            </DialogTitle>
            <DialogDescription>
              {selectedSlot &&
                `${
                  selectedSlot.slot.name
                } on ${selectedSlot.day.toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>

          {loadingRooms ? (
            <p>Kamers laden...</p>
          ) : availableRooms.length === 0 ? (
            <p className="text-muted-foreground">Geen kamers beschikbaar.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {availableRooms.map((room) => (
                <Card
                  key={room.id}
                  className="overflow-hidden cursor-pointer"
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
                      Prijs:{" "}
                      {selectedSlot?.slot.name === "Ochtend"
                        ? room.Morning_price
                        : selectedSlot?.slot.name === "Middag"
                        ? room.Afternoon_price
                        : selectedSlot?.slot.name === "Avond"
                        ? room.Night_price
                        : room.Morning_price + room.Afternoon_price}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentDialogOpen(open);
          if (!open) {
            setClientSecret(null);
            setPublishableKey(null);
            setStripePromise(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kies methode</DialogTitle>
            <DialogDescription>
              {selectedRoom &&
                `${selectedRoom.name} op ${selectedRoom.date} (${selectedRoom.slot})`}
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4">
              <p className="font-semibold">Prijs: {selectedRoom.price}</p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="Instant"
                    name="payment"
                    value="Instant"
                    checked={paymentType === "Instant"}
                    onCheckedChange={() => {
                      setPaymentType("Instant");
                      setCheckboxOpen(false);
                    }}
                  />
                  <Label htmlFor="Instant">Directe betaling</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="Monthly"
                    name="payment"
                    value="Monthly"
                    checked={paymentType === "Monthly"}
                    onCheckedChange={() => {
                      setPaymentType("Monthly");
                      setCheckboxOpen(true);
                      // if (!selectedRoom) return;
                      // if (!profile.id) return;

                      // const bookingData = {
                      //   profileId: profile.id,
                      //   roomId: selectedRoom.roomId,
                      //   roomName: selectedRoom.name,
                      //   price: selectedRoom.price,
                      //   date: selectedRoom.date,
                      //   slot: selectedRoom.slot,
                      //   paymentType,
                      // };

                      // handleMonthlyBooking(bookingData);
                    }}
                  />
                  <Label htmlFor="Monthly">Betaal na een maand</Label>
                </div>
                {checkboxOpen && (
                  <div className="flex items-center space-x-2 pl-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) =>
                        setAgreeToTerms(checked === true)
                      }
                      required
                    />
                    <Label htmlFor="terms">
                      Ik ga akkoord met{" "}
                      <Link
                        to="/terms-conditions"
                        target="_blank"
                        className="text-primary underline"
                      >
                        Algemene voorwaarden
                      </Link>
                    </Label>
                  </div>
                )}
              </div>
              {paymentType === "Monthly" && (
                <Button
                  disabled={!agreeToTerms}
                  className="w-full py-3 border border-primary text-secondary bg-primary hover:bg-secondary hover:text-primary font-semibold"
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

                    handleMonthlyBooking(bookingData);
                    // setIsPaymentDialogOpen(false);
                    // setCheckboxOpen(true);
                  }}
                >
                  Bevestig boeking
                </Button>
              )}

              {paymentType === "Instant" && (
                <>
                  <Button
                    className="w-full py-3 border border-primary text-secondary bg-primary hover:bg-secondary hover:text-primary font-semibold"
                    onClick={async () => {
                      if (!selectedRoom) return;
                      if (!profile.id) return;

                      const bookingData = {
                        profileId: profile?.id,
                        profileEmail: profile?.email,
                        profileName: profile?.full_name,
                        roomId: selectedRoom.roomId,
                        roomName: selectedRoom.name,
                        price: selectedRoom.price,
                        date: selectedRoom.date,
                        slot: selectedRoom.slot,
                        paymentType,
                      };
                      setIsInstantLoading(true);
                      setIsIdealLoading(false);

                      try {
                        await handleInstantBooking(bookingData);
                        // await IdealPaymentForm(bookingData);
                      } finally {
                        setIsInstantLoading(false); // stop loading
                      }
                    }}
                    disabled={isInstantLoading || isIdealLoading} // disable both if either is loading
                  >
                    {isInstantLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Betaling verwerken...
                      </>
                    ) : (
                      "Betaal met kaart 💳"
                    )}
                  </Button>
                  <Button
                    className="w-full py-3 border border-primary text-secondary bg-primary hover:bg-secondary hover:text-primary font-semibold"
                    onClick={async () => {
                      if (!selectedRoom) return;
                      if (!profile.id) return;

                      const bookingData = {
                        profileId: profile?.id,
                        profileEmail: profile?.email,
                        profileName: profile?.full_name,
                        roomId: selectedRoom.roomId,
                        roomName: selectedRoom.name,
                        price: selectedRoom.price,
                        date: selectedRoom.date,
                        slot: selectedRoom.slot,
                        paymentType,
                      };
                      setIsIdealLoading(true);
                      setIsInstantLoading(false);

                      try {
                        // await handleInstantBooking(bookingData);
                        await handleIDealBooking(bookingData);
                      } finally {
                        setIsIdealLoading(false); // stop loading
                      }
                    }}
                    disabled={isInstantLoading || isIdealLoading}
                  >
                    {isIdealLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Bankverwerking...
                      </>
                    ) : (
                      "Betaal met iDEAL 🏦"
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isStripePaymentDialogOpen}
        onOpenChange={setIsStripePaymentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bevestig boeking</DialogTitle>
            <DialogDescription>
              {selectedRoom &&
                `${selectedRoom.name} op ${selectedRoom.date} (${selectedRoom.slot}) - ${selectedRoom.price}`}
            </DialogDescription>
          </DialogHeader>
          {stripePromise && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentFields
                bookingData={{
                  profileId: profile?.id,
                  profileEmail: profile?.email,
                  profileName: profile?.full_name,
                  roomId: selectedRoom.roomId,
                  roomName: selectedRoom.name,
                  price: selectedRoom.price,
                  date: selectedRoom.date,
                  slot: selectedRoom.slot,
                  paymentType,
                }}
                clientSecret={clientSecret}
                onPaid={() => {
                  setIsStripePaymentDialogOpen(false);
                  setIsPaymentDialogOpen(false);
                }}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isIDealPaymentDialogOpen}
        onOpenChange={setIsIDealPaymentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>iDeal</DialogTitle>
            <DialogDescription>
              {selectedRoom &&
                `${selectedRoom.name} op ${selectedRoom.date} (${selectedRoom.slot}) - ${selectedRoom.price}`}
            </DialogDescription>
          </DialogHeader>
          {stripePromise && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <IdealPayment
                bookingData={{
                  profileId: profile?.id,
                  profileEmail: profile?.email,
                  profileName: profile?.full_name,
                  roomId: selectedRoom.roomId,
                  roomName: selectedRoom.name,
                  price: selectedRoom.price,
                  date: selectedRoom.date,
                  slot: selectedRoom.slot,
                  paymentType,
                }}
                clientSecret={clientSecret}
                onPaid={() => {
                  setIsIDealPaymentDialogOpen(false);
                  setIsPaymentDialogOpen(false);
                }}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isMonthlyStripePaymentDialogOpen}
        onOpenChange={setIsMonthlyStripePaymentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Voer kaartgegevens in</DialogTitle>
            <DialogDescription>
              {selectedRoom &&
                `${selectedRoom.name} op ${selectedRoom.date} (${selectedRoom.slot}) - ${selectedRoom.price}`}
            </DialogDescription>
          </DialogHeader>

          <MonthlyPaymentWrapper
            bookingData={{
              profileId: profile?.id,
              profileEmail: profile?.email,
              profileName: profile?.full_name,
              roomId: selectedRoom?.roomId,
              roomName: selectedRoom?.name,
              price: selectedRoom?.price,
              date: selectedRoom?.date,
              slot: selectedRoom?.slot,
              paymentType,
            }}
            onSuccess={() => setIsMonthlyStripePaymentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
