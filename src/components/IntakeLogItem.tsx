// src/components/IntakeLogItem.tsx
import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

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

interface IntakeLogItemProps {
  log: IntakeLog;
  onUpdate: () => void;
}

export default function IntakeLogItem({ log, onUpdate }: IntakeLogItemProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this caffeine log?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteLog },
      ]
    );
  };

  const deleteLog = async () => {
    try {
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake/${log.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete log:", error);
    }
  };

  return (
    <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">
            {log.drinks.name}
          </Text>
          {log.drinks.brand && (
            <Text className="text-gray-400 text-sm">{log.drinks.brand}</Text>
          )}
          <View className="flex-row mt-2 space-x-4">
            <Text className="text-gray-300 text-sm">
              {log.servings}x serving{log.servings !== 1 ? "s" : ""}
            </Text>
            <Text className="text-white text-sm font-medium">
              {log.total_caffeine}mg
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-gray-400 text-sm">
            {formatTime(log.consumed_at)}
          </Text>
          <TouchableOpacity onPress={handleDelete} className="mt-2 px-2 py-1">
            <Text className="text-red-400 text-xs">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
