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
            title: "Missing Email",
            description: "Please enter your email address.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!password.trim()) {
          toast({
            title: "Missing Password",
            description: "Please enter your password.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await signIn(email.trim(), password.trim(), "user");
        if (!error) {
          toast({
            title: "Welcome back!",
            description: "Signed in successfully.",
          });
        }
        if (error) throw error;
      } else {
        if (!fullName.trim()) {
          toast({
            title: "Missing Full Name",
            description: "Please enter your Full name.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          toast({
            title: "Missing Email",
            description: "Please enter your email address.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (!password.trim()) {
          toast({
            title: "Missing Password",
            description: "Please enter your password.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (fullName.trim().length < 2) {
          toast({
            title: "Invalid Full Name",
            description: "Full name must be at least 2 characters long.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (email.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email.trim())) {
            toast({
              title: "Invalid Email",
              description: "Please enter a valid email address.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }
        if (password.length < 6) {
          toast({
            title: "Weak Password",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (!agreeToTerms) {
          toast({
            title: "Terms & Conditions",
            description: "You must agree to the Terms & Conditions.",
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
            title: "Account Created!",
            description: "Check your email for verification.",
          });
        }

        if (error) throw error;

        if (!error) setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login/register.",
        variant: "destructive",
      });
      console.error("Error login/register", error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full max-w-md space-y-8">
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
            Sign Up
          </button>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
                  I agree to the{" "}
                  <Link
                    to="/terms-conditions"
                    className="text-primary underline"
                  >
                    Terms & Conditions
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
                      title: "Enter your email first",
                      description:
                        "Please enter your email in the field above.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const { error } = await resetPassword(email);
                    if (error) throw error;
                    if (!error) {
                      toast({
                        title: "Check your email",
                        description: "Password reset link sent.",
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to send reset link.",
                      variant: "destructive",
                    });
                    console.error("Error sending password reset link", error);
                  }
                }}
                className="text-primary text-sm underline"
              >
                Forgot Password?
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
                {isLogin ? "Logging in..." : "Creating account..."}
              </>
            ) : isLogin ? (
              "Log In"
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Card>
    </div>
    </div>
  );
};
