import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../constant/colors';

const { width } = Dimensions.get('screen');
const cardWidth = width / 2 - 20;

const defaultProfileImage = "/uploads/profile_images/Avishek Chaudhary.JPG";

let localIPS = "http://192.168.18.50:8082";

const HomeScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderMessage, setOrderMessage] = useState(null);
  //const [userName, setUserName] = useState('Ariz');

  const [customerId, setCustomerId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState("");
  const [phone, setPhone] = useState("");

  const fetchCustomerDetail = async () => {
    try {
      const id = await AsyncStorage.getItem("user_id");
      const email = await AsyncStorage.getItem("email");
      const name = await AsyncStorage.getItem("name");
      const profileImage = await AsyncStorage.getItem("Image_URL");
      const phone = await AsyncStorage.getItem("phone");

      setCustomerId(id);
      setEmail(email);
      setName(name);
      setUserData(profileImage);
      setPhone(phone);
      //set;
    } catch (error) {
      console.error("Error fetching customer ID:", error);
      setImageError("Error fetching customer ID.");
    }
  };

  // Fetch customer ID on component mount
  useEffect(() => {
    fetchCustomerDetail();
  }, []);

  console.log(name, email, userData);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://192.168.18.50:8082/menu');
      setMenuItems(response.data);
      setFilteredMenuItems(response.data);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    //fetchUserName(); // Fetch user name on mount
    //return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orderMessage) {
      Alert.alert('Order Update', orderMessage, [
        { text: 'OK', onPress: () => setOrderMessage(null) },
      ]);
    }
  }, [orderMessage]);

  // Handle search input and filter menu items
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMenuItems(menuItems);
    } else {
      const filtered = menuItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMenuItems(filtered);
    }
  }, [searchQuery, menuItems]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const addToCart = (food) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.menu_id === food.menu_id);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      }
      return [...prevCart, { ...food, quantity: 1 }];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const Card = ({ food }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('DetailsScreen', {
            id: food.menu_id,
            name: food.name,
            description: food.description,
            price: food.price,
            image_url: food.image_url,
            addToCart,
          })
        }
      >
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: food.image_url }} style={styles.foodImage} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.foodName} numberOfLines={1} ellipsizeMode="tail">
              {food.name}
            </Text>
            <Text style={styles.foodIngredients} numberOfLines={5} ellipsizeMode="tail">
              {food.description}
            </Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.foodPrice}>${food.price}</Text>
            <TouchableOpacity style={styles.addToCartBtn} onPress={() => addToCart(food)}>
              <Icon name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Hello  {name}</Text>
          <Text style={styles.subText}>What do you want today?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('UpdateProfileScreen')}>
          <Image
            source={{
              uri:
                userData &&
                  !userData.startsWith("file://")
                  ? `${localIPS}/${userData}` // Server path
                  : userData &&
                    userData.startsWith("file://")
                    ? userData
                    : `${localIPS}${defaultProfileImage}`, // Default image
            }}
            //style={styles.profileImage}
            onError={(error) =>
              console.log("Image load error:", error.nativeEvent.error)
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Icon name="search" size={28} />
          <TextInput
            style={styles.input}
            placeholder="Search for food"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.sortBtn}>
          <Icon name="tune" size={28} color={COLORS.white} />
        </View>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        numColumns={2}
        data={filteredMenuItems}
        keyExtractor={(item) => item.menu_id.toString()}
        renderItem={({ item }) => <Card food={item} />}
      />
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() =>
          navigation.navigate('CartScreen', {
            cart,
            clearCart,
            setCart,
          })
        }
      >
        <Icon name="shopping-cart" size={28} color={COLORS.white} />
        <Text style={styles.cartButtonText}>{cart.length}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  greetingText: {
    fontSize: 28,
  },
  subText: {
    marginTop: 5,
    fontSize: 22,
    color: COLORS.grey,
  },
  profileImage: {
    height: 70,
    width: 70,
    borderRadius: 36,
  },
  searchContainer: {
    marginTop: 40,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  inputContainer: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: COLORS.light,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
  sortBtn: {
    width: 50,
    height: 50,
    marginLeft: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    position: 'relative',
    width: 170,
    marginTop: 50,
    borderRadius: 15,
    elevation: 13,
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 10,
  },
  imageContainer: {
    alignItems: 'center',
    top: -40,
  },
  foodImage: {
    height: 120,
    width: 120,
    borderRadius: 8,
  },
  cardContent: {
    position: 'relative',
    marginTop: -30,
    alignItems: 'left',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  foodIngredients: {
    minHeight: 70,
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 5,
  },
  cardFooter: {
    marginTop: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addToCartBtn: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    position: 'absolute',
    top: -5,
    left: 15,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default HomeScreen;