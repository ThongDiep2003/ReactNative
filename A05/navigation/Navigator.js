import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from '../screens/HomePage';
import ProfilePage from '../screens/ProfilePage';
import CreateTransaction from '../screens/CreateTransaction'; // Floating button leads here
import Icon from 'react-native-vector-icons/Entypo';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';

const Tab = createBottomTabNavigator();

const FloatingButton = ({ onPress }) => (
  <TouchableOpacity
    style={tw`absolute bottom-10 w-16 h-16 bg-purple-500 rounded-full justify-center items-center`}
    onPress={onPress}
  >
    <Text style={tw`text-white text-3xl`}>+</Text>
  </TouchableOpacity>
);

const HomeScreenWithButton = ({ navigation }) => (
  <>
    <HomePage />
    <FloatingButton onPress={() => navigation.navigate('CreateTransaction')} />
  </>
);

const ProfileScreenWithButton = ({ navigation }) => (
  <>
    <ProfilePage />
    <FloatingButton onPress={() => navigation.navigate('CreateTransaction')} />
  </>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: tw`bg-white border-t border-gray-200`,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreenWithButton}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreenWithButton}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Logout"
        component={() => <Text>Logout</Text>} // You can replace this with Logout functionality
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="log-out" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
