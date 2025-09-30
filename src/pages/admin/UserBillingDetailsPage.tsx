import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Clock, Euro } from "lucide-react";

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
        <Button
          className="text-primary bg-secondary hover:bg-primary border border-primary hover:text-secondary"
          variant="outline"
          onClick={onBack}
        >
          ← Back
        </Button>
      </header>

      <Card className="border-none bg-transparent shadow-none p-0 m-0">
        <CardContent className="p-0 m-0 overflow-x-auto flex flex-col gap-2">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="grid grid-cols-1 md:grid-cols-4 items-center p-3 border border-primary/50 hover:bg-secondary rounded-md gap-4"
            >
              {/* Left column */}
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

              {/* Middle column */}
              <div className="flex flex-col md:flex-row md:justify-center md:space-x-6 space-y-2 md:space-y-0 text-sm">
                {/* Date */}
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
                <div className="flex">
                  <span className="text-primary mr-1">Payment:</span>{" "}
                  <p
                    className={` ${
                      booking.payment_status === "Completed"
                        ? "text-green-600 font-medium"
                        : booking.payment_status === "Canceled"
                        ? "text-red-600 font-medium"
                        : "text-yellow-600 font-medium"
                    }`}
                  >
                    {booking.payment_status || "Null"}
                  </p>
                </div>
              )}

              {!booking.is_recurring && (
                <div>
                  <div className="flex">
                    <span className="text-primary mr-1">Payment:</span>{" "}
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
