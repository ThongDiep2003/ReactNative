import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon cho Tab và Back
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
const Tab = createBottomTabNavigator();

// Tạo Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Add') {
            iconName = 'add-circle';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Logout') {
            iconName = 'log-out';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0163d2',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center', // Căn giữa tiêu đề
        headerStyle: {
          backgroundColor: '#0163d2',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomePage} 
        options={{ headerTitleAlign: "center" }} // Căn giữa tiêu đề
      />
      <Tab.Screen 
        name="Add" 
        component={HomeContent} 
        options={{ headerTitleAlign: "center" }} // Căn giữa tiêu đề
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfilePage} 
        options={{ headerTitleAlign: "center" }} // Căn giữa tiêu đề
      />
      <Tab.Screen 
        name="Logout" 
        component={LogoutPage} 
        options={{ headerTitleAlign: "center" }} // Căn giữa tiêu đề
      />
    </Tab.Navigator>
  );
};

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
