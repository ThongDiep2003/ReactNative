import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Cập nhật import
import { FIREBASE_DB, FIREBASE_AUTH, getUserProfile } from '../../auths/FirebaseConfig';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { ref, onValue } from 'firebase/database';
import tw from 'tailwind-react-native-classnames';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-svg-charts';
import { Text as SVGText } from 'react-native-svg';


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
  { name: 'cat', color: '#ff5722' },
  { name: 'chair-rolling', color: '#3f51b5' },
  { name: 'chart-line', color: '#ff4081' },
  { name: 'cellphone', color: '#4caf50' },
  { name: 'city', color: '#673ab7' },
  { name: 'coffee', color: '#795548' },
  { name: 'dog', color: '#ff9800' },
  { name: 'dumbbell', color: '#9c27b0' },
  { name: 'emoticon-happy-outline', color: '#2196f3' },
  { name: 'factory', color: '#00bcd4' },
  { name: 'file-document', color: '#8bc34a' },
  { name: 'flower', color: '#e91e63' },
  { name: 'fridge-outline', color: '#3f51b5' },
  { name: 'guitar-electric', color: '#673ab7' },
  { name: 'headphones', color: '#607d8b' },
  { name: 'hospital-building', color: '#ff4081' },
  { name: 'human-male-female', color: '#03a9f4' },
  { name: 'key-variant', color: '#795548' },
  { name: 'laptop', color: '#ff9800' },
  { name: 'leaf', color: '#4caf50' },
];

const HomePage = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [displayType, setDisplayType] = useState('Expense');

  // Hàm fetch dữ liệu
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

        const transactionsRef = ref(FIREBASE_DB, `users/${userId}/transactions`);
        onValue(transactionsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const fetchedTransactions = Object.values(data).reverse();
            setTransactions(fetchedTransactions.slice(0, 10));

            let income = 0;
            let expense = 0;
            const expenseData = {};
            const incomeData = {};

            fetchedTransactions.forEach((transaction) => {
              if (transaction.type === 'Income') {
                income += parseFloat(transaction.amount);

                if (incomeData[transaction.category.id]) {
                  incomeData[transaction.category.id].amount += parseFloat(transaction.amount);
                } else {
                  const categoryIcon = iconList.find(icon => icon.name === transaction.category.icon);
                  const color = categoryIcon ? categoryIcon.color : '#6246EA';
                  incomeData[transaction.category.id] = {
                    amount: parseFloat(transaction.amount),
                    color: color,
                    name: transaction.category.name,
                  };
                }
              } else if (transaction.type === 'Expense') {
                expense += parseFloat(transaction.amount);

                if (expenseData[transaction.category.id]) {
                  expenseData[transaction.category.id].amount += parseFloat(transaction.amount);
                } else {
                  const categoryIcon = iconList.find(icon => icon.name === transaction.category.icon);
                  const color = categoryIcon ? categoryIcon.color : '#6246EA';
                  expenseData[transaction.category.id] = {
                    amount: parseFloat(transaction.amount),
                    color: color,
                    name: transaction.category.name,
                  };
                }
              }
            });

            setTotalIncome(income);
            setTotalExpense(expense);
            setExpenseCategories(Object.values(expenseData));
            setIncomeCategories(Object.values(incomeData));
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng useFocusEffect để fetch lại dữ liệu khi trang được mở lại
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleExpensePress = () => setDisplayType('Expense');
  const handleIncomePress = () => setDisplayType('Income');

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
      <View style={[tw`p-5 flex-row justify-between items-center rounded-b-lg`, { marginTop: 20 }]}>
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
        <TouchableOpacity onPress={handleExpensePress} style={[tw`p-5 rounded-lg`, { backgroundColor: displayType === 'Expense' ? '#ffebee' : '#f5f5f5', width: 175 }]}>
          <Text style={tw`text-sm text-black`}>Expense</Text>
          <Text style={tw`text-base  font-bold text-red-600`}>- {totalExpense.toLocaleString()} VND</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleIncomePress} style={[tw`p-5 rounded-lg`, { backgroundColor: displayType === 'Income' ? '#e8f5e9' : '#f5f5f5', width: 175 }]}>
          <Text style={tw`text-sm text-black`}>Income</Text>
          <Text style={tw`text-base  font-bold text-green-600`}>+ {totalIncome.toLocaleString()} VND</Text>
        </TouchableOpacity>
      </View>

      {/* Donut Chart for Expense or Income Categories */}
      <View style={[tw`mt-5 mb-5 p-5 rounded-lg`, { marginBottom: 0 }]}>
        <Text style={tw`text-lg font-bold text-center mb-3`}>{displayType} Distribution</Text>
        <PieChart
          style={{ height: 175 }}
          data={(displayType === 'Expense' ? expenseCategories : incomeCategories).map((item) => ({
            value: Math.abs(item.amount),
            svg: { fill: item.color },
            key: item.name,
          }))}
          innerRadius="60%"
          outerRadius="100%"
          padAngle={0.02}
        />
      </View>

      {/* Recent Transactions */}
      <View style={[tw`mt-5 p-6 flex-1`]}>
        <View style={tw`flex-row justify-between mb-3`}>
          <Text style={tw`text-lg font-bold`}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllTransaction')}>
            <Text style={tw`text-sm text-blue-500`}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={transactions.filter((transaction) => transaction.type === displayType)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleTransactionPress(item)} style={tw`flex-row justify-between bg-gray-100 p-3 rounded-lg mb-2`}>
              <View style={tw`flex-row items-center`}>
                <Icon name={item.category.icon} size={24} color={iconList.find(icon => icon.name === item.category.icon)?.color || '#000'} />
                <Text style={tw`ml-2`}>{item.category.name}</Text>
              </View>
              <Text style={tw`${item.type === 'Expense' ? 'text-red-600' : 'text-green-600'} font-bold`}>
                {item.type === 'Expense' ? '-' : '+'} {item.amount.toLocaleString()} VND
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

export default HomePage;
