import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChefDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  // const chefId = 2; // Replace with dynamic chef ID if needed
  const [chefId, setChefId] = useState(null);


  const fetchChefId = async () => {
    try {
      const storedChefId = await AsyncStorage.getItem("user_id");
      if (storedChefId) {
        setChefId(parseInt(storedChefId)); 
      } else {
        Alert.alert("Error", "Chef ID not found. Please log in again.");
      }
    } catch (error) {
      console.error("Error fetching chef ID:", error);
    }
  };


  const fetchOrders = async () => {
    setOrders([]); // Clear orders before fetching new ones
    try {
      const response = await axios.get("http://192.168.18.50:8082/pending-orders");

      if (response.data.length > 0) {
        setOrders((prevOrders) => {
          // Keep existing accepted orders
          const existingOrders = prevOrders.filter(order => order.accepted);
         
          const newOrders = response.data.map(order => ({
            ...order,
            timeLeft: order.timeLeft ?? 10, // Preserve timeLeft for existing orders
            accepted: prevOrders.find(o => o.order_id === order.order_id)?.accepted || false,
            completed: prevOrders.find(o => o.order_id === order.order_id)?.completed || false,
          }));

          return [...existingOrders, ...newOrders]; 
        });
        setError(null);
      } else {
        setOrders(prevOrders => prevOrders.filter(order => order.accepted)); 
        setError("No new orders available.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Error fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefId();
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (!order.accepted && order.timeLeft > 0) {
            return { ...order, timeLeft: order.timeLeft - 1 };
          }
          return order; 
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);




  // Handle Accept Order
  const handleAccept = async (orderId) => {
    try {
      const response = await axios.post("http://192.168.18.50:8082/accept-order", {
        order_id: orderId,
        chef_id: chefId,
      });

      if (response.data.message) {
        Alert.alert("Success", "Order accepted!");
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.order_id === orderId
              ? { ...order, timeLeft: null, accepted: true, completed: false }
              : order
          )
        );
        await AsyncStorage.setItem('orderAcceptedMessage', 'Your order has been accepted!');
      } else {
        Alert.alert("Error", "Failed to accept order.");
      }
    } catch (error) {
      console.error("Error accepting order:", error.response ? error.response.data : error);
      Alert.alert("Error", error.response?.data?.error || "Failed to accept order.");
    }
  };


  // Handle Reject Order
  const handleReject = async (orderId) => {
    try {
      const response = await axios.post("http://192.168.18.50:8082/reject-order", { order_id: orderId });

      console.log("Reject Response:", response.data);
      Alert.alert("Rejected", "Order has been declined.");
      setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
    } catch (error) {
      console.error("Error rejecting order:", error.response ? error.response.data : error);
      Alert.alert("Error", error.response?.data?.error || "Failed to reject order.");
    }
  };

  // Handle Mark Order as Completed
  const handleComplete = async (orderId) => {
    try {
      const response = await axios.post("http://192.168.18.50:8082/complete-order", { order_id: orderId });

      console.log("Complete Response:", response.data);
      Alert.alert("Success", "Order completed!");
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.order_id === orderId ? { ...order, completed: true } : order
        )
      );
    } catch (error) {
      console.error("Error completing order:", error.response ? error.response.data : error);
      Alert.alert("Error", error.response?.data?.error || "Failed to complete order.");
    }
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
      <Text style={styles.title}>Pending Orders</Text>

      {/* Show error message if there is an error */}
      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderDate}>Order ID: {item.order_id}</Text>
              <Text style={styles.tableNo}>Table: {item.table_number}</Text>
            </View>

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

            {/* Countdown Timer for Pending Orders */}
            {item.order_status === "Pending" && item.timeLeft !== null && (
              <Text style={styles.timer}>
                Accept within: {item.timeLeft}s
              </Text>
            )}

            {/* Buttons for Pending Orders */}
            {item.order_status === "Pending" && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.order_id)}>
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item.order_id)}>
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Buttons for In Progress Orders */}
            {item.order_status === "In Progress" && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.completeButton} onPress={() => handleComplete(item.order_id)}>
                  <Text style={styles.buttonText}>Mark as Completed</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item.order_id)}>
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity> */}
              </View>
            )}

            {/* Show Completed Status */}
            {item.order_status === "Completed" && (
              <Text style={styles.completedText}>Order Completed</Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

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
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: "#FFEB3B",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 14,
    fontWeight: "bold",
  },
  tableNo: {
    fontSize: 14,
    fontWeight: "bold",
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 5,
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  foodName: {
    fontSize: 14,
    flex: 1,
  },
  foodQty: {
    fontSize: 14,
    textAlign: "center",
    flex: 0.5,
  },
  foodPrice: {
    fontSize: 14,
    textAlign: "right",
    flex: 0.5,
  },
  timer: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: "red",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  completedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
});

export default ChefDashboard;