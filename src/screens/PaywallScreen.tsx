// src/screens/PaywallScreen.tsx (UPDATED with better debugging)
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";

const features = [
  "Precise caffeine tracking",
  "Custom drink database",
  "Daily limit monitoring",
  "Intake history & trends",
  "Health insights",
  "Withdrawal timeline",
  "Expert recommendations",
];

const testimonials = [
  {
    text: "I had no idea I was consuming 600mg of caffeine daily. This app literally saved my sleep.",
    author: "Sarah M.",
  },
  {
    text: "Finally broke my 10-year energy drink addiction. The tracking made me accountable.",
    author: "Mike R.",
  },
  {
    text: "My anxiety decreased dramatically once I started monitoring my intake properly.",
    author: "Jennifer L.",
  },
];

export default function PaywallScreen() {
  const { signInWithEmail, signUpWithEmail, user, subscription } = useAuth();
  const { createSubscription, loading: subscriptionLoading } =
    useSubscription();

  // Auth form state
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setShowAuthForm(false);
      } else {
        await signInWithEmail(email, password);
        setShowAuthForm(false);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubscribe = async () => {
    // Debug logging
    console.log("Subscribe button pressed");
    console.log("User:", user ? user.email : "No user");
    console.log("Subscription:", subscription);

    if (!user) {
      console.log("No user found, showing auth form");
      setShowAuthForm(true);
      return;
    }

    try {
      console.log("Calling createSubscription...");
      const success = await createSubscription();
      console.log("Subscription result:", success);
    } catch (error) {
      console.error("Subscribe error:", error);
      Alert.alert("Error", "Unable to process subscription. Please try again.");
    }
  };

  const getButtonText = () => {
    if (subscriptionLoading) return "Processing Payment...";
    if (authLoading) return "Signing In...";
    if (!user) return "Sign In to Subscribe";
    if (subscription?.status === "active") return "Already Subscribed";
    return "Subscribe Now";
  };

  const isButtonDisabled = () => {
    return (
      subscriptionLoading || authLoading || subscription?.status === "active"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-8 pb-6">
            <Text className="text-white text-4xl font-bold text-center mb-4">
              CaffTracker Pro
            </Text>
            <Text className="text-gray-300 text-lg text-center">
              Take control of your caffeine intake
            </Text>
          </View>

          {/* Debug Info */}
          {__DEV__ && (
            <View className="mx-6 mb-4 bg-gray-800 p-3 rounded">
              <Text className="text-yellow-400 text-xs">
                DEBUG: User: {user ? `✅ ${user.email}` : "❌ Not signed in"}
              </Text>
              <Text className="text-yellow-400 text-xs">
                Subscription: {subscription?.status || "inactive"}
              </Text>
            </View>
          )}

          {/* Auth Form */}
          {showAuthForm && !user && (
            <View className="mx-6 mb-8 bg-gray-900 p-6 rounded-lg border border-gray-700">
              <Text className="text-white text-xl font-bold text-center mb-4">
                {isSignUp ? "Create Account" : "Sign In"}
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-gray-800 text-white px-4 py-3 rounded-lg mb-3 border border-gray-600"
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#6B7280"
                secureTextEntry
                className="bg-gray-800 text-white px-4 py-3 rounded-lg mb-4 border border-gray-600"
              />

              <TouchableOpacity
                onPress={handleAuth}
                disabled={authLoading}
                className={`py-3 rounded-lg mb-3 ${
                  authLoading ? "bg-gray-700" : "bg-white"
                }`}
              >
                <Text className="text-black text-center font-bold">
                  {authLoading
                    ? "Loading..."
                    : isSignUp
                    ? "Sign Up"
                    : "Sign In"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                className="py-2"
              >
                <Text className="text-gray-400 text-center">
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowAuthForm(false)}
                className="py-2"
              >
                <Text className="text-gray-500 text-center text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* User Status */}
          {user && (
            <View
              className={`mx-6 mb-6 p-4 rounded-lg border ${
                subscription?.status === "active"
                  ? "bg-green-900 border-green-700"
                  : "bg-blue-900 border-blue-700"
              }`}
            >
              <Text
                className={`text-center ${
                  subscription?.status === "active"
                    ? "text-green-300"
                    : "text-blue-300"
                }`}
              >
                {subscription?.status === "active"
                  ? `✅ Subscribed as ${user.email}`
                  : `👤 Signed in as ${user.email}`}
              </Text>
            </View>
          )}

          {/* Urgency Message */}
          <View className="bg-white mx-6 p-6 rounded-lg mb-8">
            <Text className="text-black text-xl font-bold text-center mb-3">
              Your Health Can't Wait
            </Text>
            <Text className="text-gray-700 text-center text-base">
              Every day without proper tracking is another day of potential
              overconsumption. Start protecting your health today.
            </Text>
          </View>

          {/* Features */}
          <View className="px-6 mb-8">
            <Text className="text-white text-2xl font-bold text-center mb-6">
              Everything You Need
            </Text>
            <View className="space-y-4">
              {features.map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="bg-white w-2 h-2 rounded-full mr-4" />
                  <Text className="text-gray-300 text-base flex-1">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Social Proof */}
          <View className="px-6 mb-8">
            <Text className="text-white text-2xl font-bold text-center mb-6">
              Real Results
            </Text>
            <View className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <View
                  key={index}
                  className="bg-gray-900 p-4 rounded-lg border border-gray-700"
                >
                  <Text className="text-gray-300 text-sm mb-2 italic">
                    "{testimonial.text}"
                  </Text>
                  <Text className="text-white text-xs font-semibold">
                    — {testimonial.author}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View className="mx-6 mb-8">
            <View className="bg-white p-6 rounded-lg">
              <Text className="text-black text-2xl font-bold text-center mb-2">
                €9.99/month
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                Full access to all features
              </Text>
              <Text className="text-gray-700 text-sm text-center">
                Less than the cost of 3 coffees. Invest in your health.
              </Text>
            </View>
          </View>

          {/* CTA */}
          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={handleSubscribe}
              disabled={isButtonDisabled()}
              className={`py-4 rounded-lg mb-4 ${
                isButtonDisabled() ? "bg-gray-700" : "bg-white"
              }`}
            >
              <Text className="text-black text-lg font-bold text-center">
                {getButtonText()}
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-xs text-center">
              Cancel anytime. Your health is worth it.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
