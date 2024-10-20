import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, Pressable } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB, FIRESTORE_DB } from '../../auths/FirebaseConfig'; // Firestore config
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';

function EditProfile() {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // Thêm trạng thái cho DatePicker
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const profile = userDoc.data();
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

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setBirthdate(formattedDate);
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
      await setDoc(doc(FIRESTORE_DB, 'users', user.uid), {
        name,
        birthdate,
        email,
        mobile,
        avatarUrl: uploadedAvatarUrl,
      });

      navigation.navigate('Profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleChooseAvatar} style={styles.avatarPressable}>
          <Image 
            source={avatar ? { uri: avatar } : (avatarUrl ? { uri: avatarUrl } : require('../../assets/avatar.png'))}
            style={styles.avatar} 
          />
        </TouchableOpacity>
        <Text style={styles.userName}>{name}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#999" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="envelope" size={20} color="#999" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="#999" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Mobile"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="calendar" size={20} color="#999" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={birthdate}
            editable={false} // Không cho phép chỉnh sửa trực tiếp
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
            <Icon name="calendar" size={24} color="#6200ee" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={birthdate ? new Date(birthdate) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Confirm'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPressable: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  form: {
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  datePickerButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfile;
