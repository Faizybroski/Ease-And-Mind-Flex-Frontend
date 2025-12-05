import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type User = { id: string; full_name: string };
type Room = {
  id: number;
  room_name: string;
  Morning_price: number;
  Afternoon_price: number;
  Night_price: number;
};

export default function RecurringBookingDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [dayTimeSlots, setDayTimeSlots] = useState<Record<string, string>>({});
  const [recurrence, setRecurrence] = useState(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [discountPercent, setDiscountPercent] = useState<string>("0");
  const allWeekDays = [
    "Maandag",
    "Dinsdag",
    "Woensdag",
    "Donderdag",
    "Vrijdag",
    "Zaterdag",
    "Zondag",
  ];

  const weekDayMap: Record<string, number> = {
    Maandag: 1,
    Dinsdag: 2,
    Woensdag: 3,
    Donderdag: 4,
    Vrijdag: 5,
    Zaterdag: 6,
    Zondag: 0,
  };

  function generateRecurringDates({
    startDate,
    endDate,
    weekDays,
    dayTimeSlots,
    recurrence,
  }: {
    startDate: Date;
    endDate: Date;
    weekDays: string[];
    dayTimeSlots: Record<string, string>;
    recurrence: "Weekly" | "Bi-Weekly" | "Monthly";
  }) {
    const results: { date: Date; timeslot: string }[] = [];

    const interval =
      recurrence === "Weekly" ? 7 : recurrence === "Bi-Weekly" ? 14 : null; // monthly handled separately

    if (recurrence === "Monthly") {
      return generateMonthly(startDate, endDate, weekDays, dayTimeSlots);
    }

    // WEEKLY & BI-WEEKLY LOGIC
    for (const day of weekDays) {
      const targetDow = weekDayMap[day];

      // First matching date on/after startDate
      let d = new Date(startDate);
      while (d.getDay() !== targetDow) d.setDate(d.getDate() + 1);

      // Walk through range
      while (d <= endDate) {
        results.push({
          date: new Date(d),
          timeslot: dayTimeSlots[day],
        });

        d.setDate(d.getDate() + interval!);
      }
    }

    return results;
  }

  function generateMonthly(startDate, endDate, weekDays, dayTimeSlots) {
    const results = [];

    for (const day of weekDays) {
      const targetDow = weekDayMap[day];

      let d = new Date(startDate);

      while (d <= endDate) {
        // Find first matching weekday in this month
        let firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        while (firstOfMonth.getDay() !== targetDow)
          firstOfMonth.setDate(firstOfMonth.getDate() + 1);

        if (firstOfMonth >= startDate && firstOfMonth <= endDate) {
          results.push({
            date: new Date(firstOfMonth),
            timeslot: dayTimeSlots[day],
          });
        }

        // Move 1 month forward
        d.setMonth(d.getMonth() + 1);
      }
    }

    return results;
  }

  // function calculateTotalRevenue(
  //   startDate: Date,
  //   endDate: Date,
  //   weekDays: string[],
  //   recurrencePattern: "Weekly" | "Bi-Weekly" | "Monthly",
  //   slotPrice: number
  // ) {
  //   if (!recurrencePattern) return 0;

  //   let total = 0;
  //   let current = new Date(startDate);

  //   while (current <= endDate) {
  //     const day = current
  //       .toLocaleDateString("en-US", { weekday: "long" })
  //       .toLowerCase();

  //     if (weekDays.map((d) => d.toLowerCase()).includes(day)) {
  //       total++;
  //     }

  //     // always step by 1 day
  //     current.setDate(current.getDate() + 1);
  //   }

  //   // adjust total occurrences by recurrence pattern
  //   if (recurrencePattern === "Bi-Weekly") {
  //     total = Math.ceil(total / 2);
  //   } else if (recurrencePattern === "Monthly") {
  //     // rough approximation: only 1 occurrence per month per weekday
  //     const months =
  //       (endDate.getFullYear() - startDate.getFullYear()) * 12 +
  //       (endDate.getMonth() - startDate.getMonth()) +
  //       1;
  //     total = months * weekDays.length;
  //   }

  //   return total * slotPrice;
  // }

  // // computed values
  // const slotKey = timeSlot ? `${timeSlot}_price` : null;
  // const slotPrice =
  //   selectedRoom && slotKey
  //     ? (selectedRoom[slotKey as keyof Room] as number)
  //     : 0;

  // const revenueWithoutDiscount =
  //   startDate && endDate && slotPrice > 0 && weekDays.length > 0 && recurrence
  //     ? calculateTotalRevenue(
  //         startDate,
  //         endDate,
  //         weekDays,
  //         recurrence,
  //         slotPrice
  //       )
  //     : 0;

  // const discount = revenueWithoutDiscount * Number(discountPercent / 100);
  // const priceAfterDiscount = revenueWithoutDiscount - discount;

  function calculateTotalRevenue(
    startDate: Date,
    endDate: Date,
    dayTimeSlots: Record<string, string>,
    recurrencePattern: "Weekly" | "Bi-Weekly" | "Monthly",
    room: Room
  ) {
    if (!recurrencePattern || !room || !startDate || !endDate) return 0;

    const selectedDays = Object.keys(dayTimeSlots);
    if (selectedDays.length === 0) return 0;

    const dutchToWeekdayNumber = (dutch: string) => {
      const map: Record<string, number> = {
        zondag: 0,
        maandag: 1,
        dinsdag: 2,
        woensdag: 3,
        donderdag: 4,
        vrijdag: 5,
        zaterdag: 6,
      };
      return map[dutch.toLowerCase()];
    };

    const getSlotPrice = (slot: string) => {
      if (!slot) return 0;
      switch (slot) {
        case "Ochtend":
          return room.Morning_price;
        case "Middag":
          return room.Afternoon_price;
        case "Avond":
          return room.Night_price;
        case "Hele dag":
          return room.Morning_price + room.Afternoon_price;
        default:
          return 0;
      }
    };

    const occurrences: Date[] = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const selectedWeekdayNums = new Set(
      selectedDays.map((d) => dutchToWeekdayNumber(d))
    );

    while (cursor <= end) {
      if (selectedWeekdayNums.has(cursor.getDay())) {
        occurrences.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (occurrences.length === 0) return 0;

    const dayMap = {
      maandag: "Maandag",
      dinsdag: "Dinsdag",
      woensdag: "Woensdag",
      donderdag: "Donderdag",
      vrijdag: "Vrijdag",
      zaterdag: "Zaterdag",
      zondag: "Zondag",
    };

    if (recurrencePattern === "Weekly") {
      return occurrences.reduce((total, date) => {
        const dayNameDutch = date
          .toLocaleDateString("nl-NL", { weekday: "long" })
          .toLowerCase();
        const dayName = dayMap[dayNameDutch];
        const slot = dayTimeSlots[dayName];
        return total + getSlotPrice(slot);
      }, 0);
    }

    if (recurrencePattern === "Bi-Weekly") {
      const startOfWeek = (dt: Date) => {
        const d = new Date(dt);
        const day = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - day);
        return d.setHours(0, 0, 0, 0);
      };
      const firstWeekStart = startOfWeek(occurrences[0]);
      let total = 0;
      for (const occ of occurrences) {
        const currentWeekStart = startOfWeek(occ);
        const weekDifference = Math.round(
          (currentWeekStart - firstWeekStart) / (7 * 24 * 60 * 60 * 1000)
        );
        if (weekDifference % 2 === 0) {
          const dayNameDutch = occ
            .toLocaleDateString("nl-NL", { weekday: "long" })
            .toLowerCase();
          const dayName = dayMap[dayNameDutch];
          const slot = dayTimeSlots[dayName];
          total += getSlotPrice(slot);
        }
      }
      return total;
    }

    if (recurrencePattern === "Monthly") {
      const monthlyPatterns = new Set<string>();
      const processedDays = new Set<string>();

      for (const occ of occurrences) {
        const dayName = occ
          .toLocaleDateString("nl-NL", { weekday: "long" })
          .toLowerCase();
        if (!processedDays.has(dayName)) {
          const weekOfMonth = Math.ceil(occ.getDate() / 7);
          monthlyPatterns.add(`${dayName}::${weekOfMonth}`);
          processedDays.add(dayName);
        }
      }

      return occurrences.reduce((total, date) => {
        const dayNameDutch = date
          .toLocaleDateString("nl-NL", { weekday: "long" })
          .toLowerCase();
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        const currentPattern = `${dayNameDutch}::${weekOfMonth}`;
        if (monthlyPatterns.has(currentPattern)) {
          const dayName = dayMap[dayNameDutch];
          const slot = dayTimeSlots[dayName];
          return total + getSlotPrice(slot);
        }
        return total;
      }, 0);
    }

    return 0;
  }

  const revenueWithoutDiscount =
    startDate && endDate && selectedRoom && recurrence
      ? calculateTotalRevenue(
          startDate,
          endDate,
          dayTimeSlots,
          recurrence,
          selectedRoom
        )
      : 0;

  const discount = revenueWithoutDiscount * (Number(discountPercent) / 100);
  const priceAfterDiscount = revenueWithoutDiscount - discount;

  useEffect(() => {
    const fetchData = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("role", "admin");

      const { data: roomsData } = await supabase.from("rooms").select("*");

      console.log("Rooms =====> ", roomsData);
      setUsers(profiles || []);
      setRooms(roomsData || []);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!selectedUser) {
      toast({
        title: "Fout",
        description: "Gebruiker is vereist",
        variant: "destructive",
      });
      return;
    }

    // 2. Room check
    if (!selectedRoom?.id) {
      toast({
        title: "Fout",
        description: "Kamer is vereist",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(dayTimeSlots).length === 0) {
      toast({
        title: "Fout",
        description: "Selecteer minimaal één dag en tijdslot.",
        variant: "destructive",
      });
      return;
    }

    const missingSlots = weekDays.filter((day) => !dayTimeSlots[day]);
    if (missingSlots.length > 0) {
      toast({
        title: "Fout",
        description: `Tijdslot ontbreekt voor: ${missingSlots.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // 5. Recurrence pattern
    if (!recurrence) {
      toast({
        title: "Fout",
        description: "Selecteer een herhalingspatroon.",
        variant: "destructive",
      });
      return;
    }

    // 6. Dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    if (!startDate) {
      toast({
        title: "Fout",
        description: "Startdatum is vereist",
        variant: "destructive",
      });
      return;
    }
    if (new Date(startDate) < today) {
      toast({
        title: "Fout",
        description: "De startdatum kan niet in het verleden liggen.",
        variant: "destructive",
      });
      return;
    }

    if (!endDate) {
      toast({
        title: "Fout",
        description: "Einddatum is vereist.",
        variant: "destructive",
      });
      return;
    }
    if (new Date(endDate) < today) {
      toast({
        title: "Fout",
        description: "Einddatum kan niet in het verleden liggen.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast({
        title: "Fout",
        description: "De einddatum kan niet vóór de startdatum liggen.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: selectedUser,
            room_id: selectedRoom?.id,
            // time_slot: timeSlot,
            day_time_slots: dayTimeSlots,
            initial_revenue: revenueWithoutDiscount,
            discount: discount,
            weekdays: weekDays,
            final_revenue: priceAfterDiscount,
            recurrence_pattern: recurrence,
            start_date: startDate?.toISOString().split("T")[0],
            end_date: endDate?.toISOString().split("T")[0],
            status: "Recurring",
            is_recurring: true,
          },
        ])
        .select("*");

      if (error) throw error;

      const booking = data?.[0];
      if (!booking) throw new Error("Could not retrieve booking");

      const generated = generateRecurringDates({
        startDate,
        endDate,
        weekDays,
        dayTimeSlots,
        recurrence,
      });

      console.log(generated);

      const { data: datesData, error: datesError } = await supabase
        .from("recurring_dates")
        .insert(
          generated.map((g) => ({
            booking_id: booking.id,
            room_id: selectedRoom.id,
            date: g.date.toISOString().split("T")[0],
            timeslot: g.timeslot,
          }))
        );

      if (datesError) throw datesError;

      onClose();
      toast({
        title: "Succes",
        description: "Terugkerende boeking opgeslagen",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Fout bij het opslaan van terugkerende boeking.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Boeking maken</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User dropdown */}
          <div>
            <Label>User</Label>
            <Select onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer gebruiker" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room dropdown */}
          <div>
            <Label>Kamer</Label>
            <Select
              onValueChange={(id) =>
                setSelectedRoom(rooms.find((r) => r.id === Number(id)) || null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer kamer" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.room_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Slot */}
          <div>
            <Label>Weekdagen & Tijdsloten</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {allWeekDays.map((day) => {
                const isSelected = weekDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`border rounded-lg p-3 flex flex-col gap-2 transition ${
                      isSelected ? "bg-secondary" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          setWeekDays((prev) =>
                            checked
                              ? [...prev, day]
                              : prev.filter((d) => d !== day)
                          );
                          if (!checked) {
                            // Remove its timeslot when unchecked
                            setDayTimeSlots((prev) => {
                              const updated = { ...prev };
                              delete updated[day];
                              return updated;
                            });
                          }
                        }}
                      />
                      <label htmlFor={day} className="capitalize font-medium">
                        {day}
                      </label>
                    </div>

                    {/* Only show timeslot selector if the day is selected */}
                    {isSelected && (
                      <Select
                        value={dayTimeSlots[day] || ""}
                        onValueChange={(val) =>
                          setDayTimeSlots((prev) => ({ ...prev, [day]: val }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer tijdslot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ochtend">Ochtend</SelectItem>
                          <SelectItem value="Middag">Middag</SelectItem>
                          <SelectItem value="Avond">Nacht</SelectItem>
                          <SelectItem value="Hele dag">Hele dag</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Startdatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {startDate ? startDate.toDateString() : "Kies een startdatum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  className="bg-secondary"
                  selected={startDate || undefined}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div>
            <Label>Einddatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {endDate ? endDate.toDateString() : "Kies een einddatum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  className="bg-secondary"
                  selected={endDate || undefined}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Herhaling</Label>
            <Select onValueChange={(val) => setRecurrence(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer Herhaling" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Wekelijks</SelectItem>
                <SelectItem value="Bi-Weekly">Tweewekelijks</SelectItem>
                <SelectItem value="Monthly">Maandelijks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discount */}
          <div>
            <Label>Korting (%)</Label>
            <Input
              min={0}
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              onFocus={() => {
                if (discountPercent === "0") setDiscountPercent("");
              }}
              onBlur={() => {
                if (discountPercent === "") setDiscountPercent("0");
              }}
            />
          </div>

          {/* Computed Summary */}
          <div className="space-y-1 text-sm">
            <p>
              Omzet (vóór korting): <b>{revenueWithoutDiscount}</b>
            </p>
            <p>
              Korting: <b>{discount}</b>
            </p>
            <p>
              Eindopbrengst: <b>{priceAfterDiscount}</b>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="text-primary hover:text-secondary"
            onClick={onClose}
          >
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            className="border border-primary text-secondary hover:text-primary hover:bg-secondary"
            disabled={!selectedUser || !selectedRoom || !dayTimeSlots}
          >
            Boeking opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
