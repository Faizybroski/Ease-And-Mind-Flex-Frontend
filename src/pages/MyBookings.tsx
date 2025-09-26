import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Plus,
  Heart,
  UserCheck,
  Edit,
  Trash2,
  Eye,
  Share2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  date: string;
  user_id: string;
  status: string;
  time_slot: string;
  is_recurring: string;
  start_date: string;
  end_date: string;
  recurrence_pattern: string;
  weekdays: [];
  initial_revenue: number;
  final_revenue: number;
  discount: number;
  profiles?: {
    full_name?: string;
  };
  rooms?: {
    room_name: string;
  };
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        setUserProfileId(profile?.id || null);
        return profile?.id || null;
      } else {
        setUserProfileId(null);
        return null;
      }
    };

    getUserProfile().then((profileId) => {
      if (profileId) {
        fetchMyBookings(profileId);
      }
    });
  }, [user]);

  useEffect(() => {
    if (userProfileId) {
      fetchMyBookings(userProfileId);
    }
  }, [activeTab, userProfileId]);

  const fetchMyBookings = async (profileId?: string) => {
    const currentProfileId = profileId || userProfileId;
    if (!user || !currentProfileId) return;

    try {
      console.log(
        "Fetching bookings created by user:",
        user.id,
        "profile:",
        currentProfileId
      );

      // Fetch events created by the user
      const { data: userBookings, error: userError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          profiles:user_id (
            full_name
          ),
          rooms:room_id (
            room_name
          )
        `
        )
        .eq("user_id", currentProfileId)
        .order("created_at", { ascending: false });

      if (userError) {
        console.error("User bookings error:", userError);
        throw userError;
      }

      console.log("User bookings:", userBookings);

      const bookingsWithCounts = (userBookings || []).map((booking) => ({
        ...booking,
      }));

      setMyBookings(bookingsWithCounts);
    } catch (error: any) {
      console.error("Error fetching my bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = (bookingId: string) => {
    toast({
      title: "Are you sure?",
      description: "This will cancel your booking.",
      action: (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={async () => {
              const { error } = await supabase
                .from("bookings")
                .update({
                  status: "Canceled",
                  final_revenue: 0,
                  initial_revenue: 0,
                  discount: 0,
                })
                .eq("id", bookingId)
                .eq("user_id", userProfileId);

              if (error) {
                toast({
                  title: "Error",
                  description: error.message || "Failed to canceled booking",
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "Booking canceled",
                  description: "Your booking has been canceled successfully",
                });
                fetchMyBookings();
              }
            }}
          >
            Yes
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // just dismiss toast
              toast({
                title: "Cancelled",
                description: "Event cancelation cancelled.",
              });
            }}
          >
            No
          </Button>
        </div>
      ),
    });
  };

  const BookingCards = ({ bookings }: { bookings: Booking[] }) => {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
        </div>
      );
    }

    return (
<div className="space-y-4">
  {bookings.map((booking) => {
    const isCreator = booking.user_id === userProfileId;
    const isRecurring = booking.is_recurring;

    return (
      <Card
        key={booking.id}
        className="flex flex-col md:flex-row justify-between items-start md:items-center 
        bg-secondary border border-primary rounded-md shadow-sm p-4 gap-4"
      >
        {/* Left side: Booking Details */}
        <div className="flex flex-col sm:flex-row flex-wrap w-full items-start sm:items-center justify-between gap-4">
          {/* Room Name */}
          <div className="flex flex-col min-w-[150px]">
            <h3 className="text-primary text-lg font-bold break-words">
              {booking.rooms?.room_name}
            </h3>
          </div>

          {/* Booking Info */}
          <div className="flex flex-col text-sm text-primary min-w-[200px] max-w-full">
            {isRecurring ? (
              <>
                <div className="flex items-center flex-wrap">
                  <Calendar className="h-4 w-4 inline-block mr-2 text-primary/90" />
                  {booking.start_date
                    ? new Date(booking.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}{" "}
                  →{" "}
                  {booking.end_date
                    ? new Date(booking.end_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Ongoing"}
                </div>
                <div>
                  <span className="font-medium">Pattern:</span>{" "}
                  {booking.recurrence_pattern}
                </div>
                {booking.weekdays && (
                  <div>
                    <span className="font-medium">Weekdays:</span>{" "}
                    {booking.weekdays.join(", ")}
                  </div>
                )}
                <div>
                  <span className="font-medium">Time Slot:</span>{" "}
                  {booking.time_slot}
                </div>
              </>
            ) : (
              <div className="flex items-center flex-wrap">
                <Calendar className="h-4 w-4 inline-block mr-2 text-primary/90" />
                {booking.date
                  ? new Date(booking.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}{" "}
                - {booking.time_slot}
              </div>
            )}
          </div>

          {/* Revenue */}
          <div className="flex flex-col text-sm text-primary min-w-[160px]">
            {isRecurring ? (
              <>
                <div>
                  <span className="font-medium">Initial Revenue:</span>{" "}
                  {booking.initial_revenue ?? 0}
                </div>
                <div>
                  <span className="font-medium">Discount:</span>{" "}
                  {booking.discount ?? 0}
                </div>
                <div>
                  <span className="font-medium">Final Revenue:</span>{" "}
                  {booking.final_revenue ?? 0}
                </div>
              </>
            ) : (
              <div>
                <span className="font-medium">Revenue:</span>{" "}
                {booking.final_revenue ?? 0}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="w-full md:w-[200px] flex justify-start md:justify-end">
          {booking.status === "Upcoming" ? (
            <div className="flex gap-2 items-center">
              {/* Status */}
              <Button
                className={`px-2 py-0.5 cursor-default ${
                  booking.status === "Upcoming"
                    ? "bg-blue-200 text-blue-800 hover:bg-blue-200 hover:text-blue-800"
                    : "bg-yellow-200 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-800"
                }`}
              >
                {booking.status}
              </Button>

              {/* Cancel button */}
              {isCreator && (
                <Button
                  onClick={() => cancelBooking(booking.id)}
                  className="text-destructive bg-secondary border border-destructive hover:bg-destructive hover:text-secondary"
                >
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <Button
              className={`block w-full md:w-auto text-center px-2 py-0.5 cursor-default ${
                booking.status === "Completed"
                  ? "bg-green-200 text-green-800 hover:bg-green-200 hover:text-green-800"
                  : booking.status === "Canceled"
                  ? "bg-red-200 text-red-800 hover:bg-red-200 hover:text-red-800"
                  : "bg-yellow-200 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-800"
              }`}
            >
              {booking.status || "Pending"}
            </Button>
          )}
        </div>
      </Card>
    );
  })}
</div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin mx-auto border-4 border-peach-gold border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">My Bookings</h1>
              <p className="text-primary mt-1">Manage your bookings</p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="bg-secondary hover:bg-secondary/90 mt-4 sm:mt-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Booking
            </Button>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <div className="w-full overflow-x-auto">
              <TabsList className="flex w-max  space-x-2 px-2">
                <TabsTrigger value="all">All Bookings</TabsTrigger>
                <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="Canceled">Canceled</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
                <TabsTrigger value="Recurring">Recurring</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-4">
              <BookingCards bookings={myBookings} />
            </TabsContent>

            {["Upcoming", "Canceled", "Completed", "Recurring"].map(
              (status) => {
                const bookingsByStatus = myBookings.filter(
                  (b) => b.status === status
                );

                return (
                  <TabsContent
                    key={status}
                    value={status}
                    className="space-y-4"
                  >
                    <BookingCards bookings={bookingsByStatus} />
                  </TabsContent>
                );
              }
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
