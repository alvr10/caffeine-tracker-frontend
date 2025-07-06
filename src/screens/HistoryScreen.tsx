// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { useAuth } from "../context/AuthContext";

interface DailyTotal {
  [date: string]: number;
}

export default function HistoryScreen() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal>({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake/history`,
        {
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      const data = await response.json();
      setDailyTotals(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const screenWidth = Dimensions.get("window").width;

  // Prepare chart data
  const sortedEntries = Object.entries(dailyTotals).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );

  const last7Days = sortedEntries.slice(-7);
  const chartData = {
    labels: last7Days.map(([date]) =>
      new Date(date).toLocaleDateString("en-US", { weekday: "short" })
    ),
    datasets: [
      {
        data: last7Days.map(([, total]) => total),
        strokeWidth: 3,
      },
    ],
  };

  // Calculate stats
  const totalDays = Object.keys(dailyTotals).length;
  const averageIntake =
    totalDays > 0
      ? Math.round(
          Object.values(dailyTotals).reduce((a, b) => a + b, 0) / totalDays
        )
      : 0;
  const daysOverLimit = Object.values(dailyTotals).filter(
    (total) => total > 400
  ).length;
  const maxIntake = Math.max(...Object.values(dailyTotals), 0);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Intake History</Text>
        <View />
      </View>

      <ScrollView className="flex-1">
        {/* Chart */}
        {last7Days.length > 0 && (
          <View className="px-6 py-6">
            <Text className="text-white text-lg font-bold mb-4">
              Last 7 Days
            </Text>
            <View className="bg-gray-900 rounded-lg p-4">
              <LineChart
                data={chartData}
                width={screenWidth - 80}
                height={200}
                chartConfig={{
                  backgroundColor: "#1F2937",
                  backgroundGradientFrom: "#1F2937",
                  backgroundGradientTo: "#1F2937",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(156, 163, 175, ${opacity})`,
                  style: {
                    borderRadius: 8,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#FFFFFF",
                  },
                }}
                bezier
                style={{
                  borderRadius: 8,
                }}
              />
              <View className="absolute top-4 right-4">
                <View className="bg-black bg-opacity-50 px-2 py-1 rounded">
                  <Text className="text-gray-300 text-xs">
                    Daily limit: 400mg
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Stats */}
        <View className="px-6 py-4">
          <Text className="text-white text-lg font-bold mb-4">Statistics</Text>
          <View className="space-y-4">
            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Average Daily Intake</Text>
                <Text className="text-white text-xl font-bold">
                  {averageIntake}mg
                </Text>
              </View>
            </View>

            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Days Over Limit</Text>
                <Text
                  className={`text-xl font-bold ${
                    daysOverLimit > 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {daysOverLimit}/{totalDays}
                </Text>
              </View>
            </View>

            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Highest Single Day</Text>
                <Text
                  className={`text-xl font-bold ${
                    maxIntake > 400 ? "text-red-400" : "text-white"
                  }`}
                >
                  {maxIntake}mg
                </Text>
              </View>
            </View>

            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Days Tracked</Text>
                <Text className="text-white text-xl font-bold">
                  {totalDays}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Days */}
        <View className="px-6 py-4 pb-8">
          <Text className="text-white text-lg font-bold mb-4">Recent Days</Text>
          <View className="space-y-3">
            {sortedEntries
              .slice(-10)
              .reverse()
              .map(([date, total]) => (
                <View
                  key={date}
                  className="bg-gray-900 p-4 rounded-lg border border-gray-700"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white font-medium">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <View className="items-end">
                      <Text
                        className={`text-lg font-bold ${
                          total > 400 ? "text-red-400" : "text-white"
                        }`}
                      >
                        {total}mg
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {total > 400
                          ? `+${total - 400}mg over`
                          : `${400 - total}mg under`}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
