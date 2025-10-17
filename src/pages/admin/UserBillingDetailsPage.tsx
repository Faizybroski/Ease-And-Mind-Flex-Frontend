import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Clock, Euro } from "lucide-react";
import { weeksToDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
interface User {
  id: number | string;
  name: string;
  email: string;
}

const UserBillingDetailsPage = ({ userId, onBack }) => {
  // You can fetch details with react-query or props
  // Example mock data for now:
  const [bookings, setBookings] = useState([]);
  const userProfile = bookings[0]?.profiles;
  const { toast } = useToast();
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          profiles:user_id (
            id,
            full_name,
            email
          ),
          rooms:room_id(room_name)
        `
        )
        .eq("user_id", userId);

      if (error) throw error;
      console.table(data);

      setBookings(data);
    } catch {
      console.log("error");
    }
  };

  const monthlyPayment = async (user_id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "bright-handler",
        {
          // method: "POST",
          // headers: {
          //   "Content-Type": "application/json",
          //   Authorization: `Bearer ${token}`,
          // },
          body: JSON.stringify({
            user_id,
          }),
        }
      );

      if (error) throw error;

      // const data = await res.json();
      // if (data.url) window.location.href = data.url;
      if (data?.url) {
        // ✅ Safer clipboard copy with textarea fallback
        const textarea = document.createElement("textarea");
        textarea.value = data.url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        toast({
          title: "Payment Link Copied",
          description: "Payment link copied to clipboard",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Failed to copy Payment Link",
      });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (!userId) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {userProfile?.full_name}
          </h1>
          <p className="text-primary text-sm">{userProfile?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="text-primary bg-secondary hover:bg-primary border border-primary hover:text-secondary"
            variant="outline"
            onClick={onBack}
          >
            ← Rug
          </Button>
          <Button
            className="text-secondary bg-primary hover:bg-secondary border border-primary hover:text-primary"
            onClick={() => monthlyPayment(userProfile.id)}
          >
            Maandelijkse betaling
          </Button>
        </div>
      </header>

      <Card className="border-none bg-transparent shadow-none p-0 m-0">
        <CardContent className="p-0 m-0 overflow-x-auto flex flex-col gap-2">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="grid grid-cols-1 md:grid-cols-4 items-center p-3 border border-primary/50 hover:bg-secondary rounded-md gap-4"
            >
              <div>
                <p className="text-lg text-primary font-medium">
                  {booking.rooms.room_name}
                </p>
                <div className="flex items-center mt-1">
                  <Clock className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm text-primary/70">
                    {booking.time_slot}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:justify-center md:space-x-6 space-y-2 md:space-y-0 text-sm">
                <div className="flex items-center space-x-1 min-w-[200px] truncate">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  {booking.date && (
                    <span className="text-primary/70">{booking.date}</span>
                  )}
                  {booking.start_date && booking.end_date && (
                    <span className="text-primary/70">
                      {booking.start_date} - {booking.end_date}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 min-w-[120px]">
                <Euro className="h-4 w-4 text-primary shrink-0" />
                <span className="text-primary">{booking.final_revenue}</span>
                <span className="text-xs text-primary/50">revenue</span>
              </div>
              {booking.is_recurring && (
                <div>
                  <div className="flex">
                    <span className="text-primary mr-1">Betaling:</span>{" "}
                    <p
                      className={` ${
                        booking.payment_status === "Completed"
                          ? "text-green-600 font-medium"
                          : booking.payment_status === "Canceled"
                          ? "text-red-600 font-medium"
                          : "text-yellow-600 font-medium"
                      }`}
                    >
                      {booking.payment_status || "Recurring"}
                    </p>
                  </div>
                  <div className="flex justify-start mt-6">
                    <button
                      className="px-2 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out fs-6"
                      onClick={async () => {
                        const {
                          data: { session },
                        } = await supabase.auth.getSession();
                        const token = session?.access_token;
                        const roomId = booking.room_id;
                        const now = new Date();
                        const month = now.toLocaleString("en-US", {
                          month: "long",
                          year: "numeric",
                        });
                        const { data: existing, error: existingError } =
                          await supabase
                            .from("recurrings_payments")
                            .select("*")
                            .eq("booking_id", booking.id)
                            .eq("month", month)
                            .single();
                        if (existing) {
                          toast({
                            title: "Warning",
                            description: `You have already completed the payment for this booking this month.`,
                          });
                          return;
                        }
                        const parseLocalDate = (str) => {
                          const [y, m, d] = str.split("-").map(Number);
                          return new Date(y, m - 1, d);
                        };
                        const subscriptionStartDate = parseLocalDate(
                          booking.start_date
                        );
                        const subscriptionEndDate = parseLocalDate(
                          booking.end_date
                        );
                        const currentDate = new Date();
                        const recurrencePattern = booking.recurrence_pattern;
                        const rawWeekDays = booking.weekdays;
                        const monthStart = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          1
                        );
                        const monthEnd = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth() + 1,
                          0
                        );
                        const rangeStart =
                          subscriptionStartDate > monthStart
                            ? subscriptionStartDate
                            : monthStart;
                        const rangeEnd =
                          subscriptionEndDate < monthEnd
                            ? subscriptionEndDate
                            : monthEnd;

                        const datesInRange = [];
                        let d = new Date(rangeStart);
                        while (d <= rangeEnd) {
                          datesInRange.push(new Date(d));
                          d.setDate(d.getDate() + 1);
                        }

                        const weekdayMap = {
                          Sunday: 0,
                          Monday: 1,
                          Tuesday: 2,
                          Wednesday: 3,
                          Thursday: 4,
                          Friday: 5,
                          Saturday: 6,
                        };
                        let weekDaysArr = [];
                        if (Array.isArray(rawWeekDays))
                          weekDaysArr = rawWeekDays
                            .map((s) => s.trim())
                            .filter(Boolean);
                        else if (typeof rawWeekDays === "string")
                          weekDaysArr = rawWeekDays
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                        const allowedDays = weekDaysArr
                          .map((d) => weekdayMap[d])
                          .filter((v) => typeof v === "number");

                        const formatLocal = (dt) =>
                          `${dt.getFullYear()}-${String(
                            dt.getMonth() + 1
                          ).padStart(2, "0")}-${String(dt.getDate()).padStart(
                            2,
                            "0"
                          )}`;
                        const selectedDates = [];

                        if (recurrencePattern === "Weekly") {
                          for (const day of datesInRange)
                            if (allowedDays.includes(day.getDay()))
                              selectedDates.push(formatLocal(day));
                        } else if (recurrencePattern === "Bi-Weekly") {
                          let weekIndex = 0;
                          let startDate = new Date(rangeStart);
                          while (startDate <= rangeEnd) {
                            if (weekIndex % 2 === 0) {
                              for (let i = 0; i < 7; i++) {
                                const day = new Date(startDate);
                                day.setDate(startDate.getDate() + i);
                                if (
                                  day >= rangeStart &&
                                  day <= rangeEnd &&
                                  allowedDays.includes(day.getDay())
                                )
                                  selectedDates.push(formatLocal(day));
                              }
                            }
                            startDate.setDate(startDate.getDate() + 14);
                            weekIndex++;
                          }
                        } else if (recurrencePattern === "Monthly") {
                          for (const day of datesInRange)
                            if (allowedDays.includes(day.getDay()))
                              selectedDates.push(formatLocal(day));
                        }

                        const uniqueSorted = Array.from(
                          new Set(selectedDates)
                        ).sort((a, b) => new Date(a) - new Date(b));
                        const { data: room, error } = await supabase
                          .from("rooms")
                          .select("*")
                          .eq("id", roomId)
                          .single();
                        if (error)
                          return console.error(
                            "Error fetching room:",
                            error.message
                          );

                        const time_slot = booking.time_slot;
                        let price = 0;
                        if (time_slot === "Morning") price = room.Morning_price;
                        else if (time_slot === "Afternoon")
                          price = room.Afternoon_price;
                        else if (time_slot === "Night")
                          price = room.Night_price;

                        const totalAmount = price * uniqueSorted.length;
                        const amountInCents = totalAmount * 100;
                        const getMonthsInRange = (start, end) => {
                          const months = [];
                          const date = new Date(
                            start.getFullYear(),
                            start.getMonth(),
                            1
                          );
                          while (date <= end) {
                            months.push(
                              date.toLocaleString("en-US", {
                                month: "long",
                                year: "numeric",
                              })
                            );
                            date.setMonth(date.getMonth() + 1);
                          }
                          return months;
                        };

                        const subscriptionMonths = getMonthsInRange(
                          subscriptionStartDate,
                          subscriptionEndDate
                        );

                        // const res = await fetch(
                        //   "https://dzacjtnzwdvgzltnwcab.supabase.co/functions/v1/create-checkout-session",
                        const { data, error: checkoutError } =
                          await supabase.functions.invoke(
                            "create-checkout-session",
                            {
                              // method: "POST",
                              // headers: {
                              //   "Content-Type": "application/json",
                              //   Authorization: `Bearer ${token}`,
                              // },
                              body: JSON.stringify({
                                amount: amountInCents,
                                bookingId: booking.id,
                                roomId,
                                time_slot,
                                subscriptionStartDate: booking.start_date,
                                subscriptionEndDate: booking.end_date,
                                recurrencePattern,
                                selectedDates: uniqueSorted,
                                subscriptionMonths,
                              }),
                            }
                          );

                        if (checkoutError) throw checkoutError;

                        // const data = await res.json();
                        // if (data.url) window.location.href = data.url;
                        if (data?.url) {
                          // ✅ Safer clipboard copy with textarea fallback
                          const textarea = document.createElement("textarea");
                          textarea.value = data.url;
                          document.body.appendChild(textarea);
                          textarea.select();
                          document.execCommand("copy");
                          document.body.removeChild(textarea);

                          toast({
                            title: "Payment Link Copied",
                            description: "Payment link copied to clipboard",
                          });
                        }
                      }}
                    >
                      💳 Create Stripe Link
                    </button>
                  </div>
                </div>
              )}

              {!booking.is_recurring && (
                <div>
                  <div className="flex">
                    <span className="text-primary mr-1">Betaling:</span>{" "}
                    <p
                      className={` ${
                        booking.payment_status === "Completed"
                          ? "text-green-600 font-medium"
                          : booking.payment_status === "Canceled"
                          ? "text-red-600 font-medium"
                          : "text-yellow-600 font-medium"
                      }`}
                    >
                      {booking.payment_status}
                    </p>
                  </div>
                  <div className="flex">
                    <span className="text-primary mr-1">Type:</span>{" "}
                    <p
                      className={`${
                        booking.payment_type === "Instant"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {booking.payment_type}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBillingDetailsPage;
