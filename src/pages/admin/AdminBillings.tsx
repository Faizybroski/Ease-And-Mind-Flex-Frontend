import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Euro, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserBillingDetailsPage from "@/pages/admin/UserBillingDetailsPage";

const AdminBilling = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState([]);

  useEffect(() => {
    if (profile && profile.role === "admin") {
      fetchBillingData();
    }
  }, [profile]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_billing");

      console.log("data ====> ", data);
      setBilling(data || []);
      if (error) {
        throw error;
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading billing data:", error);
      toast({
        title: "Fout",
        description: "Fout bij het laden van factuurgegevens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedId(null);
  };

  const handleViewMore = (userId: string) => {
    setSelectedId(userId);
  };

  if (selectedId) {
    return <UserBillingDetailsPage userId={selectedId} onBack={handleBack} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Het beheerdersdashboard wordt geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Facturatie en facturering
            </h1>
            <p className="text-primary text-sm">
              Beheer uw facturering van de afgelopen maand.
            </p>
          </div>
        </div>
      </header>

      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-0 m-0 overflow-x-auto flex flex-col gap-2">
          {billing.map((bill) => (
            <div
              key={bill.id}
              className="grid grid-cols-1 md:grid-cols-3 items-center p-3 border border-primary/50 hover:bg-secondary rounded-md gap-4"
            >
              <div>
                <p className="font-medium text-primary">{bill.full_name}</p>
                <span className="text-sm text-foreground">{bill.email}</span>
              </div>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-primary/70">
                    {bill.total_bookings}
                    {" boekingen"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Euro className="h-4 w-4 text-primary" />
                  <span className="text-primary/70">
                    {bill.revenue}
                    {" besteed"}
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="text-secondary bg-primary border border-primary hover:bg-secondary hover:text-primary"
                  onClick={() => handleViewMore(bill.user_id)}
                >
                  Bekijk meer
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBilling;
