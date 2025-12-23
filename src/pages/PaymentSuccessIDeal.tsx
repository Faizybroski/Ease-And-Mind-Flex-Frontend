import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { sendEmail } from "@/lib/sendEmail";

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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error(profileError);
        return;
      }

      // 2️⃣ Fetch booking with room name
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select(
          `
          date,
          time_slot,
          final_revenue,
          rooms (
            room_name
          )
        `
        )
        .eq("id", bookingId)
        .single();

      if (bookingError) {
        console.error(bookingError);
        return;
      }

      if (!paymentIntentId) return setStatus("failed");

      if (redirectStatus === "succeeded") {
        console.log("🔍 Payment Success Params", {
          bookingId,
          userId,
          amount,
          method,
          paymentIntentId,
          redirectStatus,
        });
        // ✅ Mark payment and booking as successful in Supabase
        const { data: sqlData, error: sqlError } = await supabase.rpc(
          "complete_payment_and_update_booking",
          {
            p_booking_id: bookingId,
            p_user_id: userId,
            p_amount: amount,
            p_method: method,
            p_stripe_payment_intent_id: paymentIntentId,
          }
        );

        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .update({ stripe_payment_intent_id: paymentIntentId })
          .eq("id", bookingId)
          .single();

        if (sqlError) {
          console.error("❌ Supabase RPC error:", sqlError);
        } else {
          console.info("✅ Booking + payment updated:", sqlData);
        }

        if (bookingError) {
          console.error("❌ Supabase booking update error:", bookingError);
        } else {
          console.info("✅ Booking + payment updated:", bookingData);

          await sendEmail({
            to: [profile.email],
            subject: "Booking Payment Confirmed",
            html: `
              <p>Hi ${profile.full_name},</p>
          
              <p>
                Your booking has been successfully confirmed and paid via
                <strong>iDEAL</strong>.
              </p>
          
              <p><strong>Booking details:</strong></p>
              <ul>
                <li><strong>Room:</strong> ${booking.rooms.room_name}</li>
                <li><strong>Date:</strong> ${booking.date}</li>
                <li><strong>Time Slot:</strong> ${booking.time_slot}</li>
                <li>
                  <strong>Amount paid (excluding VAT & taxes):</strong>
                  ${booking.final_revenue}
                </li>
              </ul>
          
              <p>This payment was processed instantly. Any applicable VAT or taxes will be handled separately according to your invoice.</p>
          
              <p style="margin-top:24px;">
                Best regards,<br />
                <strong>The Ease & Mind Flex Spaces Team</strong>
              </p>
            `,
          });
        }

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
