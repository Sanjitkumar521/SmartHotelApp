// AppNavigation.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
// import LoginScreen from './Screens/LoginScreen';
import SplashScreen from './src/Screens/SplashScreen.js';
import Register from './src/Screens/RegisterScreen.js';
import Login from './src/Screens/LoginScreen.js';
import HomeScreen from './src/Screens/HomeScreen.js';
import CartScreen from './src/Screens/CartScreen.js';
import Navigator from './navigation/BottomNavigator.js';
import DetailsScreen from './src/Screens/DetailsScreen.js';
import LoyaltyScreen from './src/Screens/LoyaltyScreen.js';
import AdminDashboard from './src/Screens/AdminDashboard.js';
import AdminNavigator from './navigation/AdminNavigator.js';
import AddMenu from './src/Screens/AddMenu.js';
import UpdateMenu from './src/Screens/UpdateMenu.js';
import DeleteMenu from './src/Screens/DeleteScreen.js';
import ChefDashboard from './src/Screens/ChefDashboard.js';
import OrderItemScreen from './src/Screens/OrderItemScreen.js';
import UpdateProfileScreen from './src/Screens/UpdateProfileScren.js';
import EditProfile from './src/Screens/EditProfile.js';
import ForgotPassword from './src/Screens/ForgotPassword.js'
import CheckEmailScreen from './src/Screens/CheckEmailScreen.js';
import SetNewPasswordScreen from './src/Screens/SetNewPasswordScreen.js';



const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="SplashScreen"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="loginscreen" component={Login} />
        <Stack.Screen name="Homescreen" component={HomeScreen} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="BottomNavigator" component={Navigator} />
        <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
        <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="AdminNavigator" component={AdminNavigator} />
        <Stack.Screen name='AddMenu' component={AddMenu} />
        <Stack.Screen name='UpdateMenu' component={UpdateMenu} />
        <Stack.Screen name='DeleteScreen' component={DeleteMenu} />
        <Stack.Screen name='chefDashboard' component={ChefDashboard} />
        <Stack.Screen name='OrderItemScreen' component={OrderItemScreen} />
        <Stack.Screen name='UpdateProfileScreen' component={UpdateProfileScreen} />
        <Stack.Screen name='EditProfile' component={EditProfile} />
        <Stack.Screen name='Forgetpassword' component={ForgotPassword} />
        <Stack.Screen name='CheckEmailScreen' component={CheckEmailScreen} />
        <Stack.Screen name='SetNewPasswordScreen' component={SetNewPasswordScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;