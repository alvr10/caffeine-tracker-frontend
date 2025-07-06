// src/screens/AddIntakeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

interface Drink {
  id: number;
  name: string;
  caffeine_per_serving: number;
  category: string;
  brand?: string;
  serving_size: string;
  is_custom: boolean;
}

export default function AddIntakeScreen() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [servings, setServings] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const navigation = useNavigation();
  const { user } = useAuth();

  const categories = ["all", "coffee", "tea", "energy_drink", "soda", "other"];

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/drinks`,
        {
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      const data = await response.json();
      setDrinks(data);
    } catch (error) {
      console.error("Failed to fetch drinks:", error);
    }
  };

  const logIntake = async () => {
    if (!selectedDrink) {
      Alert.alert("Error", "Please select a drink first.");
      return;
    }

    const servingsNum = parseFloat(servings);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      Alert.alert("Error", "Please enter a valid number of servings.");
      return;
    }

    setLoading(true);
    try {
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({
            drink_id: selectedDrink.id,
            servings: servingsNum,
          }),
        }
      );

      if (response.ok) {
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to log intake. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to log intake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDrinks = drinks.filter((drink) => {
    const matchesSearch =
      drink.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (drink.brand &&
        drink.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || drink.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCaffeine = selectedDrink
    ? Math.round(
        selectedDrink.caffeine_per_serving * parseFloat(servings || "1")
      )
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Log Intake</Text>
        <TouchableOpacity
          onPress={logIntake}
          disabled={!selectedDrink || loading}
          className={selectedDrink && !loading ? "" : "opacity-50"}
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-6 py-4">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search drinks..."
          placeholderTextColor="#6B7280"
          className="bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700"
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6"
      >
        <View className="flex-row space-x-3 pb-4">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === category
                  ? "bg-white border-white"
                  : "bg-transparent border-gray-600"
              }`}
            >
              <Text
                className={`capitalize ${
                  selectedCategory === category ? "text-black" : "text-gray-300"
                }`}
              >
                {category === "all" ? "All" : category.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Drinks List */}
      <ScrollView className="flex-1 px-6">
        <View className="space-y-3">
          {filteredDrinks.map((drink) => (
            <TouchableOpacity
              key={drink.id}
              onPress={() => setSelectedDrink(drink)}
              className={`p-4 rounded-lg border ${
                selectedDrink?.id === drink.id
                  ? "bg-white border-white"
                  : "bg-gray-900 border-gray-700"
              }`}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text
                    className={`font-semibold text-base ${
                      selectedDrink?.id === drink.id
                        ? "text-black"
                        : "text-white"
                    }`}
                  >
                    {drink.name}
                  </Text>
                  {drink.brand && (
                    <Text
                      className={`text-sm ${
                        selectedDrink?.id === drink.id
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {drink.brand}
                    </Text>
                  )}
                  <Text
                    className={`text-sm mt-1 ${
                      selectedDrink?.id === drink.id
                        ? "text-gray-600"
                        : "text-gray-500"
                    }`}
                  >
                    {drink.serving_size}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={`font-bold ${
                      selectedDrink?.id === drink.id
                        ? "text-black"
                        : "text-white"
                    }`}
                  >
                    {drink.caffeine_per_serving}mg
                  </Text>
                  <Text
                    className={`text-xs capitalize ${
                      selectedDrink?.id === drink.id
                        ? "text-gray-600"
                        : "text-gray-500"
                    }`}
                  >
                    {drink.category.replace("_", " ")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Selected Drink Summary */}
      {selectedDrink && (
        <View className="bg-gray-900 border-t border-gray-700 px-6 py-4">
          <Text className="text-white text-lg font-bold mb-3">
            {selectedDrink.name}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-300">Servings:</Text>
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                onPress={() => {
                  const current = parseFloat(servings || "1");
                  if (current > 0.5) setServings((current - 0.5).toString());
                }}
                className="bg-gray-700 w-8 h-8 rounded-full justify-center items-center"
              >
                <Text className="text-white font-bold">-</Text>
              </TouchableOpacity>

              <TextInput
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                className="bg-gray-800 text-white text-center px-3 py-2 rounded w-16"
              />

              <TouchableOpacity
                onPress={() => {
                  const current = parseFloat(servings || "1");
                  setServings((current + 0.5).toString());
                }}
                className="bg-gray-700 w-8 h-8 rounded-full justify-center items-center"
              >
                <Text className="text-white font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-300">Total Caffeine:</Text>
            <Text className="text-white text-xl font-bold">
              {totalCaffeine}mg
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
