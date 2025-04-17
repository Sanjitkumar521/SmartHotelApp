import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
//import * as ImagePicker from "expo-image-picker"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const defaultProfileImage = "/uploads/profile_images/Avishek Chaudhary.JPG";

let localIPS = "http://192.168.18.50:8082";

const UpdateProfileScreen = () => {
  const navigation = useNavigation();
  //const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  // // Function to open gallery using expo-image-picker
  // const handleOpenImagePicker = async () => {
  //   // No permissions request is necessary for launching the image library
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ["images"],
  //     quality: 1,
  //   });

  //   if (!result.canceled && result.assets && result.assets[0].uri) {
  //     setProfileImage(result.assets[0].uri);
  //     setImageError(false);
  //   } else if (result.canceled) {
  //     console.log("User cancelled gallery");
  //   } else {
  //     Alert.alert("Error", "Failed to select image.");
  //   }
  // };

  // const handleAddPhoto = () => {
  //   Alert.alert("Add Photo", "Choose an option to add a profile photo", [
  //     {
  //       text: "Gallery",
  //       onPress: handleOpenImagePicker,
  //     },
  //     { text: "Cancel", style: "cancel" },
  //   ]);
  // };

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

  return (
    <View style={styles.container}>
      {/* Header with Close Button and Logo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.logo}></Text>
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {imageError ? (
            <View style={[styles.profileImage, styles.fallbackImage]}>
              <Icon name="person" size={50} color="#666" />
            </View>
          ) : (
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
          )}
          {/* <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
          >
            <Icon name="add" size={16} color="#fff" />
          </TouchableOpacity> */}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.premiumBadge}>
            <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            >
                <Text style={styles.premiumText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionHeader}>GENERAL</Text>
        <MenuItem icon="person" label="My Account" />
        <MenuItem icon="list" label="My Orders" />
        <MenuItem icon="credit-card" label="Payment" />
        <MenuItem icon="location-on" label="Addresses" />
        <MenuItem icon="star" label="Subscription" />
        <MenuItem icon="settings" label="Settings" />
      </View>
    </View>
  );
};

const MenuItem = ({ icon, label }) => (
  <TouchableOpacity style={styles.menuItem}>
    <Icon name={icon} size={24} color="#666" style={styles.menuIcon} />
    <Text style={styles.menuText}>{label}</Text>
    <Icon
      name="chevron-right"
      size={24}
      color="#666"
      style={styles.arrowIcon}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 20,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  profileSection: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  fallbackImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFA500",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  premiumText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
  },
  menuSection: {
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 14,
    color: "#999",
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  arrowIcon: {
    marginLeft: "auto",
  },
});

export default UpdateProfileScreen;
