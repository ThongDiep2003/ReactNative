import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View, TextInput, Button, Image, TouchableOpacity } from 'react-native';
import { getUserProfile } from './FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage

function ProfilePage() {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null); // Avatar URL state
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);

          // If avatar path exists, fetch it from Firebase Storage
          if (profile.avatarUrl) {
            const storage = getStorage();
            const avatarRef = storageRef(storage, profile.avatarUrl);
            const url = await getDownloadURL(avatarRef);
            setAvatarUrl(url); // Set avatar URL
          }
        } else {
          throw new Error('User not logged in');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth]);

  if (loading) {
    return (
      <View style={styles.viewStyle}>
        <Text style={styles.textStyle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userProfile ? (
        <>
          {/* Profile Image */}
          <Image
            source={avatarUrl ? { uri: avatarUrl } : require('../assets/avatar.png')} // Use Firebase avatar or default
            style={styles.avatar}
          />
          <Text style={styles.nameText}>{userProfile.name}</Text>

          {/* Editable Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={userProfile.name}
                editable={true}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={userProfile.email}
                editable={false} // Email not editable
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile</Text>
              <TextInput
                style={styles.input}
                value={userProfile.mobile}
                editable={true}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={userProfile.birthdate}
                editable={true}
              />
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Edit')}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.textStyle}>No profile data available</Text>
      )}
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
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
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
  textStyle: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default ProfilePage;
