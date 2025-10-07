import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(
  "pk_test_51PQNwXCezvYlRgTYbcLb9jBbFx6C2uzRyb9PX1wZruDT6hzJSIfSN5Dvh8Yg9g3MnOSF1XuCTPJRJTgJaqVCzvfn00oNRrcHjy"
);

const MonthlyPaymentForm = ({ bookingData, onSuccess }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    // 1. Create Setup Intent via Supabase Edge Function
    const resp = await fetch(
      "https://dzacjtnzwdvgzltnwcab.supabase.co/functions/v1/create-setup-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          userId: bookingData.profileId,
          email: bookingData.profileEmail,
        }),
      }
    );

    const setupIntentData = await resp.json();

    if (setupIntentData.error) {
      throw new Error(setupIntentData.error);
    }

    const clientSecret =
      setupIntentData.clientSecret || setupIntentData.client_secret;
    const customerId = setupIntentData.customerId;

    if (!clientSecret || !customerId) {
      throw new Error("Failed to get Setup Intent or customer ID from server.");
    }

    // 2. Confirm Card Setup
    const card = elements.getElement(CardElement);
    if (!card) throw new Error("CardElement not found");
    const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // 3. Save the payment method ID in Supabase
    const { data, error: supabaseError } = await supabase
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
        payment_status: "Pending",
        is_recurring: false,
        stripe_payment_method_id: setupIntent.payment_method,
        stripe_customer_id: customerId,
      });

    if (supabaseError) {
      toast({
        title: "Fout",
        description: supabaseError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succes",
        description: "Reservering succesvol aangemaakt.",
        variant: "default",
      });
      onSuccess?.();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit}>
        <div className="p-3 border rounded">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        <Button
          className="w-full mt-3 py-3 border border-primary text-secondary bg-primary hover:bg-secondary hover:text-primary font-semibold"
          disabled={!stripe || loading}
          type="submit"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reserveren...
            </>
          ) : (
            "Boek maandelijks"
          )}
        </Button>
      </form>
    </div>
  );
};

export const MonthlyPaymentWrapper = ({ bookingData, onSuccess }: any) => (
  <Elements stripe={stripePromise}>
    <MonthlyPaymentForm bookingData={bookingData} onSuccess={onSuccess} />
  </Elements>
);