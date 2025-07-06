// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import CircularProgress from "../components/CircularProgress";
import IntakeLogItem from "../components/IntakeLogItem";
import { useAuth } from "../context/AuthContext";

interface IntakeLog {
  id: number;
  total_caffeine: number;
  servings: number;
  consumed_at: string;
  drinks: {
    name: string;
    category: string;
    brand?: string;
  };
}

interface DailyIntake {
  date: string;
  total_caffeine: number;
  logs: IntakeLog[];
}

export default function HomeScreen() {
  const [dailyIntake, setDailyIntake] = useState<DailyIntake | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchDailyIntake();
  }, []);

  const fetchDailyIntake = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake/daily/${today}`,
        {
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      const data = await response.json();
      setDailyIntake(data);
    } catch (error) {
      console.error("Failed to fetch daily intake:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyIntake();
    setRefreshing(false);
  };

  const caffeinePercentage = dailyIntake
    ? (dailyIntake.total_caffeine / 400) * 100
    : 0;
  const isOverLimit = caffeinePercentage > 100;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-white text-2xl font-bold">Today's Intake</Text>
          <Text className="text-gray-400 text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Circular Progress */}
        <View className="items-center mb-8">
          <CircularProgress
            size={200}
            strokeWidth={12}
            progress={Math.min(caffeinePercentage, 100)}
            backgroundColor="#1F2937"
            progressColor={isOverLimit ? "#DC2626" : "#FFFFFF"}
          >
            <View className="items-center">
              <Text className="text-white text-3xl font-bold">
                {dailyIntake?.total_caffeine || 0}
              </Text>
              <Text className="text-gray-400 text-sm">mg caffeine</Text>
              <Text className="text-gray-400 text-xs mt-1">
                {400 - (dailyIntake?.total_caffeine || 0) > 0
                  ? `${400 - (dailyIntake?.total_caffeine || 0)}mg remaining`
                  : `${(dailyIntake?.total_caffeine || 0) - 400}mg over limit`}
              </Text>
            </View>
          </CircularProgress>
        </View>

        {/* Status Message */}
        <View className="mx-6 mb-6">
          <View
            className={`p-4 rounded-lg border ${
              isOverLimit
                ? "bg-red-900 border-red-700"
                : caffeinePercentage > 75
                ? "bg-yellow-900 border-yellow-700"
                : "bg-gray-900 border-gray-700"
            }`}
          >
            <Text className="text-white text-center font-medium">
              {isOverLimit
                ? "⚠️ Over daily limit - Consider reducing intake"
                : caffeinePercentage > 75
                ? "🟡 Approaching daily limit"
                : "✅ Within healthy range"}
            </Text>
          </View>
        </View>

        {/* Add Intake Button */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate("AddIntake" as never)}
            className="bg-white py-4 rounded-lg"
          >
            <Text className="text-black text-lg font-bold text-center">
              + Log Caffeine Intake
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Logs */}
        {dailyIntake?.logs && dailyIntake.logs.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">
              Today's History
            </Text>
            <View className="space-y-3">
              {dailyIntake.logs.map((log) => (
                <IntakeLogItem
                  key={log.id}
                  log={log}
                  onUpdate={fetchDailyIntake}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate("History" as never)}
            className="bg-gray-900 py-3 rounded-lg border border-gray-700"
          >
            <Text className="text-white text-center font-medium">
              View Full History
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
