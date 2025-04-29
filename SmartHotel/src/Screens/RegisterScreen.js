import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator, // Added for loading state
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    role: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    name: "",
    password: "",
    role: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false); // Added loading state

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Invalid email format";
        break;
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.length < 3)
          error = "Name must be at least 3 characters";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6)
          error = "Password must be at least 6 characters";
        break;
      case "role":
        const validRoles = ["Customer", "Admin", "Chef"];
        if (!value.trim()) error = "Role is required";
        else if (!validRoles.includes(value)) error = "Invalid role";
        break;
      case "phone":
        const phoneRegex = /^\d{10}$/;
        if (!value.trim()) error = "Phone number is required";
        else if (!phoneRegex.test(value))
          error = "Phone number must be 10 digits";
        break;
      default:
        break;
    }

    setErrors((prev) => {
      const updatedErrors = { ...prev, [field]: error };
      console.log(`Validation for ${field}:`, updatedErrors);
      return updatedErrors;
    });
    return error === "";
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const isFormValid = () => {
    const validations = Object.keys(form).map((field) =>
      validateField(field, form[field])
    );
    return validations.every((valid) => valid);
  };

  const handleRegister = async () => {
    if (!isFormValid()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }

    setLoading(true); // Set loading to true

    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("name", form.name);
    formData.append("password", form.password);
    formData.append("role", form.role);
    formData.append("phone", form.phone);

    const API_URL = "http://192.168.18.50:8082/register";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Upload Error:", data);
        Alert.alert("Registration Failed", data.error || "An error occurred during registration");
        return;
      }

      console.log("Upload Response:", data);
      Alert.alert("Success", "User registered successfully!", [
        { text: "OK", onPress: () => navigation.navigate("loginscreen") },
      ]);
    } catch (error) {
      console.error("Registration Error:", error.message);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/Register.png")}
          style={styles.illustration}
        />

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={24}
            color="#2D9CDB"
            style={styles.icon}
          />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={form.email}
            onChangeText={(text) => handleInputChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading} // Disable input while loading
          />
        </View>
        {errors.email?.length > 0 && (
          <Text style={styles.error}>{errors.email}</Text>
        )}

        <View style={styles.inputContainer}>
          <FontAwesome
            name="user"
            size={24}
            color="#2D9CDB"
            style={styles.icon}
          />
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={form.name}
            onChangeText={(text) => handleInputChange("name", text)}
            editable={!loading}
          />
        </View>
        {errors.name?.length > 0 && (
          <Text style={styles.error}>{errors.name}</Text>
        )}

        <View style={styles.inputContainer}>
          <FontAwesome
            name="lock"
            size={24}
            color="#2D9CDB"
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={form.password}
            onChangeText={(text) => handleInputChange("password", text)}
            editable={!loading}
          />
        </View>
        {errors.password?.length > 0 && (
          <Text style={styles.error}>{errors.password}</Text>
        )}

        <View style={styles.inputContainer}>
          <FontAwesome
            name="user-circle"
            size={24}
            color="#2D9CDB"
            style={styles.icon}
          />
          <TextInput
            placeholder="Role (Customer, Admin, Chef)"
            style={styles.input}
            value={form.role}
            onChangeText={(text) => handleInputChange("role", text)}
            editable={!loading}
          />
        </View>
        {errors.role?.length > 0 && (
          <Text style={styles.error}>{errors.role}</Text>
        )}

        <View style={styles.inputContainer}>
          <FontAwesome
            name="phone"
            size={24}
            color="#2D9CDB"
            style={styles.icon}
          />
          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            value={form.phone}
            onChangeText={(text) => handleInputChange("phone", text)}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>
        {errors.phone?.length > 0 && (
          <Text style={styles.error}>{errors.phone}</Text>
        )}

        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("loginscreen")}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#2D9CDB",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  illustration: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: "100%",
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 15,
  },
  linkContainer: {
    marginTop: 10,
  },
  linkText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#F4A261",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  registerButtonDisabled: {
    backgroundColor: "#d1a575", // Lighter shade to indicate disabled state
    opacity: 0.7,
  },
  registerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RegisterScreen;