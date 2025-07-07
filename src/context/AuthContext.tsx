// src/context/AuthContext.tsx (COMPLETED)
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
}

interface Subscription {
  status:
    | "active"
    | "inactive"
    | "cancelled"
    | "past_due"
    | "trialing"
    | "active_until_period_end";
  expires_at?: string;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  getCurrentToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session ? "exists" : "none");
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
        });
        fetchSubscriptionStatus(session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Auth event:",
        event,
        "Session:",
        session ? "exists" : "none"
      );

      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
        });
        await fetchSubscriptionStatus(session.access_token);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSubscription(null);
      }
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const getCurrentToken = async (): Promise<string | null> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return null;
      }

      if (!session) {
        console.log("No session found");
        return null;
      }

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

      console.log("Token expires in:", timeUntilExpiry, "seconds");

      if (timeUntilExpiry < 300) {
        console.log("Token expiring soon, refreshing...");

        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !newSession) {
          console.error("Failed to refresh session:", refreshError);
          return null;
        }

        console.log("Session refreshed successfully");
        return newSession.access_token;
      }

      return session.access_token;
    } catch (error) {
      console.error("Error getting current token:", error);
      return null;
    }
  };

  const fetchSubscriptionStatus = async (token: string) => {
    try {
      console.log("Fetching subscription status...");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscription/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Subscription status response:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Subscription data:", data);

        // Only consider active and trialing as valid subscriptions
        if (
          data.status === "active" ||
          data.status === "active_until_period_end" ||
          data.status === "trialing"
        ) {
          setSubscription(data);
        } else {
          setSubscription({ status: "inactive" });
        }
      } else {
        const errorText = await response.text();
        console.error("Subscription status error:", errorText);
        setSubscription({ status: "inactive" });
      }
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
      setSubscription({ status: "inactive" });
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Sign in successful:", data.user?.email);
    } catch (error: any) {
      console.error("Error signing in:", error);
      throw new Error(error.message || "Failed to sign in");
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      console.log("Signing up with email:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      console.log("Sign up successful:", data.user?.email);

      if (data.user && !data.user.email_confirmed_at) {
        Alert.alert(
          "Check your email",
          "We sent you a confirmation link. Please check your email and click the link to verify your account."
        );
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      throw new Error(error.message || "Failed to sign up");
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("hasSeenOnboarding");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshSubscription = async () => {
    const token = await getCurrentToken();
    if (token) {
      await fetchSubscriptionStatus(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshSubscription,
        getCurrentToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
