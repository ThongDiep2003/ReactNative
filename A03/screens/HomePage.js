import React, { useState, useEffect } from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { FIREBASE_AUTH, getUserProfile } from './FirebaseConfig'; // Import Firebase and getUserProfile
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage
import Icon from 'react-native-vector-icons/Feather'; // For icons
import tw from 'twrnc';

const screenWidth = Dimensions.get('window').width;

const HomePage = () => {
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [loading, setLoading] = useState(true); // Loading state for showing ActivityIndicator
  const navigation = useNavigation();

  // Dummy data for the pie chart
  const pieData = [
    { name: 'Saving', population: 25, color: '#4CAF50', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Food', population: 15, color: '#FF9800', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Bill', population: 20, color: '#F44336', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Gas', population: 10, color: '#03A9F4', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Housing', population: 30, color: '#9C27B0', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];

  // Dummy data for recent history
  const recentHistory = [
    { id: '1', title: 'Shopping', amount: '-520,300vnd' },
    { id: '2', title: 'Eating', amount: '-480,000vnd' },
    { id: '3', title: 'Entertainment', amount: '-215,000vnd' },
    { id: '4', title: 'Moving', amount: '-180,300vnd' },
    { id: '5', title: 'Others', amount: '-100,300vnd' },
  ];

  const renderRecentItem = ({ item }) => (
    <View style={tw`flex-row items-center mb-4 p-4 bg-gray-100 rounded-lg`}>
      <Image source={{ uri: 'https://via.placeholder.com/50' }} style={tw`w-12 h-12 rounded-full mr-4`} />
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-bold`}>{item.title}</Text>
        <Text style={tw`text-sm text-gray-600`}>{item.amount}</Text>
      </View>
      <TouchableOpacity style={tw`px-2`}>
        <Text>•••</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    // Fetch user data and avatar from Firebase Auth and Database
    const fetchUserData = async () => {
      try {
        const currentUser = FIREBASE_AUTH.currentUser;
        if (currentUser) {
          const userId = currentUser.uid;
          const userProfile = await getUserProfile(userId);

          // Update user profile state
          setUserName(userProfile.name);

          // Fetch avatar from Firebase Storage if available
          if (userProfile.avatarUrl) {
            const storage = getStorage();
            const avatarRef = storageRef(storage, userProfile.avatarUrl); // Avatar path from Firebase
            const avatarUrl = await getDownloadURL(avatarRef);
            setUserAvatar(avatarUrl); // Set avatar URL in state
          } else {
            setUserAvatar('https://via.placeholder.com/60'); // Set default avatar if not available
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchUserData();
  }, []);

  // Set header buttons
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Icon name="user" size={28} color="#fff" style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Logout')}>
          <Icon name="log-out" size={28} color="#fff" style={{ marginLeft: 15 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header section */}
      <View style={tw`p-5 flex-row justify-between items-center`}>
        <View style={tw`flex-row items-center`}>
          <Image source={{ uri: userAvatar }} style={tw`w-14 h-14 rounded-full`} />
          <View style={tw`ml-3`}>
            <Text style={tw`text-base text-gray-500`}>Welcome back,</Text>
            <Text style={tw`text-lg font-bold`}>{userName}</Text>
          </View>
        </View>
      </View>

      {/* Expense and income section */}
      <View style={tw`flex-row justify-around py-4`}>
        <View style={tw`bg-white shadow-md rounded-lg p-4 flex-1 mx-2`}>
          <Text style={tw`text-gray-500 text-center`}>Expense</Text>
          <Text style={tw`text-red-600 font-bold text-center`}>-1,535,334vnd</Text>
        </View>
        <View style={tw`bg-white shadow-md rounded-lg p-4 flex-1 mx-2`}>
          <Text style={tw`text-gray-500 text-center`}>Income</Text>
          <Text style={tw`text-green-500 font-bold text-center`}>+5,454,320vnd</Text>
        </View>
      </View>

      {/* Pie chart */}
      <View style={tw`items-center mb-6 bg-blue-100 rounded-xl p-5`}>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'15'}
          center={[10, 10]}
          absolute
        />
      </View>

      {/* Recent history section */}
      <View style={tw`px-5`}>
        <Text style={tw`text-lg font-bold mb-3`}>Recent Added</Text>
        <FlatList
          data={recentHistory}
          renderItem={renderRecentItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

export default HomePage;
