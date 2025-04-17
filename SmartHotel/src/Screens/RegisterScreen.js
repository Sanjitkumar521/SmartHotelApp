
import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }) => {
  // State for form fields
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    role: "",
    phone: "",
  });

  // State for validation errors
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    role: "",
    phone: "",
  });

  // Validation function
  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Invalid email format";
        break;
      case "username":
        if (!value.trim()) error = "Username is required";
        else if (value.length < 3)
          error = "Username must be at least 3 characters";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6)
          error = "Password must be at least 6 characters";
        break;
      case "role":
        if (!value.trim()) error = "Role is required";
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

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  // Handle input change and validate
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Check if the entire form is valid
  const isFormValid = () => {
    const validations = Object.keys(form).map((field) =>
      validateField(field, form[field])
    );
    return validations.every((valid) => valid);
  };

  // Handle form submission
  const handleRegister = async () => {
    if (!isFormValid()) {
      alert("Please fix the errors in the form");
      return;
    }

    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("name", form.name);
    formData.append("password", form.password);
    formData.append("role", form.role);
    formData.append("phone", form.phone);

    // API URL (replace with your backend URL)
    const API_URL = "http://192.168.18.50:8082/register";

    try {
      //console.log(API_URL);
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (!response.ok) {
        const data = await response.json();
        console.log("Upload Error:", data);
        throw new Error(`${data.message}`);
      }
      const data = await response.json();
      console.log("Upload Response:", data);
      navigation.navigate("loginscreen");
      //setResponse(data); // Store the data for display
    } catch (error) {
      //console.error('Upload Error:', error);
      //setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Illustration */}
        <Image
          source={require("../../assets/images/Register.png")}
          style={styles.illustration}
        />

        {/* Input Fields */}
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
          />
        </View>
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

        <View style={styles.inputContainer}>
          <FontAwesome
            name="user"
            size={24}
            color="#2D9CDB"
            style={styles.icon}
          />
          <TextInput
            placeholder="name"
            style={styles.input}
            value={form.username}
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </View>
        {errors.username ? (
          <Text style={styles.error}>{errors.username}</Text>
        ) : null}

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
          />
        </View>
        {errors.password ? (
          <Text style={styles.error}>{errors.password}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <FontAwesome
            name="user-circle"
            size={24}
            color="#2D9CDB"
            style={styles.icon}
          />
          <TextInput
            placeholder="Role (e.g., User, Admin)"
            style={styles.input}
            value={form.role}
            onChangeText={(text) => handleInputChange("role", text)}
          />
        </View>
        {errors.role ? <Text style={styles.error}>{errors.role}</Text> : null}

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
          />
        </View>
        {errors.phone ? <Text style={styles.error}>{errors.phone}</Text> : null}

        {/* Navigation Links */}
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("loginscreen")}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>Register</Text>
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
  registerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
