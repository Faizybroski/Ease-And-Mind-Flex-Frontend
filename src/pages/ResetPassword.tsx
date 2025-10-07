import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) throw error;

      if (!error) {
        toast({
          title: "Wachtwoord bijgewerkt",
          description: "U kunt nu inloggen met uw nieuwe wachtwoord.",
        });
        window.location.href = "/";
      }
      setLoading(false);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Het is niet gelukt om het wachtwoord bij te werken.",
        variant: "destructive",
      });
      console.error("Error adding room", error);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h2 className="text-xl font-semibold mb-4">Uw wachtwoord opnieuw instellen</h2>
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Voer een nieuw wachtwoord in"
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Bijwerken..." : "Wachtwoord bijwerken"}
        </Button>
      </form>
    </div>
  );
}
