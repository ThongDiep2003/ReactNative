import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_AUTH } from '../../auths/FirebaseConfig'; // Ensure the correct Firebase path
import { CommonActions } from '@react-navigation/native';

const LogoutPage = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(FIREBASE_AUTH);
      // Remove the token from AsyncStorage
      await AsyncStorage.removeItem('jwtToken');

      // Reset the navigation stack and navigate to the Login screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }], // Navigates to Login screen
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout failed', 'An error occurred while logging out.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you sure you want to log out?</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default LogoutPage;
