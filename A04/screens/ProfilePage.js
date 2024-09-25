import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native'; 
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { getUserProfile } from './FirebaseConfig'; 
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

function ProfilePage() {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
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
          if (profile.avatarUrl) { // Use 'avatarUrl' as in EditProfile.js
            const storage = getStorage();
            const avatarRef = storageRef(storage, profile.avatarUrl); // Fetch avatar path from Storage
            const url = await getDownloadURL(avatarRef);
            setAvatarUrl(url); // Set the avatar URL
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
    <View style={styles.viewStyle}>
      {userProfile ? (
        <>
          {/* Show avatar if it exists, else show a default image */}
          <Image
            source={avatarUrl ? { uri: avatarUrl } : require('../assets/avatar.png')} // Default avatar if none
            style={styles.avatar}
          />
          <Text style={styles.textStyle}>Name: {userProfile.name}</Text>
          <Text style={styles.textStyle}>Email: {userProfile.email}</Text>
          <Text style={styles.textStyle}>Date of Birth: {userProfile.birthdate}</Text>
          <Text style={styles.textStyle}>Mobile: {userProfile.mobile}</Text>
        </>
      ) : (
        <Text style={styles.textStyle}>No profile data available</Text>
      )}
      <Button
        title="Edit Profile"
        onPress={() => navigation.navigate('Edit')} 
        color="#2596be"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  textStyle: {
    fontSize: 18,
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default ProfilePage;
