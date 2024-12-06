import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from 'react-native-vector-icons/Ionicons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermission } from "./services/nofitication";

ErrorUtils.setGlobalHandler((error, isFatal) => {
  // Ghi log lỗi nhưng không hiển thị trên giao diện
  if (__DEV__) {
    console.log('Error:', error);
  }
});

// Import các trang
import SplashScreen from "./screens/splash/SplashScreen";
import SplashScreen1 from "./screens/splash/SplashScreen1";  
import SplashScreen2 from "./screens/splash/SplashScreen2";
import SplashScreen3 from "./screens/splash/SplashScreen3";

import IntroductionPage from "./screens/introview/IntroductionPage";
import LoginPage from "./screens/account/LoginPage";
import RegisterPage from "./screens/account/RegisterPage";
import ForgotPassword from "./screens/account/ForgotPassword";
import ProfilePage from "./screens/setting/ProfilePage";
import EditProfile from "./screens/setting/EditProfile";
import ResetPassword from "./screens/account/ResetPassword";
import EnterOTP from "./screens/otp/EnterOTP";
import EnterOTP2 from "./screens/otp/EnterOTP2";
import EnterOTP3 from "./screens/otp/EnterOTP3";
import LogoutPage from "./screens/account/LogoutPage";
import Transaction from './screens/home/transaction/Transaction';
import AllTransaction from './screens/home/transaction/AllTransaction';
import EditTransaction from './screens/home/transaction/EditTransaction';
import CategoryPage from './screens/home/transaction/category/user/CategoryPage';
import CategoryManagementPage from './screens/home/transaction/category/CategoryManagementPage';
import DefaultCategory from './screens/home/transaction/category/default/DefaultCategory';

import BudgetPage from "./screens/home/budget/BudgetPage";
import AddBudgetPage from "./screens/home/budget/AddBudgetPage";
import IconSelectionPage from "./screens/home/budget/IconSelectionPage"
import EditBudgetPage from "./screens/home/budget/EditBudgetPage";

import SettingsPage from './screens/setting/SettingsPage';
import Language from './screens/setting/LanguagePage';
import ContactUs from './screens/setting/ContactUsPage';
import ChangePassword from './screens/setting/ChangePasswordPage';
import PrivacyPolicy from './screens/setting/PrivacyPolicyPage';

import Move2 from './screens/move/Move2';
import Move3 from './screens/move/Move3';

// Import TabNavigator cho Bottom Tabs
import TabNavigator from "./navigation/TabNavigator"; 

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  // Yêu cầu quyền thông báo khi khởi chạy ứng dụng
  useEffect(() => {
    requestNotificationPermission();
  }, []);
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
        initialRouteName={isLoggedIn ? "Main" : "SplashScreen"}
        screenOptions={({ navigation }) => ({
          backgroundColor: "white",
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#1E1E2D",
          headerTitleAlign: "center", // Căn giữa tiêu đề
          headerLeft: () => (
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#1E1E2D" />
              </TouchableOpacity>
            ) : null
          ),
        })}
      >
        
          <>

            {/* Splash Screen */}
            <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SplashScreen1" component={SplashScreen1} options={{ headerShown: false }} />
            <Stack.Screen name="SplashScreen2" component={SplashScreen2} options={{ headerShown: false }} />
            <Stack.Screen name="SplashScreen3" component={SplashScreen3} options={{ headerShown: false }} />

            {/* TabNavigator để chứa các tab chính */}
            <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfilePage} />
            <Stack.Screen name="Edit" component={EditProfile} options={{ headerTitle: "Edit Profile" }} />
            <Stack.Screen name="Transaction" component={Transaction} options={{ headerTitle: "Transaction Details" }} />
            <Stack.Screen name="AllTransaction" component={AllTransaction} options={{ headerTitle: "All Transaction" }} />
            <Stack.Screen name="EditTransaction" component={EditTransaction} options={{ headerTitle: "Edit Transaction" }} />
            <Stack.Screen name="Logout" component={LogoutPage} />
            <Stack.Screen name="Category" component={CategoryPage} />
            <Stack.Screen name="CategoryManagement" component={CategoryManagementPage} />
            <Stack.Screen name="Default" component={DefaultCategory} />
          </>
      
          <>
            {/* Stack Screens cho người dùng chưa đăng nhập */}
            
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Introduction" component={IntroductionPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            
            {/* Move */}
            <Stack.Screen name="Move2" component={Move2} />
            <Stack.Screen name="Move3" component={Move3} />

            {/* OTP */}
            <Stack.Screen name="EnterOTP" component={EnterOTP} />
            <Stack.Screen name="EnterOTP2" component={EnterOTP2} />
            <Stack.Screen name="EnterOTP3" component={EnterOTP3} />
            
          </>


        {/* Stack Screens */}

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
        <Stack.Screen
          name="LogoutPage"
          component={LogoutPage}
          options={{ headerTitle: "Logout" }}
        />

    {/* Settings Screens */}
    <Stack.Screen
      name="BudgetPage"
      component={BudgetPage}
      options={{ headerTitle: "Budget" }}
    />
    <Stack.Screen
      name="AddBudget"
      component={AddBudgetPage}
      options={{ headerTitle: "Add Budget" }}
    />
    <Stack.Screen
      name="IconSelection"
      component={IconSelectionPage}
      options={{ headerTitle: "Select Icon" }}
    />
    <Stack.Screen
      name="EditBudget"
      component={EditBudgetPage}
      options={{ headerTitle: "Edit Budget" }}
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