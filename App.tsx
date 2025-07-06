// App.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SubscriptionProvider } from "./src/context/SubscriptionContext";

// Screens
import OnboardingScreen from "./src/screens/OnboardingScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AddIntakeScreen from "./src/screens/AddIntakeScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import LoadingScreen from "./src/screens/LoadingScreen";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, subscription, loading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
    } catch (error) {
      setHasSeenOnboarding(false);
    }
  };

  if (loading || hasSeenOnboarding === null) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !user || subscription?.status !== "active" ? (
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddIntake" component={AddIntakeScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
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
          <StatusBar style="light" backgroundColor="#000000" />
          <AppNavigator />
        </SubscriptionProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
