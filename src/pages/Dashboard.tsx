import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // adjust to your setup
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [settings, setSettings] = useState<Settings | null>(null);

  const weekDates = getWeekDates(selectedDate);
  const now = new Date();

  // Fetch settings once
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from("settings").select("*").single();
      if (error) {
        console.error(error);
      } else {
        setSettings(data as Settings);
      }
    };
    fetchSettings();
  }, []);

  // Build timeslots dynamically
  const timeslots = settings
    ? [
        {
          name: "Morning",
          range: `${settings.morningSessionStart} - ${settings.morningSessionEnd}`,
          startHour: parseInt(settings.morningSessionStart.split(":")[0]),
        },
        {
          name: "Afternoon",
          range: `${settings.afternoonSessionStart} - ${settings.afternoonSessionEnd}`,
          startHour: parseInt(settings.afternoonSessionStart.split(":")[0]),
        },
        {
          name: "Evening",
          range: `${settings.eveningSessionStart} - ${settings.eveningSessionEnd}`,
          startHour: parseInt(settings.eveningSessionStart.split(":")[0]),
        },
        {
          name: "Full Day",
          range: `${settings.morningSessionStart} - ${settings.afternoonSessionEnd}`,
          startHour: parseInt(settings.morningSessionStart.split(":")[0]),
        },
      ]
    : [];

  // Weeks in current month
  const weeksOfMonth = (() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

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
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2">
                {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
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
                <p className="text-sm text-muted-foreground">{day.toLocaleDateString()}</p>
              </div>
              {timeslots.map((slot) => {
                const isPast =
                  day < new Date(now.toDateString()) ||
                  (day.toDateString() === now.toDateString() &&
                    slot.startHour <= now.getHours());

                return (
                  <Card
                    key={slot.name}
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
    </div>
  );
};

export default Dashboard;
