import React, { useState } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, TextInput, Text, View } from 'react-native';
import { verifyOTP } from './FirebaseConfig'; // Import hàm xác thực OTP
import { update, ref } from 'firebase/database'; // Import hàm để cập nhật dữ liệu vào Realtime Database
import { FIREBASE_DB } from './FirebaseConfig'; // Import Realtime Database
import { getAuth } from 'firebase/auth';

const EnterOTP3 = ({ route, navigation }) => {
  const { name, birthdate, email, otp: sentOtp } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      // Xác thực OTP
      const isVerified = await verifyOTP(email, otp);

      if (isVerified && otp === sentOtp) {
        // Nếu OTP đúng, cập nhật thông tin người dùng
        const userRef = ref(FIREBASE_DB, 'users/' + getAuth().currentUser.uid);
        await update(userRef, {
          name: name,
          birthdate: birthdate,
          email: email,
        });
        Alert.alert('Profile updated successfully');

        // Thay vì điều hướng ngay lập tức, hãy đợi 3 giây
        setTimeout(() => {
          navigation.navigate('Profile'); // Quay lại trang profile
        }, 3000);
      } else {
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
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
  input: {
    height: 45,
    borderColor: '#2596be',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default EnterOTP3;
