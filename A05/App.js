// App.js
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon cho Tab và Back
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
import Transaction from './screens/Transaction';
import EditTransaction from './screens/EditTransaction';
import SettingsPage from './screens/SettingsPage'; // Import SettingsPage
import Language from './screens/LanguagePage'; // Import other Settings related pages
import ContactUs from './screens/ContactUsPage';
import ChangePassword from './screens/ChangePasswordPage';
import PrivacyPolicy from './screens/PrivacyPolicyPage';

// Import TabNavigator
import TabNavigator from './navigation/TabNavigator';

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
        initialRouteName={isLoggedIn ? "Main" : "Login"}
        screenOptions={({ navigation }) => ({
          backgroundColor: "white",
          headerStyle: { backgroundColor: "#0163d2" },
          headerTintColor: "#fff",
          headerTitleAlign: "center", // Căn giữa tiêu đề
          // Chỉ hiện nút Back khi có màn hình để quay lại
          headerLeft: () => (
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null
          ),
        })}
      >
        {/* Tab Navigator */}
        {isLoggedIn ? (
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }} // Không hiển thị tiêu đề khi ở Tab
          />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Introduction" component={IntroductionPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="EnterOTP" component={EnterOTP} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="EnterOTP2" component={EnterOTP2} />
            <Stack.Screen name="EnterOTP3" component={EnterOTP3} />
          </>
        )}

        {/* Stack Screens */}
        <Stack.Screen 
          name="Edit" 
          component={EditProfile} 
          options={{ headerTitle: "Edit Profile" }}
        />
        <Stack.Screen 
          name="Transaction" 
          component={Transaction} 
          options={{ headerTitle: "Transaction Details" }}
        />
        <Stack.Screen 
          name="EditTransaction" 
          component={EditTransaction} 
          options={{ headerTitle: "Edit Transaction" }}
        />

        {/* Settings Screens */}
        <Stack.Screen 
          name="SettingsPage" 
          component={SettingsPage} 
          options={{ headerTitle: "Settings" }}
        />
        <Stack.Screen 
          name="ProfilePage" 
          component={ProfilePage} 
          options={{ headerTitle: "My Profile" }}
        />
        <Stack.Screen 
          name="ContactUs" 
          component={ContactUs} 
          options={{ headerTitle: "Contact Us" }}
        />
        <Stack.Screen 
          name="Language" 
          component={Language} 
          options={{ headerTitle: "Language" }}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePassword} 
          options={{ headerTitle: "Change Password" }}
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicy} 
          options={{ headerTitle: "Privacy Policy" }}
        />
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
