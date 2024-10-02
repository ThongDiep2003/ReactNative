import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { get, ref, update } from 'firebase/database'; // Firebase Realtime Database update method
import { FIREBASE_DB } from './FirebaseConfig'; // Firebase Realtime Database reference
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage
import { generateOTP, sendOTPEmail } from './OTP'; // Import hàm sinh và gửi OTP

function EditProfile() {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = ref(FIREBASE_DB, 'users/' + user.uid);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const profile = snapshot.val();
            setName(profile.name || '');
            setBirthdate(profile.birthdate || '');
            setEmail(profile.email || '');
            setMobile(profile.mobile || '');
            if (profile.avatarUrl) {
              setAvatarUrl(profile.avatarUrl);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchProfile();
  }, [auth]);

  const handleChooseAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.uri);
    }
  };

  const uploadAvatarToStorage = async (uri) => {
    if (!uri) return null;

    try {
      const user = auth.currentUser;
      const storage = getStorage();
      const avatarStorageRef = storageRef(storage, `avatars/${user.uid}.jpg`);

      const response = await fetch(uri);
      const blob = await response.blob();

      await uploadBytes(avatarStorageRef, blob);

      const downloadUrl = await getDownloadURL(avatarStorageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!name || !birthdate || !email || !mobile) {
      Alert.alert('All fields are required');
      return;
    }

    try {
      setLoading(true);

      let uploadedAvatarUrl = avatarUrl;
      if (avatar) {
        uploadedAvatarUrl = await uploadAvatarToStorage(avatar);
      }

      const user = auth.currentUser;
      const otp = generateOTP(); // Tạo mã OTP
      await sendOTPEmail(email, otp); // Gửi OTP qua email

      // Điều hướng sang trang nhập OTP và truyền dữ liệu cập nhật
      navigation.navigate('EnterOTP3', {
        name,
        birthdate,
        email,
        otp, // Truyền mã OTP
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update failed', error.message);
      console.error('Error sending OTP:', error);
      Alert.alert('Failed to send OTP', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar hiển thị */}
      <Image
        source={avatar || avatarUrl ? { uri: avatar || avatarUrl } : require('../assets/avatar.png')}
        style={styles.avatar}
      />
      
      <View style={styles.form}>
        {/* Các ô nhập liệu cho hồ sơ */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            placeholder="Birthdate (YYYY-MM-DD)"
            value={birthdate}
            onChangeText={setBirthdate}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 30,
    marginBottom: 10,
  },
  form: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#2596be',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;
