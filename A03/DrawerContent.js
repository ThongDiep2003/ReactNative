import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from './screens/FirebaseConfig'; // Import Authentication
import { getUserProfile } from './screens/FirebaseConfig'; // Import hàm lấy thông tin người dùng

// Danh sách các mục trong ngăn kéo
const DrawerList = [
  { icon: 'home-outline', label: 'Home', navigateTo: 'Home' },
  { icon: 'account-multiple', label: 'Profile', navigateTo: 'Profile' },
  { icon: 'account-group', label: 'Edit Profile', navigateTo: 'Edit' },
];

// Thành phần Drawer Layout
const DrawerLayout = ({ icon, label, navigateTo }) => {
  const navigation = useNavigation();
  return (
    <DrawerItem
      icon={({ color, size }) => <Icon name={icon} color={color} size={size} />}
      label={label}
      onPress={() => {
        navigation.navigate(navigateTo);
      }}
    />
  );
};

// Thành phần DrawerItems
const DrawerItems = () => {
  return DrawerList.map((item, index) => (
    <DrawerLayout key={index} icon={item.icon} label={item.label} navigateTo={item.navigateTo} />
  ));
};

// Thành phần Drawer Content
function DrawerContent(props) {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Sign Out Error', 'An error occurred while signing out. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>
            <View style={styles.userInfoSection}>
              <View style={{ flexDirection: 'row', marginTop: 15 }}>
                {/* {userProfile && userProfile.avatarUri ? (
                  <Avatar.Image
                    source={{ uri: userProfile.avatarUri }}
                    size={50}
                  />
                ) : (
                  <Avatar.Icon
                    icon="account"
                    size={50}
                  />
                )} */}
                <View style={{ marginLeft: 10, flexDirection: 'column' }}>
                  {userProfile ? (
                    <>
                      <Text style={styles.textStyle}>{userProfile.name}</Text>
                      <Text style={styles.textStyle}>{userProfile.email}</Text>
                    </>
                  ) : (
                    <Text style={styles.textStyle}>No profile data available</Text>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({ color, size }) => <Icon name="exit-to-app" color={color} size={size} />}
          label="Sign Out"
          onPress={handleSignOut}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  textStyle: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
});

export default DrawerContent;
