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
  Settings,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

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
  payment_type: string;
  final_revenue: number;
  discount: number;
  payment_status: string;
  profiles?: {
    full_name?: string;
  };
  rooms?: {
    room_name: string;
  };
}

const Bookings = () => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, [userProfileId]);

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
      title: "Weet je het zeker?",
      description: "Hiermee wordt uw boeking geannuleerd.",
      action: (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                // Step 1: Fetch booking info
                const { data: booking, error: fetchError } = await supabase
                  .from("bookings")
                  .select("date, time_slot, payment_status")
                  .eq("id", bookingId)
                  .eq("user_id", userProfileId)
                  .single();

                if (fetchError || !booking)
                  throw fetchError || new Error("Boeking niet gevonden");

                // Step 2: Fetch cancellation policy / settings
                const { data: settings, error: settingsError } = await supabase
                  .from("settings")
                  .select("*")
                  .single();

                console.table(settings);

                if (settingsError || !settings)
                  throw (
                    settingsError || new Error("Instellingen niet gevonden")
                  );

                // Step 3: Check payment status
                if (booking.payment_status === "Completed") {
                  toast({
                    title: "Fout",
                    description:
                      "Het annuleren van de boeking is mislukt omdat de betaling niet restitueerbaar is.",
                    variant: "destructive",
                  });
                  return;
                }

                const bookingStart = DateTime.fromISO(booking.date, {
                  zone: "Europe/Amsterdam",
                });
                const now = DateTime.now().setZone("Europe/Amsterdam");

                const daysUntilStart = Math.floor(
                  bookingStart.diff(now, "days").days
                );
                const cancelPeriod = Number(settings.cancelationPolicy ?? 0);

                // Step 5: If booking started
                if (bookingStart <= now) {
                  toast({
                    title: "Niet toegestaan",
                    description: "Deze boeking is al begonnen of voorbij.",
                    variant: "destructive",
                  });
                  return;
                }

                // Step 6: If too late to cancel
                if (daysUntilStart < cancelPeriod) {
                  toast({
                    title: "Te laat om te annuleren",
                    description: `Annulering is alleen mogelijk tot ${cancelPeriod} dagen voor de boeking.`,
                    variant: "destructive",
                  });
                  return;
                }

                // Step 7: Update booking to canceled
                const { error: cancelError } = await supabase
                  .from("bookings")
                  .update({
                    status: "Canceled",
                    final_revenue: 0,
                    initial_revenue: 0,
                    discount: 0,
                  })
                  .eq("id", bookingId)
                  .eq("user_id", userProfileId);

                if (cancelError) {
                  toast({
                    title: "Fout",
                    description:
                      cancelError.message ||
                      "Het is niet gelukt om de boeking te annuleren.",
                    variant: "destructive",
                  });
                  return;
                }

                toast({
                  title: "Boeking geannuleerd",
                  description: `Uw boeking op ${bookingStart.toFormat(
                    "dd LLL yyyy"
                  )} is succesvol geannuleerd.`,
                });

                fetchMyBookings();
              } catch (err) {
                console.error("Error canceling booking:", err);
                toast({
                  variant: "destructive",
                  title: "Fout",
                  description:
                    "Het annuleren van de boeking is mislukt. Probeer het opnieuw.",
                });
              }
            }}
          >
            Yes
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Geannuleerd",
                description: "Boekingsannulering geannuleerd.",
              })
            }
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
          <h3 className="text-lg font-semibold mb-2">
            Geen boekingen gevonden
          </h3>
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
              className="flex flex-col md:flex-row justify-between items-start md:items-center bg-secondary border border-primary rounded-md shadow-sm p-4 gap-4"
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
                          ? new Date(booking.start_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "N/A"}{" "}
                        →{" "}
                        {booking.end_date
                          ? new Date(booking.end_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "Ongoing"}
                      </div>
                      <div>
                        <span className="font-medium">Patroon:</span>{" "}
                        {booking.recurrence_pattern}
                      </div>
                      {booking.weekdays && (
                        <div>
                          <span className="font-medium">Weekdagen:</span>{" "}
                          {booking.weekdays.join(", ")}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Tijdslot:</span>{" "}
                        {booking.is_recurring ? (
                          <div className="text-xs space-y-0.5">
                            {Object.entries(booking.day_time_slots || {}).map(
                              ([day, slot]) => (
                                <div key={day}>
                                  <span className="font-medium">{day}</span>:{" "}
                                  {slot}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div>{booking.time_slot}</div>
                        )}
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
                        <span className="font-medium">Initiële inkomsten:</span>{" "}
                        {booking.initial_revenue ?? 0}
                      </div>
                      <div>
                        <span className="font-medium">Korting:</span>{" "}
                        {booking.discount ?? 0}
                      </div>
                      <div>
                        <span className="font-medium">Eindopbrengst:</span>{" "}
                        {booking.final_revenue ?? 0}
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="font-medium">Winst:</span>{" "}
                      {booking.final_revenue ?? 0}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-primary min-w-[190px]">
                <span className="font-medium">Betalings status:</span>{" "}
                <span
                  className={`${
                    booking.payment_status === "Completed"
                      ? "text-green-800"
                      : booking.payment_status === "Failed"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  {booking?.payment_status || "Null"}
                </span>
                {!isRecurring && (
                  <div className="text-sm text-primary min-w-[150px]">
                    <span className="font-medium">Betaal methode:</span>{" "}
                    <span
                      className={`${
                        booking.payment_type === "Instant"
                          ? "text-green-800"
                          : "text-yellow-800"
                      }`}
                    >
                      {booking?.payment_type || "Instantly"}
                    </span>
                  </div>
                )}
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
                        Annuleren
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="">
                    <Button
                      className={`block w-full md:w-auto text-center  py-0.5 cursor-default ${
                        booking.status === "Completed"
                          ? "bg-green-200 text-green-800 px-12 hover:bg-green-200 hover:text-green-800"
                          : booking.status === "Canceled"
                          ? "bg-red-200 text-red-800 px-12 hover:bg-red-200 hover:text-red-800"
                          : "bg-yellow-200 text-yellow-800 px-[3.25rem] hover:bg-yellow-200 hover:text-yellow-800"
                      }`}
                    >
                      {booking.status || "In behandeling"}
                    </Button>
                  </div>
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
          <p className="text-muted-foreground">Boekingen laden...</p>
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
              <h1 className="text-3xl font-bold text-primary">
                Mijn boekingen
              </h1>
              <p className="text-primary mt-1">Beheer uw boekingen</p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="text-primary border border-primary bg-secondary hover:bg-primary hover:text-secondary mt-4 sm:mt-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Boeking maken
            </Button>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <div className="w-full overflow-x-auto">
              <TabsList className="flex w-max  space-x-2 px-2">
                <TabsTrigger value="all">Alle boekingen</TabsTrigger>
                <TabsTrigger value="Upcoming">Aankomende</TabsTrigger>
                <TabsTrigger value="Canceled">Geannuleerd</TabsTrigger>
                <TabsTrigger value="Completed">Voltooid</TabsTrigger>
                <TabsTrigger value="Recurring">Terugkerend</TabsTrigger>
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
