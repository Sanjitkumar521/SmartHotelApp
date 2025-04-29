import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://192.168.18.50:8082/login", {
        email: email,
        password: password,
      });

      console.log(response.data);

      if (response.data && response.data.message === "Login successful") {
        const { user_id, role, name, Image_URL, phone } = response.data;

        await AsyncStorage.setItem("user_id", user_id.toString());
        await AsyncStorage.setItem("role", role);
        await AsyncStorage.setItem("name", name);
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("Image_URL", Image_URL || "");
        await AsyncStorage.setItem("phone", phone);

        Alert.alert("Success", "Login successful!");

        if (role === "Customer") {
          navigation.navigate("Homescreen");
          navigation.navigate("BottomNavigator");
        } else if (role === "Admin") {
          navigation.navigate("AdminDashboard");
          navigation.navigate("AdminNavigator");
        } else if (role === "Chef") {
          navigation.navigate("chefDashboard");
        }
      } else {
        Alert.alert(
          "error",
          response.data.error || "Email or Password do not match."
        );
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("error", "Email or Password do not match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/loginwalk.png")}
          style={styles.image}
        />
      </View>

      <Text style={styles.title}>Welcome Back</Text>
      {/* <Text style={styles.subtitle}>Please log in to continue</Text> */}

      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={20}
          color="#666"
          style={styles.icon}
        />
        <TextInput
          placeholder="Username, Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#666"
          style={styles.icon}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons
            name={passwordVisible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Forgetpassword")}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginText}>Login</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2EC4B6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    // marginTop:20,
    paddingTop:50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    alignSelf:'center',
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
  },
  linkText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#CDAA7D",
    paddingVertical: 12,
    borderRadius: 50,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;