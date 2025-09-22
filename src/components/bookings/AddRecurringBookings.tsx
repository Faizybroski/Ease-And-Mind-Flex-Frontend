import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/supabase/client";

type User = { id: string; full_name: string };
type Room = {
  id: number;
  room_name: string;
  price_morning: number;
  price_afternoon: number;
  price_night: number;
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
  const [weekDays, setWeekDays] = useState([]);
  const [recurrence, setRecurrence] = useState(null);
  const [timeSlot, setTimeSlot] = useState<
    "Morning" | "Afternoon" | "Night" | ""
  >("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const allWeekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  function calculateTotalRevenue(
    startDate: Date,
    endDate: Date,
    weekDays: string[],
    recurrencePattern: "Weekly" | "Bi-Weekly" | "Monthly",
    slotPrice: number
  ) {
    if (!recurrencePattern) return 0;

    let total = 0;
    let current = new Date(startDate);

    while (current <= endDate) {
      const day = current
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      if (weekDays.includes(day)) {
        total++;
      }

      // always step by 1 day
      current.setDate(current.getDate() + 1);
    }

    // adjust total occurrences by recurrence pattern
    if (recurrencePattern === "Bi-Weekly") {
      total = Math.ceil(total / 2);
    } else if (recurrencePattern === "Monthly") {
      // rough approximation: only 1 occurrence per month per weekday
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth()) +
        1;
      total = months * weekDays.length;
    }

    return total * slotPrice;
  }

  // computed values
  const slotKey = timeSlot ? `${timeSlot}_price` : null;
  const slotPrice =
    selectedRoom && slotKey
      ? (selectedRoom[slotKey as keyof Room] as number)
      : 0;

  const revenueWithoutDiscount =
    startDate && endDate && slotPrice > 0 && weekDays.length > 0 && recurrence
      ? calculateTotalRevenue(
          startDate,
          endDate,
          weekDays,
          recurrence,
          slotPrice
        )
      : 0;

  const discount = revenueWithoutDiscount * (discountPercent / 100);
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
    await supabase.from("bookings").insert([
      {
        user_id: selectedUser,
        room_id: selectedRoom?.id,
        time_slot: timeSlot,
        initial_revenue: revenueWithoutDiscount,
        discount: discount,
        weekdays: weekDays,
        final_revenue: priceAfterDiscount,
        recurrence_pattern: recurrence,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        status: "Recurring",
        is_recurring: true,
      },
    ]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User dropdown */}
          <div>
            <Label>User</Label>
            <Select onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
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
            <Label>Room</Label>
            <Select
              onValueChange={(id) =>
                setSelectedRoom(rooms.find((r) => r.id === Number(id)) || null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
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
            <Label>Time Slot</Label>
            <Select onValueChange={(val) => setTimeSlot(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeslot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Afternoon">Afternoon</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Weekdays</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {allWeekDays.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={weekDays.includes(day)}
                    onCheckedChange={(checked) => {
                      setWeekDays((prev) =>
                        checked ? [...prev, day] : prev.filter((d) => d !== day)
                      );
                    }}
                  />
                  <label htmlFor={day} className="capitalize">
                    {day}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {startDate ? startDate.toDateString() : "Pick a start date"}
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
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {endDate ? endDate.toDateString() : "Pick an end date"}
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
            <Label>Recurrence</Label>
            <Select onValueChange={(val) => setRecurrence(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discount */}
          <div>
            <Label>Discount (%)</Label>
            <Input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
            />
          </div>

          {/* Computed Summary */}
          <div className="space-y-1 text-sm">
            <p>
              Revenue (before discount): <b>{revenueWithoutDiscount}</b>
            </p>
            <p>
              Discount: <b>{discount}</b>
            </p>
            <p>
              Final Revenue: <b>{priceAfterDiscount}</b>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            className="text-primary hover:text-secondary"
            onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="border border-primary text-secondary hover:text-primary hover:bg-secondary"
            disabled={!selectedUser || !selectedRoom || !timeSlot}
          >
            Save Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
