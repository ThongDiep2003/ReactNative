import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const HomePage = () => {
  const navigation = useNavigation(); // Khởi tạo useNavigation

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Homepage!</Text>
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate('Profile')} // Điều hướng đến ProfilePage
        color="#2596be"
      />
      <Text style={styles.text}></Text>
      <Text style={styles.text}>Logout!</Text>
      <Button
        title="Go to Logout"
        onPress={() => navigation.navigate('Logout')} // Điều hướng đến ProfilePage
        color="#2596be"
      />
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomePage;