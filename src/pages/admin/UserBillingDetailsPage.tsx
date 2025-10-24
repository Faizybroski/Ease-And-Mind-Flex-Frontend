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
  const [loading, setLoading] = useState(false);
  const userProfile = bookings[0]?.profiles;
  const { toast } = useToast();
  const fetchBookings = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    } catch {
      console.log("error");
    }
  };

  const monthlyPayment = async (user_id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "cron-monthly-payment-handler",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

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

                        const referenceDate = new Date(booking.start_date);
                        const monthStart = new Date(
                          referenceDate.getFullYear(),
                          referenceDate.getMonth(),
                          1
                        );
                        const monthEnd = new Date(
                          referenceDate.getFullYear(),
                          referenceDate.getMonth() + 1,
                          0
                        );
                        const month = referenceDate.toLocaleString("en-US", {
                          month: "long",
                          year: "numeric",
                        });

                        // prevent double payment
                        const { data: existing } = await supabase
                          .from("recurrings_payments")
                          .select("*")
                          .eq("booking_id", booking.id)
                          .eq("month", month)
                          .maybeSingle();

                        if (existing) {
                          toast({
                            title: "Warning",
                            description: `You have already completed payment for ${month}.`,
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
                        const recurrencePattern = booking.recurrence_pattern;
                        const dayTimeSlots = booking.day_time_slots || {};
                        const weekdays = booking.weekdays || [];

                        const { data: room, error: roomError } = await supabase
                          .from("rooms")
                          .select("*")
                          .eq("id", roomId)
                          .single();

                        if (roomError) {
                          console.error(
                            "Error fetching room:",
                            roomError.message
                          );
                          return;
                        }

                        const getSlotPrice = (slot) => {
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

                        const dutchToWeekdayNumber = {
                          zondag: 0,
                          maandag: 1,
                          dinsdag: 2,
                          woensdag: 3,
                          donderdag: 4,
                          vrijdag: 5,
                          zaterdag: 6,
                        };

                        const rangeStart =
                          subscriptionStartDate > monthStart
                            ? subscriptionStartDate
                            : monthStart;
                        const rangeEnd =
                          subscriptionEndDate < monthEnd
                            ? subscriptionEndDate
                            : monthEnd;

                        const occurrences = [];

                        if (
                          recurrencePattern === "Weekly" ||
                          recurrencePattern === "Bi-Weekly"
                        ) {
                          const selectedNums = weekdays.map(
                            (w) => dutchToWeekdayNumber[w.toLowerCase()]
                          );
                          let cursor = new Date(rangeStart);
                          while (cursor <= rangeEnd) {
                            if (selectedNums.includes(cursor.getDay())) {
                              occurrences.push(new Date(cursor));
                            }
                            cursor.setDate(cursor.getDate() + 1);
                          }
                        } else if (recurrencePattern === "Monthly") {
                          const monthlyDate = new Date(subscriptionStartDate);
                          const dateThisMonth = new Date(
                            monthStart.getFullYear(),
                            monthStart.getMonth(),
                            monthlyDate.getDate()
                          );
                          if (
                            dateThisMonth >= rangeStart &&
                            dateThisMonth <= rangeEnd
                          ) {
                            occurrences.push(dateThisMonth);
                          }
                        }

                        if (occurrences.length === 0) {
                          console.warn("⚠️ No slots found for this month:", {
                            recurrence: recurrencePattern,
                            rangeStart,
                            rangeEnd,
                            weekdays,
                          });
                          toast({
                            title: "No Slots",
                            description: `No recurring days fall within ${month}.`,
                          });
                          return;
                        }

                        // handle bi-weekly pattern
                        let validOccurrences = occurrences;
                        if (recurrencePattern === "Bi-Weekly") {
                          const startOfWeek = (d) => {
                            const clone = new Date(d);
                            const diff = (clone.getDay() + 6) % 7;
                            clone.setDate(clone.getDate() - diff);
                            clone.setHours(0, 0, 0, 0);
                            return clone;
                          };
                          const firstWeekStart = startOfWeek(occurrences[0]);
                          validOccurrences = occurrences.filter((occ) => {
                            const weekDiff =
                              (startOfWeek(occ) - firstWeekStart) /
                              (7 * 24 * 60 * 60 * 1000);
                            return weekDiff % 2 === 0;
                          });
                        }

                        const totalAmount = validOccurrences.reduce(
                          (sum, occ) => {
                            const dayNameDutch = occ
                              .toLocaleDateString("nl-NL", { weekday: "long" })
                              .toLowerCase();
                            const slot = Object.entries(dayTimeSlots).find(
                              ([k]) => k.toLowerCase() === dayNameDutch
                            )?.[1];
                            return sum + getSlotPrice(slot);
                          },
                          0
                        );

                        const amountInCents = totalAmount * 100;
                        if (amountInCents <= 0) {
                          console.warn("⚠️ No Charge: ", {
                            recurrence: recurrencePattern,
                            rangeStart,
                            rangeEnd,
                            weekdays,
                            month,
                            totalAmount,
                            amountInCents,
                            occurrences,
                            validOccurrences
                          });
                          toast({
                            title: "No Charge",
                            description: `No valid slots or prices found for ${month}.`,
                          });
                          return;
                        }

                        // Create Stripe checkout
                        const { data, error: checkoutError } =
                          await supabase.functions.invoke(
                            "create-checkout-session",
                            {
                              body: JSON.stringify({
                                amount: amountInCents,
                                bookingId: booking.id,
                                roomId,
                                month,
                                recurrencePattern,
                                validOccurrences: validOccurrences.map((d) =>
                                  d.toISOString()
                                ),
                                day_time_slots: booking.day_time_slots,
                              }),
                            }
                          );

                        if (checkoutError) throw checkoutError;

                        if (data?.url) {
                          navigator.clipboard.writeText(data.url);
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
                  <div className="flex">
                    <span className="text-primary mr-1">Status:</span>{" "}
                    <p
                      className={`${
                        booking.status === "Completed"
                          ? "text-green-600"
                          : booking.status === "Canceled"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {booking.status}
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
