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
  const [filterType, setFilterType] = useState(null); // 'Expense', 'Income', or null
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false); // To toggle between showing all or limited transactions

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
  
  // Hàm thêm giao dịch
  const handleAddTransaction = () => {
    navigation.navigate('HomeContent'); 
  };
    fetchUserData();
    fetchTransactions();
  }, []);

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
  
  // Fetch transactions from Firebase
  const fetchTransactions = () => {
    const transactionsRef = ref(FIREBASE_DB, 'transactions');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      const transactionsList = data
        ? Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        })).sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, recent first
        : [];
      setTransactions(transactionsList);
      applyFilter(transactionsList, filterType); // Apply filter based on the selected type
    }, (error) => {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions. Please try again.');
    });
  };

 

  // Function to apply filter based on the selected type (Expense/Income)
  const applyFilter = (transactionsList, type) => {
    const filteredData = transactionsList.filter(transaction => {
      const titleMatch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = type ? transaction.type.toLowerCase() === type.toLowerCase() : true;
      return typeMatch && titleMatch;
    });
    setFilteredTransactions(showAllTransactions ? filteredData : filteredData.slice(0, 5)); // Show 5 or all based on toggle
  };

  // Handle search and filter when typing in the search box
  const handleSearch = (text) => {
    setSearchTerm(text);
    applyFilter(transactions, filterType);
  };

  // Toggle between showing all or limited transactions
  const handleSeeAll = () => {
    setShowAllTransactions(!showAllTransactions);
    applyFilter(transactions, filterType); // Reapply the filter with the new toggle state
  };

  // Set filter type to Expense or Income and reapply filter
  const handleFilter = (type) => {
    setFilterType(type);
    applyFilter(transactions, type);
  };

  // Clear filter to show all transactions
  const clearFilter = () => {
    setFilterType(null);
    applyFilter(transactions, null);
  };

  const handlePressTransaction = (transaction) => {
    navigation.navigate('Transaction', { transaction });
  };

  const handleAddTransaction = () => {
    navigation.navigate('HomeContent');
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
          <TouchableOpacity
            style={tw`${filterType === 'Expense' ? 'bg-blue-700' : 'bg-blue-500'} flex-1 p-3 rounded-lg mr-2`}
            onPress={() => handleFilter('Expense')}
          >
            <Text style={tw`text-white text-center`}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`${filterType === 'Income' ? 'bg-green-700' : 'bg-green-500'} flex-1 p-3 rounded-lg ml-2`}
            onPress={() => handleFilter('Income')}
          >
            <Text style={tw`text-white text-center`}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`ml-2 p-3 rounded-lg bg-gray-500`}
            onPress={clearFilter}
          >
            <Text style={tw`text-white text-center`}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List with "See All" button */}
      <View style={tw`flex-row justify-between items-center px-4 mb-2`}>
        <Text style={tw`text-lg font-bold`}>Transactions</Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={tw`text-blue-500`}>{showAllTransactions ? 'Show Less' : 'See All'}</Text>
        </TouchableOpacity>
      </View>

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
              <Text style={tw`text-gray-500`}>{item.amount} vnd</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={tw`bg-blue-500 p-4 rounded-full mx-5 my-5`} onPress={handleAddTransaction}>
        <Text style={tw`text-white text-center`}>Add New Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomePage;
