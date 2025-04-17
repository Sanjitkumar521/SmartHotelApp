import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const defaultProfileImage = "/Uploads/profile_images/default.jpg";
const localIPS = "http://192.168.18.50:8082";
const API_URL = `${localIPS}/api/update-profile`;

export default function EditProfile({ navigation }) {
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // Unified state for image
  const [customerId, setCustomerId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageError, setImageError] = useState(false); // Track image load errors

  // Validation functions
  const validateFullName = (fullName) => {
    const nameRegex = /^[A-Za-z\s]{2,}$/;
    if (!fullName) return "Full name is required";
    if (!nameRegex.test(fullName))
      return "Full name must contain only letters and spaces, min 2 characters";
    return "";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone))
      return "Phone number must be exactly 10 digits";
    return "";
  };

  const validateForm = () => {
    const nameError = validateFullName(name);
    const phoneError = validatePhone(phone);
    setErrors({ name: nameError, phone: phoneError });
    return !nameError && !phoneError;
  };

  // Fetch customer details
  const fetchCustomerDetail = async () => {
    try {
      const [id, name, phone, image] = await Promise.all([
        AsyncStorage.getItem("user_id"),
        AsyncStorage.getItem("name"),
        AsyncStorage.getItem("phone"),
        AsyncStorage.getItem("Image_URL"),
      ]);
      setCustomerId(id || "");
      setName(name || "");
      setPhone(phone || "");
      setProfileImage(image || null); // Set to null if no image

      console.log("Fetched customer details:", { id, name, phone, image });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      Alert.alert("Error", "Failed to load profile data");
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, []);

  // Handle image picker
  const handleOpenImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Please allow access to photos");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setProfileImage(result.assets[0].uri);
        setImageError(false);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Handle profile update
  const handleUpdate = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Id", customerId);
      formData.append("fullName", name);
      formData.append("phone", phone);

      if (profileImage && profileImage.startsWith("file://")) {
        formData.append("profileImage", {
          uri: profileImage,
          type: "image/jpeg",
          name: `profile_${customerId}.jpg`,
        });
      }

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Update AsyncStorage
        await Promise.all([
          AsyncStorage.setItem("name", name),
          AsyncStorage.setItem("phone", phone),
          AsyncStorage.setItem(
            "Image_URL",
            data.user.profileImage || profileImage || ""
          ),
        ]);

        Alert.alert("Success", "Profile updated successfully");
        navigation.goBack();
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            {imageError ? (
              <View style={[styles.profileImage, styles.fallbackImage]}>
                <Icon name="account" size={50} color="#666" />
              </View>
            ) : (
              <Image
                source={{
                  uri: profileImage
                    ? profileImage.startsWith("file://")
                      ? profileImage // Locally selected image
                      : `${localIPS}${profileImage}` // Server-stored image
                    : `${localIPS}${defaultProfileImage}`, // Default image
                }}
                style={styles.profileImage}
                onError={(e) => {
                  console.log("Image load error:", e.nativeEvent.error);
                  setImageError(true);
                }}
              />
            )}
            <TouchableOpacity
              style={styles.cameraIconContainer}
              onPress={handleOpenImagePicker}
            >
              <Icon name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Information</Text>

        <View>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Full Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors({ ...errors, name: validateFullName(text) });
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Phone (e.g., 9817112305)"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setErrors({ ...errors, phone: validatePhone(text) });
            }}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.updateButtonText}>
            {loading ? "Updating..." : "Update"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  scrollContainer: {
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#666",
  },
  fallbackImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    borderRadius: 15,
    padding: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginTop: -10,
  },
  updateButton: {
    backgroundColor: "#00CC44",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});