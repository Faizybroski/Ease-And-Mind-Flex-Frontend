import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
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
          navigate("/user/dashboard");
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
