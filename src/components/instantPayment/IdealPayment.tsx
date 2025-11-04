import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Elements,
  useStripe,
  useElements,
  IdealBankElement,
} from "@stripe/react-stripe-js";

interface IdealPaymentProps {
  bookingData: any;
  clientSecret: string | null;
  onPaid: () => void;
}

const IdealPayment = ({
  bookingData,
  clientSecret,
  onPaid,
}: IdealPaymentProps) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState(bookingData.profileName || "");
  const [email, setEmail] = useState(bookingData.profileEmail || "");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !clientSecret) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Stripe is nog niet klaar om te betalen.",
      });
      return;
    }

    setLoading(true);
    try {
      const idealBank = elements.getElement(IdealBankElement);

      const { data: bookingD, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: bookingData.profileId,
          room_id: bookingData.roomId,
          date: bookingData.date,
          time_slot: bookingData.slot,
          final_revenue: bookingData.price,
          initial_revenue: bookingData.price,
          discount: 0,
          payment_type: bookingData.paymentType,
          status: "Upcoming",
          is_recurring: false,
          payment_status: "Pending",
        })
        .select()
        .single();
      if (bookingError) throw new Error(bookingError.message);

      if (bookingError || !bookingD) {
        throw new Error(bookingError?.message || "Boeking invoegen mislukt");
      }

      // Include everything you need in the return URL
      const returnUrl =
        `${window.location.origin}/payment-success?` +
        new URLSearchParams({
          booking_id: bookingD.id,
          user_id: bookingData.profileId,
          amount: bookingData.price.toString(),
          method: bookingData.paymentType,
        }).toString();

      const result = await stripe.confirmIdealPayment(clientSecret, {
        payment_method: {
          ideal: idealBank, // ✅ link the bank element
          billing_details: { name, email },
        },
        return_url: returnUrl,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Betaling mislukt",
          description:
            result.error.message ||
            "Er is een fout opgetreden bij de betaling.",
        });
      }

      // ⚠️ For iDEAL, you will NOT get success immediately.
      // Stripe redirects the user, and your success page verifies payment status.
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Betalingsfout",
        description: error.message || "Er is iets misgegaan met de betaling.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Naam rekeninghouder"
        className="w-full p-2 border rounded"
      />
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail"
        className="w-full p-2 border rounded"
      />
      <div className="p-3 border rounded">
        <IdealBankElement />
      </div>

      <Button
        className="w-full py-3 border border-primary text-secondary bg-primary hover:bg-secondary hover:text-primary font-semibold"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verwerken...
          </>
        ) : (
          "Betaal met iDEAL"
        )}
      </Button>
    </div>
  );
};

export default IdealPayment;
