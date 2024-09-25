import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import { FIREBASE_DB, FIREBASE_AUTH, getUserProfile } from './FirebaseConfig'; // Import Firebase configuration
import { ref, onValue } from 'firebase/database';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage
import tw from 'tailwind-react-native-classnames'; // Import tailwind-react-native-classnames

const HomePage = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState(null);
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
    fetchTransactions();
  }, []);

  const handleAddTransaction = () => {
    navigation.navigate('Add Transaction'); 
  };

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

  const fetchTransactions = () => {
    const transactionsRef = ref(FIREBASE_DB, 'transactions');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      const transactionsList = data ? Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })) : [];
      setTransactions(transactionsList);
      setFilteredTransactions(transactionsList);
    }, (error) => {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions. Please try again.');
    });
  };

  // Filter transactions
  const handleFilter = (type) => {
    setFilterType(type);
    const filteredData = transactions.filter(transaction => {
      const titleMatch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = type ? transaction.type.toLowerCase() === type.toLowerCase() : true;
      return typeMatch && titleMatch;
    });
    setFilteredTransactions(filteredData);
  };

  // Search transactions
  const handleSearch = (text) => {
    setSearchTerm(text);
    handleFilter(filterType);
  };

  const handlePressTransaction = (transaction) => {
    navigation.navigate('Transaction', { transaction });
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* User Section */}
      <View style={tw`p-5 flex-row justify-between items-center bg-gray-100 rounded-b-lg`}>
        <View style={tw`flex-row items-center`}>
          <Image source={{ uri: userAvatar }} style={tw`w-14 h-14 rounded-full`} />
          <View style={tw`ml-3`}>
            <Text style={tw`text-base text-gray-500`}>Welcome back,</Text>
            <Text style={tw`text-lg font-bold`}>{userName}</Text>
          </View>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={tw`px-5 py-4`}>
        <TextInput
          style={tw`bg-gray-200 p-4 rounded-lg mb-4`}
          placeholder="Search transactions"
          value={searchTerm}
          onChangeText={handleSearch}
        />
        <View style={tw`flex-row justify-between`}>
          <TouchableOpacity style={tw`flex-1 bg-purple-500 p-3 rounded-lg mr-2`} onPress={() => handleFilter('Expense')}>
            <Text style={tw`text-white text-center`}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`flex-1 bg-green-500 p-3 rounded-lg ml-2`} onPress={() => handleFilter('Income')}>
            <Text style={tw`text-white text-center`}>Income</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={tw`flex-row p-4 border-b border-gray-200`} onPress={() => handlePressTransaction(item)}>
            {item.image && (
              <Image source={{ uri: item.image }} style={tw`w-12 h-12 rounded-full`} />
            )}
            <View style={tw`flex-1 ml-4`}>
              <Text style={tw`text-lg font-bold`}>{item.title}</Text>
              <Text style={tw`text-gray-500`}>{item.amount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Transaction Button */}
      <TouchableOpacity style={tw`bg-blue-500 p-4 rounded-full mx-5 my-5`} onPress={handleAddTransaction}>
        <Text style={tw`text-white text-center`}>Add New Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomePage;
