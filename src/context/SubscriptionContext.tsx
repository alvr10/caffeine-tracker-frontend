// src/context/SubscriptionContext.tsx
import React, { createContext, useContext } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  createSubscription: (paymentMethodId: string) => Promise<boolean>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { refreshSubscription } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const createSubscription = async (
    paymentMethodId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Create subscription on backend
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscription/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payment_method_id: paymentMethodId }),
        }
      );

      const { client_secret } = await response.json();

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: client_secret,
        merchantDisplayName: "CaffTracker",
      });

      if (initError) throw initError;

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== "Canceled") {
          throw presentError;
        }
        return false;
      }

      // Refresh subscription status
      await refreshSubscription();
      return true;
    } catch (error) {
      console.error("Subscription creation failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ createSubscription, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
