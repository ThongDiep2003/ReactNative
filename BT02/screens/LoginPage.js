import React, { useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { FIREBASE_AUTH } from './FirebaseConfig'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [click, setClick] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const auth = FIREBASE_AUTH;
  
  // Handle login function
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, username, password);
      console.log(response);
      Alert.alert('Login successful');
      // Điều hướng đến trang Introduction sau khi đăng nhập thành công
      navigation.navigate('Introduction');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Login failed: User not found');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Login failed: Wrong password');
      } else {
        Alert.alert('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
          source={require('../assets/login.png')} // Đường dẫn tới ảnh trong thư mục dự án
          style={styles.image}
        />
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputView}>
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
      </View>
      <View style={styles.rememberView}>
        <View style={styles.switch}>
          <Switch
            value={click}
            onValueChange={setClick}
            trackColor={{ true: 'green', false: 'gray' }}
          />
          <Text style={styles.rememberText}>Remember Me</Text>
        </View>
        <View>
          <Pressable onPress={() => navigation.navigate('ForgotPassword')}> 
            <Text style={styles.forgetText}>Forgot Password?</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </Pressable>
      </View>
      
      <Text style={styles.footerText}>
        
        Don't have an account?{' '}
        <Text style={styles.register} onPress={() => navigation.navigate('Register')}>
          Register
        </Text>
      </Text>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 70,
  },
  image: {
    height: 160,
    width: 170,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "#2596be",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "#2596be",
    borderWidth: 1,
    borderRadius: 7,
  },
  rememberView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  switch: {
    flexDirection: "row",
    gap: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 13,
  },
  forgetText: {
    fontSize: 11,
    color: "#2596be",
  },
  button: {
    backgroundColor: "#2596be",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
  },
  footerText: {
    textAlign: "center",
    color: "gray",
  },
  register: {
    color: "#2596be",
    fontSize: 13,
  },
});