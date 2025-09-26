import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface codeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Code: React.FC<codeDialogProps> = ({ open, onOpenChange }) => {
  const [code, setCode] = useState(null);

  useEffect(() => {
    fetchCode();
  })

  const fetchCode = async () => {
    try {
      const { data: settings } = await supabase
        .from("settings")
        .select("room_code")
        .single();
      setCode(settings.room_code);
      console.log("Room Code:", settings.room_code);
    } catch (error) {
      console.log("error fetching code");
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg text-primary">Room Code</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <h1 className="text-primary text-center">{code}</h1>
            <div className="flex justify-end space-x-2">
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Code;
