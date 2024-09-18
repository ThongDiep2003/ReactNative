import React, { useState } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, TextInput, Text, View } from 'react-native';
import { verifyOTP } from './FirebaseConfig'; // Import hàm xác thực OTP
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'; // Import hàm deleteUser để xóa tài khoản
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig'; // Import Realtime Database
import { ref, set } from 'firebase/database'; // Import hàm để thêm dữ liệu vào Realtime Database

const EnterOTP2 = ({ route, navigation }) => {
  const { email, name, birthdate, password } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const isVerified = await verifyOTP(email, otp); // Xác thực OTP

      if (isVerified) {
        // Nếu OTP đúng, tạo người dùng và lưu thông tin
        const auth = FIREBASE_AUTH;
        const response = await createUserWithEmailAndPassword(auth, email, password);
        const userId = response.user.uid;

        // Lưu thông tin người dùng vào Realtime Database
        await set(ref(FIREBASE_DB, 'users/' + userId), {
          name: name,
          email: email,
          birthdate: birthdate,
        });

        Alert.alert('Registration successful');
        navigation.navigate('Login');
      } else {
        // Nếu OTP sai, thông báo và xóa tài khoản
        const auth = FIREBASE_AUTH;
        const user = auth.currentUser;

        if (user) {
          await deleteUser(user); // Xóa tài khoản
        }

        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
        navigation.navigate('Register'); // Điều hướng về trang đăng ký
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
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
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
