import "react-native-gesture-handler";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "../src/constant/colors";
import { View } from "react-native";
import HomeScreen from "../src/Screens/HomeScreen";
import LoyaltyScreen from "../src/Screens/LoyaltyScreen";
import OrderItemScreen from "../src/Screens/OrderItemScreen";



const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
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
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home-filled" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={OrderItemScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="access-time" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View
              style={{
                height: 60,
                width: 60,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: COLORS.white,
                borderColor: COLORS.primary,
                borderWidth: 2,
                borderRadius: 30,
                top: -25,
                elevation: 5,
              }}
            >
              <Icon name="search" color={COLORS.primary} size={28} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Loyalty Points"
        component={LoyaltyScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="loyalty" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="shopping-cart" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;
