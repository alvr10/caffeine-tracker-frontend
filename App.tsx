// App.tsx - Fixed navigation logic
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SubscriptionProvider } from "./src/context/SubscriptionContext";
import { NotificationProvider } from "./src/context/NotificationContext";

// Screens
import OnboardingScreen from "./src/screens/OnboardingScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AddIntakeScreen from "./src/screens/AddIntakeScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import LoadingScreen from "./src/screens/LoadingScreen";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, subscription, loading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Add a listener for storage changes to detect when onboarding is completed
  useEffect(() => {
    const interval = setInterval(async () => {
      if (hasSeenOnboarding === false) {
        const seen = await AsyncStorage.getItem("hasSeenOnboarding");
        if (seen === "true") {
          setHasSeenOnboarding(true);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [hasSeenOnboarding]);

  const checkOnboardingStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setHasSeenOnboarding(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  if (loading || checkingOnboarding || hasSeenOnboarding === null) {
    return <LoadingScreen />;
  }

  // Check for both active and active_until_period_end
  const hasActiveSubscription =
    subscription?.status === "active" ||
    subscription?.status === "active_until_period_end";

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          // Onboarding flow
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !user || !hasActiveSubscription ? (
          // Payment/Auth flow
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        ) : (
          // Main app flow
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddIntake" component={AddIntakeScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <AuthProvider>
        <SubscriptionProvider>
          <NotificationProvider>
            <StatusBar style="light" backgroundColor="#000000" />
            <AppNavigator />
          </NotificationProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
