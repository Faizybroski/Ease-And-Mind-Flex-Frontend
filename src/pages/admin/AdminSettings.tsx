import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [businessHrs, setBusinessHrs] = useState({
    morningSessionStart: "08:00",
    morningSessionEnd: "13:00",

    afternoonSessionStart: "13:00",
    afternoonSessionEnd: "18:00",

    eveningSessionStart: "18:00",
    eveningSessionEnd: "22:00",
  });

  const [bookingRules, setBookingRules] = useState({
    advancedBooking: "7",
    cancelationPolicy: "7",
  });

  const [roomCode, setRoomCode] = useState("");

  const [settingsId, setSettingsId] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      if (error) throw error;

      setSettingsId(data.id);
      const formatTimeForInput = (val: string | null) => {
        if (!val) return "";
        // Remove seconds and timezone
        return val.slice(0, 5); // "18:00:00+00" → "18:00"
      };

      setBusinessHrs({
        morningSessionStart:
          formatTimeForInput(data?.morningSessionStart) || "00:00",
        morningSessionEnd:
          formatTimeForInput(data?.morningSessionEnd) || "00:00",
        afternoonSessionStart:
          formatTimeForInput(data?.afternoonSessionStart) || "00:00",
        afternoonSessionEnd:
          formatTimeForInput(data?.afternoonSessionEnd) || "00:00",
        eveningSessionStart:
          formatTimeForInput(data?.eveningSessionStart) || "00:00",
        eveningSessionEnd:
          formatTimeForInput(data?.eveningSessionEnd) || "00:00",
      });

      setBookingRules({
        advancedBooking: data?.advancedBooking?.toString() || "0",
        cancelationPolicy: data?.cancelationPolicy?.toString() || "0",
      });

      setRoomCode(data?.room_code);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessHrsSetting = (key: string, value: any) => {
    setBusinessHrs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateBookingRulesSetting = (key: string, value: any) => {
    setBookingRules((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateRoomCode = async (val: any) => {
    setRoomCode(val);
  };

  const saveBusinessHrsSettings = async () => {
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          morningSessionStart: businessHrs.morningSessionStart,
          morningSessionEnd: businessHrs.morningSessionEnd,
          afternoonSessionStart: businessHrs.afternoonSessionStart,
          afternoonSessionEnd: businessHrs.afternoonSessionEnd,
          eveningSessionStart: businessHrs.eveningSessionStart,
          eveningSessionEnd: businessHrs.eveningSessionEnd,
        })
        .eq("id", settingsId);

      if (error) throw error;

      fetchSettings();

      toast({
        title: "Success",
        description: "Business hours settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
      console.error("Error save settings", error);
    }
  };

  const saveBusinessRulesSettings = async () => {
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          advancedBooking: Number(bookingRules.advancedBooking),
          cancelationPolicy: Number(bookingRules.cancelationPolicy),
        })
        .eq("id", settingsId);

      if (error) throw error;

      fetchSettings();

      toast({
        title: "Success",
        description: "Booking rules settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
      console.error("Error save settings", error);
    }
  };

  const saveRoomCode = async () => {
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          room_code: roomCode,
        })
        .eq("id", settingsId);

      if (error) throw error;

      fetchSettings();

      toast({
        title: "Success",
        description: "Room Code saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
      console.error("Error save settings", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Booking Management
              </h1>
              <p className="text-primary text-sm">Manage all Bookings</p>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading Bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex text-3xl font-bold text-primary mb-2">
              Settings
            </h1>
            <p className="text-primary text-sm">Manage your system settings</p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <span>Room Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-primary" htmlFor="roomCode">
              Room Code
            </Label>
            <Input
              id="roomCode"
              className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground"
              value={roomCode}
              onChange={(e) => updateRoomCode(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-primary"
              onClick={() => saveRoomCode()}
            >
              Save Room Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            Business Hours Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-primary" htmlFor="morningSessionStart">
              Morning Session
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <input
                id="morningSessionStart"
                type="time"
                className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground "
                value={businessHrs.morningSessionStart}
                onChange={(e) =>
                  updateBusinessHrsSetting(
                    "morningSessionStart",
                    e.target.value
                  )
                }
              />
              <input
                id="morningSessionEnd"
                type="time"
                className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground"
                value={businessHrs.morningSessionEnd}
                onChange={(e) =>
                  updateBusinessHrsSetting("morningSessionEnd", e.target.value)
                }
              />
            </div>
          </div>

          {/* Afternoon Session */}
          <div>
            <Label className="text-primary" htmlFor="afternoonSessionStart">
              Afternoon Session
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <input
                id="afternoonSessionStart"
                type="time"
                className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground"
                value={businessHrs.afternoonSessionStart}
                onChange={(e) =>
                  updateBusinessHrsSetting(
                    "afternoonSessionStart",
                    e.target.value
                  )
                }
              />
              <input
                id="afternoonSessionEnd"
                type="time"
                className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground"
                value={businessHrs.afternoonSessionEnd}
                onChange={(e) =>
                  updateBusinessHrsSetting(
                    "afternoonSessionEnd",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* Night Session */}
          <div>
            <Label className="text-primary" htmlFor="eveningSessionStart">
              Night Session
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <input
                id="eveningSessionStart"
                type="time"
                className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground"
                value={businessHrs.eveningSessionStart}
                onChange={(e) =>
                  updateBusinessHrsSetting(
                    "eveningSessionStart",
                    e.target.value
                  )
                }
              />
              <input
                id="eveningSessionEnd"
                type="time"
                className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground"
                value={businessHrs.eveningSessionEnd}
                onChange={(e) =>
                  updateBusinessHrsSetting("eveningSessionEnd", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="w-full sm:w-auto text-primary"
              variant="outline"
              onClick={() => saveBusinessHrsSettings()}
            >
              Save Business Hours Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <span>Booking Rules</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-primary" htmlFor="advancedBooking">
              Advanced Booking
            </Label>
            <Input
              id="advancedBooking"
              type="number"
              min={1}
              max={30}
              className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground"
              value={bookingRules.advancedBooking}
              onChange={(e) =>
                updateBookingRulesSetting("advancedBooking", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-primary" htmlFor="cancelationPolicy">
              Cancelation Policy
            </Label>
            <Input
              id="cancelationPolicy"
              type="number"
              min={1}
              max={30}
              className="w-full border border-primary rounded-lg px-3 py-2 bg-background text-foreground"
              value={bookingRules.cancelationPolicy}
              onChange={(e) =>
                updateBookingRulesSetting("cancelationPolicy", e.target.value)
              }
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-primary"
              onClick={() => saveBusinessRulesSettings()}
            >
              Save Booking Policy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
