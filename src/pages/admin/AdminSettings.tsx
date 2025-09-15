import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
import { Settings, Database, Mail, Bell, Shield, Globe } from "lucide-react";

const AdminSettings = () => {
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

  const { toast } = useToast();

  useEffect(() => {
    fetchbusinessHrsSettings();
    fetchBookingSettings();
  }, []);

  const fetchbusinessHrsSettings = async () => {
    try {
      const data = {
        morningSessionStart: "08:00",
        morningSessionEnd: "13:00",

        afternoonSessionStart: "13:00",
        afternoonSessionEnd: "18:00",

        eveningSessionStart: "18:00",
        eveningSessionEnd: "22:00",
      };
      setBusinessHrs({
        morningSessionStart: data?.morningSessionStart || "08:00",
        morningSessionEnd: data?.morningSessionEnd || "13:00",

        afternoonSessionStart: data?.afternoonSessionStart || "13:00",
        afternoonSessionEnd: data?.afternoonSessionEnd || "18:00",

        eveningSessionStart: data?.eveningSessionStart || "18:00",
        eveningSessionEnd: data?.eveningSessionEnd || "22:00",
      });
    } catch (error) {
      console.error("Error fetching business Hrs settings:", error);
    }
  };

  const fetchBookingSettings = async () => {
    try {
      const data = { advancedBooking: "7", cancelationPolicy: "7" };
      await setBookingRules({
        advancedBooking: data?.advancedBooking || "",
        cancelationPolicy: data?.cancelationPolicy || "",
      });
    } catch (error) {
      console.error("Error fetching booking settings:", error);
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

  const saveBusinessHrsSettings = async () => {
    try {
      toast({
        title: "Success",
        description: `Business hours settings saved successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const saveBusinessRulesSettings = async () => {
    try {
      toast({
        title: "Success",
        description: `Business rules settings saved successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    }
  };

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
      className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
      value={businessHrs.morningSessionStart}
      onChange={(e) =>
        updateBusinessHrsSetting("morningSessionStart", e.target.value)
      }
    />
    <input
      id="morningSessionEnd"
      type="time"
      className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
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
      className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
      value={businessHrs.afternoonSessionStart}
      onChange={(e) =>
        updateBusinessHrsSetting("afternoonSessionStart", e.target.value)
      }
    />
    <input
      id="afternoonSessionEnd"
      type="time"
      className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
      value={businessHrs.afternoonSessionEnd}
      onChange={(e) =>
        updateBusinessHrsSetting("afternoonSessionEnd", e.target.value)
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
      className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
      value={businessHrs.eveningSessionStart}
      onChange={(e) =>
        updateBusinessHrsSetting("eveningSessionStart", e.target.value)
      }
    />
    <input
      id="eveningSessionEnd"
      type="time"
      className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
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
              min="1"
              max="50"
              className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
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
              min="1"
              max="50"
              className="w-full border rounded-lg px-3 py-2 bg-background text-foreground"
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
