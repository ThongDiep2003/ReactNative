import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import * as Notifications from 'expo-notifications';

const icons = [
  { name: 'car', color: '#f44336' },
  { name: 'food', color: '#e91e63' },
  { name: 'home', color: '#673ab7' },
  { name: 'medical-bag', color: '#2196f3' },
  { name: 'truck-fast', color: '#03a9f4' },
  { name: 'shopping-outline', color: '#4caf50' },
  { name: 'airplane', color: '#ff5722' },
  { name: 'basketball', color: '#795548' },
  { name: 'bed', color: '#607d8b' },
  { name: 'bike', color: '#8bc34a' },
  { name: 'camera', color: '#9e9e9e' },
  { name: 'cat', color: '#ff5722' },
  { name: 'coffee', color: '#795548' },
  { name: 'dog', color: '#ff9800' },
  { name: 'dumbbell', color: '#9c27b0' },
  { name: 'factory', color: '#00bcd4' },
  { name: 'flower', color: '#e91e63' },
  { name: 'fridge-outline', color: '#3f51b5' },
  { name: 'guitar-electric', color: '#673ab7' },
  { name: 'headphones', color: '#607d8b' },
  { name: 'hospital-building', color: '#ff4081' },
  { name: 'human-male-female', color: '#03a9f4' },
  { name: 'key-variant', color: '#795548' },
  { name: 'gift', color: '#9c27b0' },
  { name: 'wallet', color: '#3f51b5' },
  { name: 'bank', color: '#009688' },
  { name: 'cash', color: '#ff9800' },
  { name: 'chart-line', color: '#ff4081' },
  { name: 'file-document', color: '#8bc34a' },
  { name: 'emoticon-happy-outline', color: '#2196f3' },
  { name: 'laptop', color: '#ff9800' },
  { name: 'leaf', color: '#4caf50' },
];

// Thêm ở đầu file, ngoài component
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AllTransaction = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); // Options: 'All', 'Income', 'Expense'

// Cấu hình thông báo
useEffect(() => {
  const configurePushNotifications = async () => {
    // Kiểm tra quyền thông báo
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
  };

  configurePushNotifications();
}, []);

const checkTransactionsForToday = (transactions) => {
  const today = new Date().toLocaleDateString();
  const hasTransactionsToday = transactions.some((transaction) => {
    const transactionDate = new Date(transaction.date).toLocaleDateString();
    return transactionDate === today;
  });

  if (!hasTransactionsToday) {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 21) {
      // Nếu đã quá 9 giờ tối, gửi thông báo ngay
      sendImmediateNotification();
    } else {
      // Nếu chưa tới 9 giờ tối, lên lịch cho 9 giờ tối
      scheduleReminder();
    }
  }
};

// Hàm lên lịch thông báo
const scheduleReminder = async () => {
  try {
    const now = new Date();
    const ninePM = new Date(now);
    ninePM.setHours(21, 0, 0, 0);

    // Nếu đã quá 9 giờ tối, đặt cho ngày hôm sau
    if (now > ninePM) {
      ninePM.setDate(ninePM.getDate() + 1);
    }

    // Hủy các thông báo cũ
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Lên lịch thông báo mới sử dụng seconds
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nhắc nhở giao dịch hàng ngày',
        body: 'Bạn chưa ghi chép giao dịch nào hôm nay. Hãy cập nhật ngay!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: Math.floor((ninePM.getTime() - now.getTime()) / 1000), // Chuyển đổi thành seconds
      },
    });
    console.log('Đã lên lịch thông báo cho:', ninePM.toLocaleString());
  } catch (error) {
    console.error('Lỗi lên lịch thông báo:', error);
  }
};

// Xử lý khi người dùng nhấn vào thông báo
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    navigation.navigate('AddTransaction');
  });

  return () => {
    subscription.remove();
  };
}, [navigation]);

// Trong useEffect fetch data
useEffect(() => {
  const currentUser = FIREBASE_AUTH.currentUser;
  if (currentUser) {
    const transactionsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/transactions`);
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setTransactions(transactionList);
        setFilteredTransactions(transactionList);
        
        // Kiểm tra và lên lịch thông báo
        checkTransactionsForToday(transactionList);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
        // Nếu không có dữ liệu, lên lịch thông báo
        scheduleReminder();
      }
    });
  }
}, []);


  // Fetch transactions from Firebase
  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      const transactionsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/transactions`);
      onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const transactionList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setTransactions(transactionList);
          setFilteredTransactions(transactionList); // Initialize filtered transactions

          // Kiểm tra giao dịch hôm nay
          checkTransactionsForToday(transactionList);
        } else {
          setTransactions([]);
          setFilteredTransactions([]);
          // Nếu không có dữ liệu nào, gửi thông báo nhắc nhở
          sendReminderNotification();
        }
      });
    }
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filteredData = transactions;

    // Apply filter type
    if (filterType !== 'All') {
      filteredData = filteredData.filter((item) => item.type === filterType);
    }

    // Apply search query
    if (searchQuery.trim()) {
      filteredData = filteredData.filter(
        (item) =>
          item.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          new Date(item.date).toLocaleDateString().includes(searchQuery)
      );
    }

    setFilteredTransactions(filteredData);
  }, [searchQuery, filterType, transactions]);

  const navigateToEditTransaction = (transaction) => {
    navigation.navigate('Transaction', { transaction });
  };

  const renderTransaction = ({ item }) => {
    const iconDetails = icons.find((icon) => icon.name === item.category.icon);
    const iconColor = iconDetails ? iconDetails.color : '#6246EA'; // Default color

    return (
      <TouchableOpacity
        style={styles.transactionContainer}
        onPress={() => navigateToEditTransaction(item)}
      >
        <Icon name={item.category.icon} size={30} color={iconColor} style={styles.categoryIcon} />
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.transactionCategory}>{item.category.name}</Text>
        </View>
        <Text style={styles.transactionAmount}>
          {`${item.type === 'Expense' ? '-' : '+'} ${item.amount} VND`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>All Transactions</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setFilterType('All')}>
            <Text style={[styles.filterButton, filterType === 'All' && styles.activeFilter]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterType('Income')}>
            <Text style={[styles.filterButton, filterType === 'Income' && styles.activeFilter]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterType('Expense')}>
            <Text style={[styles.filterButton, filterType === 'Expense' && styles.activeFilter]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by category or date..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="magnify" size={24} color="#333" />
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeFilter: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#6200ee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryIcon: {
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AllTransaction;
