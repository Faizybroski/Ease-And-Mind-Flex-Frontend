import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PaySuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    const finalizePayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      console.info(sessionId)

      if (sessionId) {
        await supabase.functions.invoke("monthly-webhook", {
          body: { session_id: sessionId },
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
