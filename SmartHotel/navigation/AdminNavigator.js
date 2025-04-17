import "react-native-gesture-handler";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../src/constant/colors";
import { View } from "react-native";
import HomeScreen from "../src/Screens/HomeScreen";
import LoyaltyScreen from "../src/Screens/LoyaltyScreen";
import AdminDashboard from "../src/Screens/AdminDashboard";
import AddMenu from "../src/Screens/AddMenu";
import UpdateMenu from "../src/Screens/UpdateMenu";
import DeleteMenu from "../src/Screens/DeleteScreen";

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        style: {
          height: 55,
          borderTopWidth: 0,
          elevation: 0,
        },
        showLabel: false,
        activeTintColor: COLORS.primary,
      }}
    >
      <Tab.Screen
        name="HomeScreen"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home-filled" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name=" Add Menu"
        component={AddMenu}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="restaurant-menu" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Update Menu"
        component={UpdateMenu}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="edit" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Delete Menu"
        component={DeleteMenu}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="delete" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
