import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TextInput, View, Pressable, Alert, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { get, ref, update } from 'firebase/database'; // Import Firebase Realtime Database update method
import { FIREBASE_DB } from './FirebaseConfig'; // Import Firebase Realtime Database reference
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage

const EditProfile = () => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState(''); // State for mobile
  const [avatar, setAvatar] = useState(''); // Avatar image URI for the selected image
  const [avatarUrl, setAvatarUrl] = useState(''); // Avatar image URL for displaying the avatar
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    // Fetch current user profile data
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
            setMobile(profile.mobile || ''); // Get the mobile value from profile
            if (profile.avatarUrl) {
              setAvatarUrl(profile.avatarUrl); // Set the current avatar URL
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
    // Request permission to access the image library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need permission to access your photos.');
      return;
    }

    // Open the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for avatar
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.uri); // Set the selected image URI
    }
  };

  const uploadAvatarToStorage = async (uri) => {
    if (!uri) return null;

    try {
      const user = auth.currentUser;
      const storage = getStorage();
      const avatarStorageRef = storageRef(storage, `avatars/${user.uid}.jpg`); // Reference to Firebase Storage

      // Convert the image to blob format
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload the image to Firebase Storage
      await uploadBytes(avatarStorageRef, blob);

      // Get the download URL of the uploaded image
      const downloadUrl = await getDownloadURL(avatarStorageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!name || !birthdate || !email || !mobile) { // Check all fields including mobile
      Alert.alert('All fields are required');
      return;
    }

    try {
      setLoading(true);

      // Upload avatar if it's changed
      let uploadedAvatarUrl = avatarUrl;
      if (avatar) {
        uploadedAvatarUrl = await uploadAvatarToStorage(avatar); // Upload the avatar and get its URL
      }

      const user = auth.currentUser;
      const userRef = ref(FIREBASE_DB, 'users/' + user.uid); // Reference to Firebase Realtime Database
      await update(userRef, {
        name,
        birthdate,
        email,
        mobile,
        avatarUrl: uploadedAvatarUrl, // Update avatar URL
      });

      Alert.alert('Profile saved successfully!');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Failed to save profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <Pressable onPress={handleChooseAvatar}>
        {avatar || avatarUrl ? (
          <Image
            source={{ uri: avatar || avatarUrl }} // Show selected avatar or previously saved avatar
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>Choose Avatar</Text>
          </View>
        )}
      </Pressable>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Name'
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder='Birthdate (YYYY-MM-DD)'
          value={birthdate}
          onChangeText={setBirthdate}
        />
        <TextInput
          style={styles.input}
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
        />
        <TextInput
          style={styles.input}
          placeholder='Mobile Number'
          value={mobile} // Show the mobile number value
          onChangeText={setMobile}
          keyboardType='phone-pad'
        />
      </View>
      <Pressable style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholderText: {
    color: '#aaa',
    fontSize: 16,
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

export default EditProfile;
