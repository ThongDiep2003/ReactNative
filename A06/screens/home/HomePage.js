import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH, getUserProfile } from '../../auths/FirebaseConfig';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { ref, onValue } from 'firebase/database';
import tw from 'tailwind-react-native-classnames';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-svg-charts';
import { Text as SVGText } from 'react-native-svg';


// List of available icons with fixed colors
const iconList = [
  { name: 'car', color: '#f44336' },
  { name: 'food', color: '#e91e63' },
  { name: 'gift', color: '#9c27b0' },
  { name: 'home', color: '#673ab7' },
  { name: 'wallet', color: '#3f51b5' },
  { name: 'medical-bag', color: '#2196f3' },
  { name: 'truck-fast', color: '#03a9f4' },
  { name: 'gamepad-variant', color: '#00bcd4' },
  { name: 'bank', color: '#009688' },
  { name: 'shopping-outline', color: '#4caf50' },
  { name: 'cash', color: '#ff9800' },
  { name: 'airplane', color: '#ff5722' },
  { name: 'basketball', color: '#795548' },
  { name: 'bed', color: '#607d8b' },
  { name: 'bike', color: '#8bc34a' },
  { name: 'book-open-page-variant', color: '#ffc107' },
  { name: 'camera', color: '#9e9e9e' },
];

const HomePage = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseCategories, setExpenseCategories] = useState([]); // Store expense data for chart

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
            setUserAvatar('https://via.placeholder.com/60');
          }

          // Fetch transactions
          const transactionsRef = ref(FIREBASE_DB, `users/${userId}/transactions`);
          onValue(transactionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const fetchedTransactions = Object.values(data).reverse();
              setTransactions(fetchedTransactions.slice(0, 5)); // Get recent 5 transactions 

              // Calculate total income, expense, and prepare expense data for chart
              let income = 0;
              let expense = 0;
              const categoryData = {};

              fetchedTransactions.forEach((transaction) => {
                if (transaction.type === 'Income') {
                  income += parseFloat(transaction.amount);
                } else if (transaction.type === 'Expense') {
                  expense += parseFloat(transaction.amount);
                  
                  // Prepare data for donut chart
                  if (categoryData[transaction.category.id]) {
                    categoryData[transaction.category.id].amount += parseFloat(transaction.amount);
                  } else {
                    const categoryIcon = iconList.find(icon => icon.name === transaction.category.icon);
                    const color = categoryIcon ? categoryIcon.color : '#6246EA';
                    categoryData[transaction.category.id] = {
                      amount: parseFloat(transaction.amount),
                      color: color,
                      name: transaction.category.name,
                    };
                  }
                }
              });
              
              setTotalIncome(income);
              setTotalExpense(expense);
              setExpenseCategories(Object.values(categoryData));
            }
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleTransactionPress = (transaction) => {
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
    <View style={[tw`flex-1 bg-white`, { marginTop: 0 }]}>
      {/* User Section */}
      <View style={[tw`p-5 flex-row justify-between items-center  rounded-b-lg`, { marginTop: 20 }]}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={userAvatar ? { uri: userAvatar } : require('../../assets/avatar.png')}
            style={tw`w-12 h-12 rounded-full`}
          />
          <View style={tw`ml-3`}>
            <Text style={tw`text-base text-gray-500`}>Welcome back,</Text>
            <Text style={tw`text-lg font-bold`}>{userName}</Text>
          </View>
        </View>
      </View>

      {/* Expense and Income Summary */}
      <View style={tw`flex-row justify-around mt-5`}>
        <View style={[tw`bg-red-100 p-5 rounded-lg`, { width: 175 }]}>
          <Text style={tw`text-sm text-black`}>Expense</Text>
          <Text style={tw`text-lg font-bold text-red-600`}>- {totalExpense.toLocaleString()} VND</Text>
        </View>
        <View style={[tw`bg-green-100 p-5 rounded-lg`, { width: 175 }]}>
          <Text style={tw`text-sm text-black`}>Income</Text>
          <Text style={tw`text-lg font-bold text-green-600`}>+ {totalIncome.toLocaleString()} VND</Text>
        </View>
      </View>

      {/* Donut Chart for Expense Categories */}
      <View style={[tw`mt-5 mb-5 p-5  rounded-lg`, {marginBottom:0}]}>
        <Text style={tw`text-lg font-bold text-center mb-3`}>Expense Distribution</Text>
        <PieChart
          style={{ height: 175 }}
          data={expenseCategories.map((item) => ({
            value: item.amount,
            svg: { fill: item.color },
            key: item.name,
          }))}
          innerRadius="60%"
          outerRadius="100%"
          padAngle={0.02}
        />
      </View>

      {/* Recent Transactions */}
      <View style={[tw`mt-5 p-5`, {marginTop:0}]}>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-lg font-bold`}>Recent Added</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllTransaction')}>
            <Text style={tw`text-blue-500`}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const categoryIcon = iconList.find(icon => icon.name === item.category.icon);
            const color = categoryIcon ? categoryIcon.color : '#6246EA';

            return (
              <TouchableOpacity onPress={() => handleTransactionPress(item)}>
                <View style={tw`flex-row justify-between py-2 items-center`}>
                  <Icon name={item.category.icon} size={24} color={color} style={tw`mr-3`} />
                  
                  {/* Transaction details */}
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-base font-semibold`}>{item.category.name}</Text>
                    <Text style={tw`text-sm text-gray-500`}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  
                  {/* Transaction amount */}
                  <Text style={tw`text-base text-black`}>
                    {item.type === 'Expense' ? '- ' : '+ '}{parseFloat(item.amount).toLocaleString()} VND
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

export default HomePage;
