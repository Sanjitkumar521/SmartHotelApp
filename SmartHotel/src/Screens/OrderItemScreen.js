import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrderItemScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState(""); // Replace with actual customer ID (e.g., from auth)
  // Handle order status filter
  const [activeTab, setActiveTab] = useState("Pending");

  // Fetch customer ID from AsyncStorage
  // Fetch customer ID from AsyncStorage
  const fetchCustomerId = async () => {
    try {
      const id = await AsyncStorage.getItem("user_id");
      if (id) {
        setCustomerId(id);
        console.log("Customer ID fetched from AsyncStorage:", id);
      } else {
        setError("Customer ID not found. Please log in again.");
        console.error("Customer ID not found in AsyncStorage.");
      }
    } catch (error) {
      console.error("Error fetching customer ID:", error);
      setError("Error fetching customer ID.");
    }
  };

  const API_URL = "http://192.168.18.50:8082/pendingorders";

  // Fetch orders with customer_id
  const fetchOrders = async () => {
    if (!customerId) {
      return;
    }
    setLoading(true);
    setError(null); // Reset error state before fetching

    const formData = new FormData();
    formData.append("user_id", customerId);
    console.log("FormData:", formData); // Debug FormData

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });
      if (response.ok) {
        const data = await response.json();
        // Ensure response is an array
        const fetchedOrders = Array.isArray(data) ? data : [];
        setOrders(fetchedOrders);
        console.log("Fetched Orders:", fetchedOrders); // Debug fetched orders

        // Set activeTab based on the status of the first order
        if (fetchedOrders.length > 0) {
            const status = fetchedOrders[0].status;
            if (status === "Pending") {
              setActiveTab("Pending");
            } else if (status === "In Progress") {
              setActiveTab("In Progress");
            }
            else if (status === "Completed") {
              setActiveTab("Completed");    
            }
            console.log("Set activeTab to:", status); // Debug tab change
          }
        //setActiveTab("Pending");
        setError(null);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to fetching menu.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Error fetching orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer ID on component mount
  useEffect(() => {
    fetchCustomerId();
  }, []);

  // Fetch orders when customerId changes and set up polling
  useEffect(() => {
    if (customerId) {
      fetchOrders(); // Initial fetch
      const interval = setInterval(fetchOrders, 10000); // Poll every 2 seconds
      return () => clearInterval(interval); // Cleanup interval
    }
  }, [customerId]);

  
  

  const renderOrderStatus = (status) => {
    const statusStyles = {
      Pending: { color: "#FFA500", icon: "hourglass-empty" },
      "In Progress": { color: "#1E90FF", icon: "autorenew" },
      Completed: { color: "#008000", icon: "check-circle" },
    };

    const style = statusStyles[status] || statusStyles.Pending;

    return (
      <View style={styles.statusContainer}>
        <Icon name={style.icon} size={20} color={style.color} />
        <Text style={[styles.statusText, { color: style.color }]}>
          {status}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFEB3B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Orders</Text>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      {/* Status Tabs */}
      <View style={styles.tabsContainer}>
        {["Pending", "In Progress", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders.filter((order) => order.status === activeTab)}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderDate}>Order ID: {item.order_id}</Text>
              <Text style={styles.tableNo}>Table: {item.table_number}</Text>
            </View>

            {renderOrderStatus(item.status)}

            <Text style={styles.orderTitle}>Ordered Items:</Text>
            <View style={styles.orderDetails}>
              {item.items.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <Text style={styles.foodName}>{food.food_name}</Text>
                  <Text style={styles.foodQty}>{food.quantity} Pcs</Text>
                  <Text style={styles.foodPrice}>Rs {food.subtotal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No {activeTab.toLowerCase()} orders found.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

// Updated Styles
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
  orderCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  tableNo: {
    fontSize: 16,
    fontWeight: "600",
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 5,
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  foodName: {
    fontSize: 14,
    flex: 2,
  },
  foodQty: {
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  foodPrice: {
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: "#FFEB3B",
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#000",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default OrderItemScreen;
