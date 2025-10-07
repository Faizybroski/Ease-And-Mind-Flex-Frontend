import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../ui/logo";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        if (!email.trim()) {
          toast({
            title: "Ontbrekende e-mail",
            description: "Voer uw e-mailadres in.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!password.trim()) {
          toast({
            title: "Wachtwoord ontbreekt",
            description: "Voer uw wachtwoord in.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await signIn(email.trim(), password.trim(), "user");
        if (!error) {
          toast({
            title: "Welkom terug!",
            description: "Succesvol aangemeld.",
          });
        }
        if (error) throw error;
      } else {
        if (!fullName.trim()) {
          toast({
            title: "Ontbrekende volledige naam",
            description: "Voer uw volledige naam in.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          toast({
            title: "Ontbrekende e-mail",
            description: "Voer uw e-mailadres in.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (!password.trim()) {
          toast({
            title: "Wachtwoord ontbreekt",
            description: "Voer uw wachtwoord in.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (fullName.trim().length < 2) {
          toast({
            title: "Ongeldige volledige naam",
            description: "De volledige naam moet minimaal 2 tekens lang zijn.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (email.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email.trim())) {
            toast({
              title: "Ongeldig e-mailadres",
              description: "Voer een geldig e-mailadres in.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }
        if (password.length < 6) {
          toast({
            title: "Zwak wachtwoord",
            description: "Het wachtwoord moet minimaal 6 tekens lang zijn.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (!agreeToTerms) {
          toast({
            title: "Algemene voorwaarden",
            description: "U moet akkoord gaan met de Algemene Voorwaarden.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, {
          full_name: fullName.trim(),
          role: "user",
        });
        if (!error) {
          toast({
            title: "Account aangemaakt!",
            description: "Controleer uw e-mail ter verificatie.",
          });
        }

        if (error) throw error;

        if (!error) setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Inloggen/registreren is mislukt.",
        variant: "destructive",
      });
      console.error("Error login/register", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-gradient-card border-primary shadow-card animate-fade-in">
        <div className="mb-6 flex justify-center">
          <AppLogo />
        </div>

        <div className="flex mb-6 bg-secondary/20 rounded-full p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-full text-primary text-sm font-medium ${
              isLogin
                ? "bg-primary text-secondary shadow"
                : "text-muted-foreground bg-secondary"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-full text-primary text-sm font-medium ${
              !isLogin
                ? "bg-primary text-secondary shadow"
                : "text-muted-foreground bg-secondary"
            }`}
          >
            Aanmelden
          </button>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <Label htmlFor="full_name">Volledige naam</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Volledige naam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="Voer uw e-mailadres in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1 relative">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Voer uw wachtwoord in"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-primary" />
              ) : (
                <Eye className="w-4 h-4 text-primary" />
              )}
            </button>
          </div>
          {!isLogin && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked === true)
                  }
                  required
                />
                <Label htmlFor="terms">
                  Ik ga akkoord met{" "}
                  <Link
                    to="/terms-conditions"
                    className="text-primary underline"
                  >
                    Algemene voorwaarden
                  </Link>
                </Label>
              </div>
            </>
          )}
          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    toast({
                      title: "Voer eerst uw e-mailadres in",
                      description:
                        "Voer uw e-mailadres in het veld hierboven in.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const { error } = await resetPassword(email);
                    if (error) throw error;
                    if (!error) {
                      toast({
                        title: "Controleer uw e-mail",
                        description: "Link voor wachtwoordherstel verzonden.",
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Fout",
                      description: "Het is niet gelukt om de resetlink te versturen.",
                      variant: "destructive",
                    });
                    console.error("Error sending password reset link", error);
                  }
                }}
                className="text-primary text-sm underline"
              >
                Wachtwoord vergeten?
              </button>
            </div>
          )}
          <Button
            type="submit"
            className="w-full py-3 bg-primary border border-primary text-secondary hover:bg-secondary hover:text-primary font-semibold"
            disabled={(!isLogin && !agreeToTerms) || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? "Inloggen..." : "Account aanmaken..."}
              </>
            ) : isLogin ? (
              "Inloggen"
            ) : (
              "Aanmelden"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};
