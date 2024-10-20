import React, { useState } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, TextInput, Text, View } from 'react-native';
import { verifyOTP } from '../../auths/FirebaseConfig'; // Import OTP verification function
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'; // Import deleteUser to remove account
import { FIREBASE_AUTH, FIREBASE_DB } from '../../auths/FirebaseConfig'; // Import Firebase config
import { ref, set } from 'firebase/database'; // Import function to store data in Firebase Realtime Database

const EnterOTP2 = ({ route, navigation }) => {
  const { email, password } = route.params; // Get email and password from the previous screen
  const [otp, setOtp] = useState(''); // State to hold the OTP input
  const [loading, setLoading] = useState(false); // State for showing loading during the process

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const isVerified = await verifyOTP(email, otp); // Verify the OTP

      if (isVerified) {
        // If OTP is correct, create the user and store user info
        const auth = FIREBASE_AUTH;
        const response = await createUserWithEmailAndPassword(auth, email, password);
        const userId = response.user.uid;

        // Store user information in Realtime Database
        await set(ref(FIREBASE_DB, 'users/' + userId), {
          email: email,
        });

        Alert.alert('Registration successful');
        navigation.navigate('Login');
      } else {
        // If OTP is incorrect, delete the user and navigate back to registration
        const auth = FIREBASE_AUTH;
        const user = auth.currentUser;

        if (user) {
          await deleteUser(user); // Delete the account
        }

        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Your account has been removed.');
        navigation.navigate('Register'); // Navigate back to registration screen
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Verification failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.description}>
          We have sent an OTP to your email address. Please enter it below to complete the registration.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          autoCapitalize="none"
          keyboardType="numeric"
        />
        <Button
          title={loading ? 'Verifying...' : 'Verify OTP'}
          onPress={handleVerifyOTP}
          disabled={loading}
          color="#2596be"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#2596be',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default EnterOTP2;
