import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TextInput, View, Pressable, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { get, ref, update } from 'firebase/database';
import { FIREBASE_DB } from './FirebaseConfig'; // Import Realtime Database

const EditProfile = () => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth(); // Lấy đối tượng auth

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
          } else {
            throw new Error('No profile data found');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchProfile();
  }, [auth]);

  const handleSave = async () => {
    if (!name || !birthdate || !email) {
      Alert.alert('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await update(ref(FIREBASE_DB, 'users/' + user.uid), {
          name: name,
          birthdate: birthdate,
          email: email,
        });
        Alert.alert('Profile updated successfully');
        navigation.goBack(); // Quay lại trang trước đó
      } else {
        throw new Error('User not logged in');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
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
