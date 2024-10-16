// navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Import các trang
import HomePage from '../screens/home/HomePage';
import AddTransaction from '../screens/home/transaction/AddTransactionPage'; 
import StatisticPage from '../screens/home/StatisticPage'; 
import BudgetPage from '../screens/home/budget/BudgetPage'; 
import SettingsPage from '../screens/setting/SettingsPage'; // Import Settings Page

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Statistics') {
            iconName = 'stats-chart';
          } else if (route.name === 'AddTransaction') {
            iconName = 'add-circle'; 
          } else if (route.name === 'Budget') {
            iconName = 'wallet';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0163d2',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#0163d2' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Statistics" component={StatisticPage} />
      <Tab.Screen name="AddTransaction" component={AddTransaction} options={{ title: 'Add' }} />
      <Tab.Screen name="Budget" component={BudgetPage} />
      <Tab.Screen name="Settings" component={SettingsPage} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
