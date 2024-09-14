import React, { useState } from 'react';
import { PermissionsAndroid, Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig'; 
import { ref, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage

const RegisterPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [avatar, setAvatar] = useState(null); // Để lưu URI của ảnh đã chọn
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const storage = getStorage(); // Initialize Firebase Storage

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, username, password);
      const userId = response.user.uid;

      // Nếu người dùng đã chọn ảnh, tải lên Firebase Storage
      let avatarUrl = null;
      if (avatar) {
        const avatarStorageRef = storageRef(storage, `avatars/${userId}.jpg`);
        const img = await fetch(avatar);
        const bytes = await img.blob(); // Convert image URI to blob format
        await uploadBytes(avatarStorageRef, bytes);
        avatarUrl = await getDownloadURL(avatarStorageRef); // Get URL of uploaded image
      }

      // Lưu thông tin người dùng vào Realtime Database với URL của ảnh (nếu có)
      await set(ref(FIREBASE_DB, 'users/' + userId), {
        name: name,
        email: username,
        birthdate: birthdate,
        avatar: avatarUrl || 'default_avatar_url',  // Lưu URL của ảnh hoặc ảnh mặc định
      });

      Alert.alert('Registration successful');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/weak-password') {
        Alert.alert('Registration failed', 'The password is too weak');
      } else if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Registration failed', 'The email address is already in use');
      } else {
        Alert.alert('Registration failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Permission to access media',
          message: 'This app needs access to your media to upload an avatar',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can access the media');
        handleSelectAvatar();
      } else {
        console.log('Media permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSelectAvatar = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        // Lưu URI của ảnh vào state
        setAvatar(response.assets[0].uri);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hiển thị ảnh avatar đã chọn hoặc ảnh mặc định */}
      <Image
        source={avatar ? { uri: avatar } : require('../assets/avatar.png')}
        style={styles.avatar}
      />
      <Pressable style={styles.avatarButton} onPress={requestPermission}>
        <Text style={styles.avatarButtonText}>Choose Avatar</Text>
      </Pressable>

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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  avatarButton: {
    backgroundColor: '#2596be',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  avatarButtonText: {
    color: 'white',
    fontSize: 16,
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
