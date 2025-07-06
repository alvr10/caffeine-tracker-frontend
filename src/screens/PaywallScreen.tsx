// src/screens/PaywallScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
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
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { createSubscription } = useSubscription();

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // Sign in with Google first
      await signInWithGoogle();

      // Then create subscription
      const success = await createSubscription("");

      if (!success) {
        Alert.alert("Subscription Failed", "Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to process subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
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
            disabled={loading}
            className={`py-4 rounded-lg mb-4 ${
              loading ? "bg-gray-700" : "bg-white"
            }`}
          >
            <Text className="text-black text-lg font-bold text-center">
              {loading ? "Processing..." : "Start Your Transformation"}
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-500 text-xs text-center">
            Cancel anytime. Your health is worth it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
