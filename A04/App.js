import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import các trang
import HomePage from "./screens/HomePage";
import IntroductionPage from "./screens/IntroductionPage";
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage";
import ForgotPassword from "./screens/ForgotPassword";
import ProfilePage from "./screens/ProfilePage";
import EditProfile from "./screens/EditProfile";
import ResetPassword from "./screens/ResetPassword";
import EnterOTP from "./screens/EnterOTP";
import EnterOTP2 from "./screens/EnterOTP2";
import EnterOTP3 from "./screens/EnterOTP3";
import LogoutPage from "./screens/LogoutPage";
import HomeContent from "./screens/HomeContent";
import Transaction from './screens/Transaction';
import EditTransaction from './screens/EditTransaction';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Failed to check login status:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    return null; // Render nothing or a loading spinner while checking login status
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isLoggedIn ? "Home" : "Login"}
        screenOptions={{
          backgroundColor: "white",
          headerStyle: { backgroundColor: "#0163d2" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}>
        
            <Stack.Screen name="Home" component={HomePage} />
            <Stack.Screen name="Add Transaction" component={HomeContent} />
            <Stack.Screen name="Transaction" component={Transaction} />
            <Stack.Screen name="Profile" component={ProfilePage} />
            <Stack.Screen name="Edit" component={EditProfile} />
            <Stack.Screen name="Logout" component={LogoutPage} />
            <Stack.Screen name="EditTransaction" component={EditTransaction} />
            
          
         
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Introduction" component={IntroductionPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="EnterOTP" component={EnterOTP} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="EnterOTP2" component={EnterOTP2} />
            <Stack.Screen name="EnterOTP3" component={EnterOTP3} />
        
      
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default App;
