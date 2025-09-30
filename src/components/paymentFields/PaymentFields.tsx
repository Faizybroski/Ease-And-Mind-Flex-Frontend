import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

const PaymentFields = ({
  bookingData,
  clientSecret,
  onPaid,
}: {
  bookingData: any;
  clientSecret: string | null;
  onPaid: () => void;
}) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState(bookingData.profileName || "");
  const [email, setEmail] = useState(bookingData.profileEmail || "");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment system not ready",
      });
      return;
    }
    setLoading(true);
    try {
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card!,
          billing_details: { name, email },
        },
      });
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: result.error.message || "Card error",
        });
        console.log("Error payment in instant payment");
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === "succeeded"
      ) {
        const { data: bookingD, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            room_id: bookingData.roomId,
            user_id: bookingData.profileId,
            date: bookingData.date,
            time_slot: bookingData.slot,
            final_revenue: bookingData.price,
            initial_revenue: bookingData.price,
            discount: 0,
            payment_type: bookingData.paymentType,
            status: "Upcoming",
            is_recurring: false,
            payment_status: "Pending",
            stripe_payment_intent_id: result.paymentIntent.id,
          })
          .select()
          .single();

        if (bookingError || !bookingD) {
          throw new Error(bookingError?.message || "Booking insert failed");
        }

        console.info("boooooking IDDD  ====> ", bookingD.id);

        // Insert payment linked to new booking
        const { data, error } = await supabase.rpc(
          "complete_payment_and_update_booking",
          {
            p_booking_id: bookingD.id,
            p_user_id: bookingData.profileId,
            p_amount: bookingData.price,
            p_method: bookingData.paymentType,
            p_stripe_payment_intent_id: result.paymentIntent.id,
          }
        );

        if (error) {
          console.error("Payment function failed:", error);
        } else {
          console.info("Payment + booking updated:", data);
        }

        toast({ title: "Success", description: "Room booked successfully" });
        onPaid();
      } else {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: "Unexpected result",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Payment error",
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
        placeholder="Cardholder name"
        className="w-full p-2 border rounded"
      />
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 border rounded"
      />
      <div className="p-3 border rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <Button
        className="w-full py-3 border border-primary text-secondary bg-primary hover:bg-secondary hover:text-primary font-semibold"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay & Confirm Booking"
        )}
      </Button>
    </div>
  );
};

export default PaymentFields;
