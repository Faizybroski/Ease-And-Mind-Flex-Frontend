import { useEffect, useState } from "react";
import {supabase} from "@/integrations/supabase/client"

export default function PaymentSuccess() {
  const [message, setMessage] = useState("Processing your payment...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get("bookingId");
    const subscriptionMonths = urlParams
      .get("subscriptionMonths")
      ?.split(",")
      .map((m) => m.trim());
    const amount = urlParams.get("amount");

    if (bookingId && amount) {
      const processPayment = async () => {
        try {
          const { data: bookingData, error: fetchError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId)
            .single();
          if (fetchError) throw fetchError;

          const now = new Date();
          const isoDate = now.toISOString();
          const yearMonthFormatted = now.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          });

          const { data: existing, error: fetchExistingError } = await supabase
            .from("recurrings_payments")
            .select("*")
            .eq("booking_id", bookingId)
            .eq("month", yearMonthFormatted)
            .single();

          if (fetchExistingError && fetchExistingError.code !== "PGRST116")
            throw fetchExistingError;

          if (existing) {
            const { error } = await supabase
              .from("recurrings_payments")
              .update({
                date: isoDate.split("T")[0],
                payment_status: "paid",
                payment_date: isoDate,
                payment_amount: parseInt(amount) / 100,
                created_at: isoDate,
              })
              .eq("booking_id", bookingId)
              .eq("month", yearMonthFormatted);

            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("recurrings_payments")
              .insert([
                {
                  booking_id: bookingId,
                  date: isoDate.split("T")[0],
                  month: yearMonthFormatted,
                  payment_status: "paid",
                  payment_date: isoDate,
                  payment_amount: parseInt(amount) / 100,
                  created_at: isoDate,
                },
              ]);
            if (error) throw error;
          }

          if (
            Array.isArray(subscriptionMonths) &&
            subscriptionMonths.length > 0
          ) {
            const { data: allPayments, error: checkError } = await supabase
              .from("recurrings_payments")
              .select("month")
              .eq("booking_id", bookingId);

            if (checkError) throw checkError;

            const paidMonths = allPayments.map((p) => p.month);
            const allMonthsPaid = subscriptionMonths.every((m) =>
              paidMonths.includes(m)
            );

            if (allMonthsPaid) {
              const { error: updateError } = await supabase
                .from("bookings")
                .update({ payment_status: "Completed" })
                .eq("id", bookingId);
              if (updateError) throw updateError;
              setMessage(
                "All recurring payments completed! Booking marked as Completed."
              );
            } else {
              setMessage(
                "Payment recorded. Waiting for remaining months to complete."
              );
            }
          } else {
            setMessage("Payment recorded successfully.");
          }
        } catch (err) {
          setMessage("Payment successful but failed during verification.");
          setErrorMessage(err.message || JSON.stringify(err));
        }
      };
      processPayment();
    } else {
      setMessage("Payment data missing from URL.");
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">{message}</h1>
        {errorMessage && (
          <p className="text-red-500 mb-4 break-words">{errorMessage}</p>
        )}
        <p className="text-gray-600">
          Thank you for your payment. You can now return to your bookings page.
        </p>
        <a
          href="/admin/bookings"
          className="mt-6 inline-block px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
        >
          Go to Bookings
        </a>
      </div>
    </div>
  );
}
