import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TextInput, View, Pressable, Alert, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { get, ref, update } from 'firebase/database'; // Import Firebase Realtime Database update method
import { FIREBASE_DB } from './FirebaseConfig'; // Import Firebase Realtime Database reference
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for avatar
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri); // Use result.assets to get URI
    }
  };

  const uploadAvatarToStorage = async (uri) => {
    if (!uri) {
      console.error("Invalid image URI");
      return null;
    }

    try {
      const user = auth.currentUser;
      const storage = getStorage();
      const filename = 'avatar_' + user.uid + '_' + new Date().getTime() + '.jpg';
      const avatarStorageRef = storageRef(storage, `images/${filename}`);

      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadTask = uploadBytesResumable(avatarStorageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Upload failed:', error);
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      });
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
      if (avatar && avatar !== avatarUrl) {
        uploadedAvatarUrl = await uploadAvatarToStorage(avatar);
      }

      const user = auth.currentUser;
      const userRef = ref(FIREBASE_DB, 'users/' + user.uid);
      await update(userRef, {
        name,
        birthdate,
        email,
        mobile,
        avatarUrl: uploadedAvatarUrl,
      });

      Alert.alert('Profile saved successfully!');
      navigation.goBack();
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
            source={{ uri: avatar || avatarUrl }}
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
          value={mobile}
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
