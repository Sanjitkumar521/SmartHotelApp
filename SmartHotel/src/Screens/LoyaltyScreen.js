import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const defaultProfileImage = "/Uploads/profile_images/Avishek Chaudhary.JPG";
const localIPS = "http://192.168.18.50:8082";

const LoyaltyScreen = () => {
  // User loyalty data
  const [user, setUser] = useState({
    user_id: "",
    name: "",
    email: "",
    Image_URL: "",
    loyalty_points: 0,
    tier: "Bronze",
    discount_percentage: 0,
    redeemed_discount: false,
    points_to_next_reward: 0,
    recent_activities: [],
  });
  const [loading, setLoading] = useState(true);

  // Customer details
  const [customerId, setCustomerId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState("");
  const [phone, setPhone] = useState("");
  const [imageError, setImageError] = useState(null); // Added missing state for image error

  // Fetch loyalty data from backend
  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await axios.get(`${localIPS}/loyalty`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching loyalty data:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to load loyalty data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchLoyaltyData();
  }, []);

  // Fetch customer details
  useEffect(() => {
    const fetchCustomerDetail = async () => {
      try {
        const [id, email, name, profileImage, phone] = await Promise.all([
          AsyncStorage.getItem("user_id"),
          AsyncStorage.getItem("email"),
          AsyncStorage.getItem("name"),
          AsyncStorage.getItem("Image_URL"),
          AsyncStorage.getItem("phone"),
        ]);

        setCustomerId(id || "");
        setEmail(email || "");
        setName(name || "");
        setUserData(profileImage || "");
        setPhone(phone || "");
      } catch (error) {
        console.error("Error fetching customer details:", error);
        setImageError("Error fetching customer details.");
      }
    };
    fetchCustomerDetail();
  }, []);

  // Handle Silver discount redemption
  const handleRedeemSilverDiscount = async () => {
    if (user.tier !== "Silver" || user.discount_percentage !== 15 || user.redeemed_discount) {
      Alert.alert("Not Eligible", "You need to be in the Silver tier with an available 15% discount.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${localIPS}/loyalty/redeem/silver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", response.data.message);
      // Refresh loyalty data
      const refreshResponse = await axios.get(`${localIPS}/loyalty`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(refreshResponse.data.user);
    } catch (error) {
      console.error("Error redeeming Silver discount:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Failed to redeem discount.");
    }
  };

  // Handle Platinum discount redemption
  const handleRedeemPlatinumDiscount = async () => {
    if (user.tier !== "Platinum" || user.discount_percentage !== 50) {
      Alert.alert("Not Eligible", "You need to be in the Platinum tier to redeem a 50% discount.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${localIPS}/loyalty/redeem`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", response.data.message);
      // Refresh loyalty data
      const refreshResponse = await axios.get(`${localIPS}/loyalty`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(refreshResponse.data.user);
    } catch (error) {
      console.error("Error redeeming Platinum discount:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Failed to redeem discount.");
    }
  };

  // Tier data with updated discounts
  const tiers = [
    { name: "Bronze", points: 0, discount: 0, icon: "medal", color: "#CD7F32" },
    { name: "Silver", points: 1000, discount: 15, icon: "medal", color: "#C0C0C0" },
    { name: "Gold", points: 2000, discount: 25, icon: "medal", color: "#FFD700" },
    { name: "Platinum", points: 3000, discount: 50, icon: "medal", color: "#E5E4E2" },
  ];

  // Calculate progress for the progress bar
  const totalPointsForReward = user.points_to_next_reward + user.loyalty_points;
  const progress = totalPointsForReward > 0 ? (user.loyalty_points / totalPointsForReward) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Loyalty Balance</Text>
          <TouchableOpacity>
            {/* Placeholder for profile icon */}
          </TouchableOpacity>
        </View>

        {/* Points Section */}
        <View style={styles.pointsContainer}>
          <Image
            source={{
              uri:
                userData && !userData.startsWith("file://")
                  ? `${localIPS}/${userData}`
                  : userData && userData.startsWith("file://")
                  ? userData
                  : `${localIPS}${defaultProfileImage}`,
            }}
            style={styles.profileImage}
            onError={(error) => console.log("Image load error:", error.nativeEvent.error)}
          />
          <Text style={styles.pointsText}>{user.loyalty_points}pts</Text>
          <Text style={styles.discountText}>Current Discount: {user.discount_percentage}%</Text>
          <Text style={styles.pointsSubText}>
            {user.points_to_next_reward} points till your next tier
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.userId}>
            {user.name} {user.user_id}
          </Text>
          {user.tier === "Silver" && !user.redeemed_discount && (
            <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemSilverDiscount}>
              <Text style={styles.redeemButtonText}>Redeem 15% Discount</Text>
            </TouchableOpacity>
          )}
          {user.tier === "Platinum" && (
            <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemPlatinumDiscount}>
              <Text style={styles.redeemButtonText}>Redeem 50% Discount</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tiers Section */}
        <View style={styles.tiersContainer}>
          <Text style={styles.tiersTitle}>Your Loyalty Tier</Text>
          <View style={styles.tiersList}>
            {tiers.map((tier) => (
              <View
                key={tier.name}
                style={[styles.tierItem, user.tier === tier.name && styles.currentTier]}
              >
                <Ionicons
                  name={tier.icon}
                  size={24}
                  color={user.tier === tier.name ? tier.color : "#666"}
                  style={styles.tierIcon}
                />
                <Text
                  style={[styles.tierName, user.tier === tier.name && { color: tier.color }]}
                >
                  {tier.name}
                </Text>
                <Text style={styles.tierPoints}>{ tier.points} pts</Text>
                <Text style={styles.tierDiscount}>{tier.discount}% off</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.activityContainer}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          {user.recent_activities.length > 0 ? (
            user.recent_activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityAmount}>{activity.amount || ""}</Text>
                </View>
                <Text
                  style={[
                    styles.pointsEarned,
                    activity.points_change > 0 ? styles.pointsPositive : styles.pointsNegative,
                  ]}
                >
                  {activity.points_change > 0 ? "+" : ""}{activity.points_change} pts
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noActivityText}>No recent activities</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  pointsContainer: {
    alignItems: "center",
    paddingVertical: 30,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    backgroundColor: "#6A0DAD",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  pointsText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFF",
  },
  discountText: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 5,
    fontWeight: "600",
  },
  pointsSubText: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 5,
  },
  userId: {
    fontSize: 14,
    color: "#FFF",
    marginTop: 10,
    opacity: 0.8,
  },
  progressBarContainer: {
    width: "80%",
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF69B4",
    borderRadius: 5,
  },
  redeemButton: {
    backgroundColor: "#FF69B4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
  },
  redeemButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  tiersContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  tiersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  tiersList: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
  },
  tierItem: {
    alignItems: "center",
    flex: 1,
  },
  currentTier: {
    borderWidth: 2,
    borderColor: "#6A0DAD",
    borderRadius: 5,
    padding: 5,
  },
  tierIcon: {
    marginBottom: 5,
  },
  tierName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  tierPoints: {
    fontSize: 12,
    color: "#666",
  },
  tierDiscount: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activityContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityDetails: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
  activityAmount: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  pointsEarned: {
    fontSize: 16,
    fontWeight: "bold",
  },
  pointsPositive: {
    color: "#FF69B4",
  },
  pointsNegative: {
    color: "#000",
  },
  noActivityText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default LoyaltyScreen;