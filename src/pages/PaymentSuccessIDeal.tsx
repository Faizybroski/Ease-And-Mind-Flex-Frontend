import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function PaymentSuccessIDeal() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const bookingId = searchParams.get("booking_id");
      const userId = searchParams.get("user_id");
      const amount = Number(searchParams.get("amount"));
      const method = searchParams.get("method");
      const paymentIntentId = searchParams.get("payment_intent");
      const redirectStatus = searchParams.get("redirect_status");

      if (!paymentIntentId) return setStatus("failed");

      if (redirectStatus === "succeeded") {
        // ✅ Mark payment and booking as successful in Supabase
        await supabase.rpc("complete_payment_and_update_booking", {
          p_booking_id: bookingId,
          p_user_id: userId,
          p_amount: amount,
          p_method: method,
          p_stripe_payment_intent_id: paymentIntentId,
        });

        setStatus("success");
      } else {
        setStatus("failed");
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (status === "loading")
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin mr-2" /> Verwerken van betaling...
      </div>
    );

  if (status === "success")
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold text-green-600">
          ✅ Betaling geslaagd!
        </h1>
        <p className="mt-3 text-gray-700">Je kamer is succesvol geboekt.</p>
      </div>
    );

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold text-red-600">❌ Betaling mislukt</h1>
      <p className="mt-3 text-gray-700">
        Er is iets misgegaan. Probeer opnieuw.
      </p>
    </div>
  );
}
