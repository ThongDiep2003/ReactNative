import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_AUTH } from './FirebaseConfig'; // Đảm bảo bạn đã cấu hình đúng đường dẫn

const LogoutPage = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      // Đăng xuất từ Firebase
      await signOut(FIREBASE_AUTH);
      // Xóa token khỏi AsyncStorage
      await AsyncStorage.removeItem('jwtToken');
      // Điều hướng về trang đăng nhập
      navigation.navigate('Login');
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