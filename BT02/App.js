import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; 
import { StyleSheet } from "react-native"; 

// Import các trang
import HomePage from "./screens/HomePage";
import IntroductionPage from "./screens/IntroductionPage";
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage";
import ForgotPassword from "./screens/ForgotPassword";

// Tạo Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Introduction" component={IntroductionPage} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Định nghĩa các style
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
