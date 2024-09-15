import React, { useState } from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig'; // Import Realtime Database
import { ref, set } from 'firebase/database'; // Import hàm để thêm dữ liệu vào Realtime Database
import { generateOTP, sendOTPEmail } from './OTP'; // Import các hàm tạo và gửi OTP
import {EnterOTP2} from './EnterOTP2'

const RegisterPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Tạo mã OTP và gửi qua email
      const otp = generateOTP();
      await sendOTPEmail(username, otp);

      // Lưu mã OTP vào Realtime Database để xác thực sau
      await set(ref(FIREBASE_DB, 'otp/' + encodeEmail(username)), { otp: otp, timestamp: Date.now() });

      // Điều hướng đến màn hình nhập OTP
      navigation.navigate('EnterOTP2', { email: username, name, birthdate, password });

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to encode email for database key
  const encodeEmail = (email) => {
    return email.replace(/\./g, ',');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/logo.png')} // Đường dẫn tới ảnh trong thư mục dự án
        style={styles.image}
      />
      <Text style={styles.title}>Register</Text>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder='NAME'
          value={name}
          onChangeText={setName}
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder='BIRTHDATE (YYYY-MM-DD)'
          value={birthdate}
          onChangeText={setBirthdate}
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder='EMAIL'
          value={username}
          onChangeText={setUsername}
          autoCorrect={false}
          autoCapitalize='none'
        />
        <TextInput
          style={styles.input}
          placeholder='PASSWORD'
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCorrect={false}
          autoCapitalize='none'
        />
        <TextInput
          style={styles.input}
          placeholder='CONFIRM PASSWORD'
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCorrect={false}
          autoCapitalize='none'
        />
      </View>

      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>REGISTER</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  inputView: {
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#2596be',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '100%',
  },
  buttonView: {
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2596be',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default RegisterPage;
