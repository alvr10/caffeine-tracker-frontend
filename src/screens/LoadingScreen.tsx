// src/screens/LoadingScreen.tsx
import React from "react";
import { Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoadingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black justify-center items-center">
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text className="text-white text-lg mt-4">Loading...</Text>
    </SafeAreaView>
  );
}
