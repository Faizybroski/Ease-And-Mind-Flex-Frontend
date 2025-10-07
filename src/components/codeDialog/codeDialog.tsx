import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, Copy } from "lucide-react";

interface codeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Code: React.FC<codeDialogProps> = ({ open, onOpenChange }) => {
  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchCode();
  }, [open]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 max-w-md">
        <DialogHeader className="flex items-center gap-2">
          <Lock className="text-primary w-5 h-5" />
          <DialogTitle className="text-lg font-semibold text-primary tracking-wide">
            Beveiligde kamercode
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Code box */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center justify-between bg-gradient-to-r from-primary/10 via-white to-primary/5 dark:from-primary/20 dark:via-gray-800 dark:to-primary/10 border border-primary/30 rounded-xl p-4"
          >
            <h1 className="text-3xl font-mono font-bold text-primary tracking-widest text-center flex-1">
              {code}
            </h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyCode}
              className="ml-2 hover:bg-primary/20 rounded-full"
            >
              {copied ? (
                <span className="text-xs text-green-500 font-semibold">✓</span>
              ) : (
                <Copy className="h-4 w-4 text-primary" />
              )}
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm text-muted-foreground text-center italic"
          >
            Gebruik deze code om je kamer binnen te komen. Houd het privé.
          </motion.p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default Code;
