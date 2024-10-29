import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH, getUserProfile } from '../../auths/FirebaseConfig';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import tw from 'tailwind-react-native-classnames';

const HomePage = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      
      try {
        const currentUser = FIREBASE_AUTH.currentUser;
        if (currentUser) {
          const userId = currentUser.uid;
          const userProfile = await getUserProfile(userId);

          setUserName(userProfile.name);
          if (userProfile.avatarUrl) {
            const storage = getStorage();
            const avatarRef = storageRef(storage, userProfile.avatarUrl);
            const avatarUrl = await getDownloadURL(avatarRef);
            setUserAvatar(avatarUrl);
          } else {
            setUserAvatar('https://via.placeholder.com/60'); // Default avatar
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1 bg-white`, { marginTop: 20 }]}>
      {/* User Section */}
      <View style={tw`p-5 flex-row justify-between items-center bg-gray-100 rounded-b-lg`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={userAvatar ? { uri: userAvatar } : require('../../assets/avatar.png')}
            style={tw`w-12 h-12 rounded-full`}
          />
          <View style={tw`ml-3`}>
            <Text style={tw`text-base text-gray-500`}>Welcome</Text>
            <Text style={tw`text-lg font-bold`}>{userName}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
