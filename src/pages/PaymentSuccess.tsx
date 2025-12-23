import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { sendEmail } from "@/lib/sendEmail";

export default function PaySuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    const finalizePayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      const userId = params.get("user_id");
      const bookingId = params.get("booking_id");

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
          name
        )
      `
        )
        .eq("id", bookingId)
        .single();

      if (bookingError) {
        console.error(bookingError);
        return;
      }

      console.info(sessionId);

      if (sessionId) {
        await supabase.functions.invoke("monthly-webhook", {
          body: { session_id: sessionId },
        });

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

        <p>
          This payment was processed instantly. Any applicable VAT or taxes
          will be handled separately according to your invoice.
        </p>

        <p style="margin-top:24px;">
          Best regards,<br />
          <strong>The Ease & Mind Flex Spaces Team</strong>
        </p>
      `,
        });
      }
    };

    finalizePayment();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-5">
      <div className="max-w-sm w-full p-6 rounded-3xl shadow-lg border border flex flex-col items-center space-y-6">
        <h1
          className="text-center mt-4 font-script text-primary"
          style={{
            fontWeight: "bold",
            fontSize: "47px",
            lineHeight: "53px",
            padding: "0 5px",
          }}
        >
          You have paid your bill successfully!
        </h1>

        <Button onClick={() => navigate("/")}>
          <Calendar className="w-5 h-5" />
          Go to home
        </Button>
      </div>
    </div>
  );
}
