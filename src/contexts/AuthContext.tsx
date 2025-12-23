import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/lib/sendEmail";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata?: any
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string,
    expectedRole: "admin" | "user"
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("getSession error:", error);

      if (mounted) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;

    console.log("🚀 SignUp called with:", { email, role: metadata?.role });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: metadata?.full_name,
          role: "user",
        },
      },
    });

    navigate("/");

    await sendEmail({
      to: email,
      subject: "Update on Your Parish Application",
      html: `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Signup Update – Ease & Mind Flex Spaces</title>
          </head>
          <body style="margin:0; padding:0; background-color:#f9fafb; font-family:Arial, sans-serif; color:#333;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding:20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                    
                    <!-- Header with Logo -->
                    <tr>
                      <td align="center" style="background-color:#ffffff; padding:30px 20px;">
                        <img 
                          src="https://njmscbbdzkdvgkdnylxx.supabase.co/storage/v1/object/public/Ease%20And%20Mind%20Flex/app/logo.svg" 
                          alt="Ease & Mind Flex Spaces" 
                          width="120"
                          style="display:block; margin:auto;"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="background-color:#0f766e; padding:10px 20px;">
                        <h1 style="margin:0; font-size:24px; color:#ffffff;">
                          Signup Update
                        </h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:30px; font-size:16px; line-height:1.6; color:#444;">
                        <p>Hi <strong>${metadata?.full_name}</strong>,</p>

                        <p>
                          Thank you for your interest in <strong>Ease & Mind Flex Spaces</strong>. We’ve reviewed your signup details.
                        </p>

                        <p>
                          At this time, we’re unable to complete your registration. This could be due to missing information, pending verification, or not meeting our criteria.
                        </p>

                        <p>
                          If you think this is an error or you’d like additional clarity, please reach out — we’re here to help.
                        </p>

                        <p style="margin-top:30px;">
                          We appreciate your time and interest in joining our community.
                        </p>

                        <p style="margin-top:30px; font-size:14px; color:#888;">
                          Warm regards,<br />
                          <strong>The Ease & Mind Flex Spaces Team</strong>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="background-color:#f3f4f6; padding:20px; font-size:12px; color:#666;">
                        <p style="margin:0;">Ease & Mind Flex Spaces</p>
                        <p style="margin:5px 0 0;">
                          Didn’t sign up? You can ignore this email.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("📝 SignUp result:", { error });
    return { error };
  };

  const signIn = async (
    email: string,
    password: string,
    expectedRole: "admin" | "user"
  ) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.info("User signed in:====>", data);
    if (error) {
      return { error };
    }

    if (!data.user) {
      return { error: { message: "Invalid login attempt" } };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    console.log("profile====>", profile);
    console.log("Profile error======>", profileError);

    const articleMap: Record<"admin" | "user", string> = {
      admin: "an admin",
      user: "a user",
    };

    if (profile?.role !== expectedRole) {
      await supabase.auth.signOut();
      if (expectedRole === "admin") {
        navigate("/admin/login");
      }
      return {
        error: { message: `${email} is not ${articleMap[expectedRole]}` },
      };
    }

    if (error) {
      return { error };
    }

    if (!data.user) {
      return { error: { message: "Invalid login attempt" } };
    }

    if (profileError) return { error: profileError };
    setTimeout(() => {
      switch (profile.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "user":
        default:
          navigate("/");
          break;
      }
    }, 100);

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
