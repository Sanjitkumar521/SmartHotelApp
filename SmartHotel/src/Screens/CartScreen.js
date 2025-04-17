import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Image, FlatList, Alert, TextInput, Modal, Button, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constant/colors';
import { PrimaryButton } from '../../Components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({ route, navigation }) => {
  const { cart, clearCart, setCart } = route.params; // Added setCart from params
  const [cartItems, setCartItems] = useState(cart || []);
  const [tableNumber, setTableNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');

  // Sync cartItems with HomeScreen's cart state
  useEffect(() => {
    setCart(cartItems); // Update HomeScreen's cart whenever cartItems changes
  }, [cartItems, setCart]);

  // Update cartItems when route.params.cart changes
  useEffect(() => {
    if (route.params.cart) {
      setCartItems(route.params.cart);
    }
  }, [route.params.cart]);

  const updateQuantity = (menu_id, type) => {
    setCartItems((prevItems) => {
      if (type === 'increase') {
        return prevItems.map((item) =>
          item.menu_id === menu_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else if (type === 'decrease') {
        const newItems = prevItems.map((item) =>
          item.menu_id === menu_id ? { ...item, quantity: item.quantity - 1 } : item
        );
        // Remove item if quantity becomes 0
        return newItems.filter((item) => item.quantity > 0);
      }
      return prevItems;
    });
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!tableNumber.trim()) {
      Alert.alert('Error', 'Please enter a table number.');
      return;
    }

    const orderData = {
      table_number: parseInt(tableNumber),
      customer_id: 1,
      cart_items: cartItems.map((item) => ({
        menu_id: item.menu_id,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
    };

    try {
      const response = await fetch('http://192.168.18.50:8082/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('✅ Order Placed', `Your order (ID: ${data.order_id}) has been placed successfully!`);
        setCartItems([]);
        setTableNumber('');
        setModalVisible(false);
        setOrderStatus(`Order placed successfully! ID: ${data.order_id}`);
        await clearCart();
        await AsyncStorage.setItem('orderPlaced', 'true');
        navigation.navigate('HomeScreen');
      } else {
        Alert.alert('❌ Error', data.error || 'An unexpected error occurred.');
        setOrderStatus('Error placing order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('❌ Error', 'Failed to place order. Try again.');
      setOrderStatus('Error placing order. Please try again.');
    }
  };

  const submitReview = async () => {
    if (!rating || !feedback || !selectedMenuId) {
      Alert.alert('Error', 'Please provide rating, feedback, and select an item.');
      return;
    }

    const reviewData = {
      customer_id: 1,
      customer_name: 'Ariz',
      menu_id: selectedMenuId,
      rating: parseInt(rating),
      feedback,
    };

    try {
      const response = await fetch('http://192.168.18.50:8082/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('✅ Review Submitted', 'Thank you for your feedback!');
        setReviewModalVisible(false);
        setRating('');
        setFeedback('');
        setSelectedMenuId(null);
      } else {
        Alert.alert('❌ Error', data.error || 'Failed to submit review.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('❌ Error', 'Failed to submit review. Try again.');
    }
  };

  const confirmTableNumber = () => {
    if (!tableNumber.trim()) {
      Alert.alert('Error', 'Please enter a table number.');
      return;
    }
    setModalVisible(false);
    placeOrder();
  };

  const openReviewModal = (menu_id) => {
    setSelectedMenuId(menu_id);
    setReviewModalVisible(true);
  };

  const CartCard = ({ item }) => {
    return (
      <View style={style.cartCard}>
        <Image source={{ uri: item.image_url }} style={style.image} />
        <View style={style.itemDetails}>
          <Text style={style.itemName}>{item.name}</Text>
          <Text style={style.itemDescription} numberOfLines={2}>{item.description}</Text>
          <Text style={style.itemPrice}>${item.price}</Text>
          <TouchableOpacity onPress={() => openReviewModal(item.menu_id)}>
            <Text style={style.reviewLink}>Add Review</Text>
          </TouchableOpacity>
        </View>
        <View style={style.quantityContainer}>
          <View style={style.actionBtn}>
            <TouchableOpacity onPress={() => updateQuantity(item.menu_id, 'decrease')}>
              <Icon name="remove" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={style.quantityText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.menu_id, 'increase')}>
              <Icon name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={style.container}>
      <View style={style.header}>
        <Icon name="arrow-back-ios" size={28} onPress={navigation.goBack} />
        <Text style={style.headerText}>Cart</Text>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={style.flatList}
        data={cartItems}
        renderItem={({ item }) => <CartCard item={item} />}
        ListFooterComponent={() => (
          <View>
            <View style={style.footerContainer}>
              <Text style={style.totalText}>Total Price</Text>
              <Text style={style.totalText}>${totalPrice.toFixed(2)}</Text>
            </View>
            <View style={style.buttonContainer}>
              <PrimaryButton title="Place Order" onPress={() => setModalVisible(true)} />
            </View>
            {orderStatus ? (
              <View style={style.statusContainer}>
                <Text style={style.statusText}>{orderStatus}</Text>
              </View>
            ) : null}
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={style.modalContainer}>
          <View style={style.modalView}>
            <Text style={style.modalTitle}>Enter Table Number</Text>
            <TextInput
              style={style.input}
              placeholder="Table Number"
              keyboardType="numeric"
              value={tableNumber}
              onChangeText={setTableNumber}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <Button title="Confirm" onPress={confirmTableNumber} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={style.modalContainer}>
          <View style={style.modalView}>
            <Text style={style.modalTitle}>Submit Review</Text>
            <TextInput
              style={style.input}
              placeholder="Rating (1-5)"
              keyboardType="numeric"
              value={rating}
              onChangeText={setRating}
            />
            <TextInput
              style={style.input}
              placeholder="Feedback"
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
            <Button title="Submit" onPress={submitReview} />
            <Button title="Cancel" onPress={() => setReviewModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  flatList: {
    paddingBottom: 80,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 12,
    color: COLORS.grey,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewLink: {
    fontSize: 12,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  quantityContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginHorizontal: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 15,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginHorizontal: 30,
  },
  statusContainer: {
    marginTop: 10,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.grey,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
});

export default CartScreen;