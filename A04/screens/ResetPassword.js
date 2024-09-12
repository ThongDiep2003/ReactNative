import React, { useState } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, TextInput, View } from 'react-native';
import { getAuth, confirmPasswordReset } from 'firebase/auth';

const auth = getAuth();

const ResetPassword = ({ route, navigation }) => {
  const { email } = route.params; // Lấy email từ params
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      // Xác nhận việc đặt lại mật khẩu
      // Giả sử rằng bạn có mã OTP hợp lệ và gửi yêu cầu cập nhật mật khẩu
      // Bạn cần lấy mã OTP hợp lệ và so sánh với mã OTP được người dùng nhập vào
      const code = ''; // Mã OTP hợp lệ từ Realtime Database
      await confirmPasswordReset(auth, code, newPassword);
      Alert.alert('Success', 'Password has been reset successfully!');
      navigation.navigate('Login'); // Điều hướng đến màn hình đăng nhập
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <Button
          title={loading ? 'Resetting...' : 'Reset Password'}
          onPress={handleResetPassword}
          disabled={loading}
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
  },
  innerContainer: {
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default ResetPassword;
