import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon cho Back
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import các trang
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
import Transaction from './screens/Transaction';
import EditTransaction from './screens/EditTransaction';

// Import TabNavigator cho Bottom Tabs
import TabNavigator from "./navigation/TabNavigator"; 

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        setIsLoggedIn(!!token); // Kiểm tra token và đặt trạng thái đăng nhập
      } catch (error) {
        console.error('Failed to check login status:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    return null; // Hiển thị màn hình trắng hoặc spinner khi đang kiểm tra trạng thái đăng nhập
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isLoggedIn ? "Main" : "Login"}
        screenOptions={({ navigation }) => ({
          backgroundColor: "white",
          headerStyle: { backgroundColor: "#0163d2" },
          headerTintColor: "#fff",
          headerTitleAlign: "center", // Căn giữa tiêu đề
          headerLeft: () => (
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null
          ),
        })}
      >
        
          <>
            {/* TabNavigator để chứa các tab chính */}
            <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfilePage} />
            <Stack.Screen name="Edit" component={EditProfile} options={{ headerTitle: "Edit Profile" }} />
            <Stack.Screen name="Transaction" component={Transaction} options={{ headerTitle: "Transaction Details" }} />
            <Stack.Screen name="EditTransaction" component={EditTransaction} options={{ headerTitle: "Edit Transaction" }} />
            <Stack.Screen name="Logout" component={LogoutPage} />
          </>
      
          <>
            {/* Stack Screens cho người dùng chưa đăng nhập */}
            
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Introduction" component={IntroductionPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="EnterOTP" component={EnterOTP} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="EnterOTP2" component={EnterOTP2} />
            <Stack.Screen name="EnterOTP3" component={EnterOTP3} />
            
          </>
     
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
