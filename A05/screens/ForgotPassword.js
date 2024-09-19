import React, { useState } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, TextInput, Text, View } from 'react-native';
import { generateOTP, sendOTPEmail } from './OTP'; // Import các hàm cần thiết

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const otp = generateOTP(); // Tạo mã OTP
      // Gửi mã OTP qua email
      await sendOTPEmail(email, otp);
      // Lưu mã OTP vào Realtime Database hoặc bất kỳ nơi nào bạn muốn để xác thực sau
      Alert.alert('Success', 'OTP has been sent to your email.');
      navigation.navigate('EnterOTP', { email }); // Điều hướng đến màn hình nhập OTP
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send OTP: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.description}>
          Enter your email address below and we will send you an OTP to reset your password.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Button
          title={loading ? 'Sending...' : 'Send OTP'}
          onPress={handleSendOTP}
          disabled={loading}
          color="#2596be" // Thay đổi màu nút
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
    padding: 16, // Thêm padding cho container
  },
  innerContainer: {
    width: '100%',
    maxWidth: 400, // Giới hạn chiều rộng
    padding: 20, // Thêm padding cho innerContainer
    backgroundColor: 'white', // Thay đổi màu nền để làm nổi bật nội dung
    borderRadius: 10, // Bo góc cho container
    shadowColor: '#000', // Thêm bóng đổ cho container
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Thêm hiệu ứng nổi bật
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555', // Thay đổi màu chữ mô tả
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

export default ForgotPassword;

