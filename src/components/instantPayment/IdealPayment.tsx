import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useStripe } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

interface IdealPaymentProps {
  bookingData: any;
  clientSecret: string | null;
  onPaid: () => void;
}

const IdealPayment = ({ bookingData, clientSecret, onPaid }: IdealPaymentProps) => {
  const { user } = useAuth();
  const stripe = useStripe();
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
      const result = await stripe.confirmIdealPayment(clientSecret, {
        payment_method: {
          billing_details: { name, email },
        },
        return_url: `${window.location.origin}/payment-success?room=${bookingData.roomId}`,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Betaling mislukt",
          description: result.error.message || "Er is een fout opgetreden bij de betaling.",
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
