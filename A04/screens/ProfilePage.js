import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import { StyleSheet, Text, View, Button, Image } from 'react-native'; // Thêm Image để hiển thị ảnh avatar
import { getUserProfile } from './FirebaseConfig'; // Import hàm lấy thông tin người dùng từ Realtime Database
import { getAuth } from 'firebase/auth'; // Import để lấy thông tin người dùng hiện tại

function ProfilePage() {
  const navigation = useNavigation(); // Lấy đối tượng navigation
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(); // Lấy đối tượng auth

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser; // Lấy người dùng hiện tại
        if (user) {
          const profile = await getUserProfile(user.uid); // Gọi hàm lấy thông tin người dùng
          setUserProfile(profile);
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
          {/* Hiển thị ảnh avatar nếu có, nếu không hiển thị ảnh mặc định */}
          <Image
            source={userProfile.avatar ? { uri: userProfile.avatar } : require('../assets/avatar.png')}
            style={styles.avatar}
          />
          <Text style={styles.textStyle}>Name: {userProfile.name}</Text>
          <Text style={styles.textStyle}>Email: {userProfile.email}</Text>
          <Text style={styles.textStyle}>Date of Birth: {userProfile.birthdate}</Text>
        </>
      ) : (
        <Text style={styles.textStyle}>No profile data available</Text>
      )}
      <Button
        title="Edit Profile"
        onPress={() => navigation.navigate('Edit')} // Điều hướng đến EditProfile
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
    marginBottom: 20, // Đặt khoảng cách dưới để tạo khoảng cách giữa ảnh và thông tin
  },
});

export default ProfilePage;
