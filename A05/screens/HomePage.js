import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import Icon from 'react-native-vector-icons/Entypo'; // Import Icon Entypo
import { FIREBASE_DB } from './FirebaseConfig'; // Import Firebase configuration
import { ref, onValue } from 'firebase/database';

const HomePage = () => {
  const navigation = useNavigation(); // Khởi tạo useNavigation
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState(null); // Để lưu loại lọc hiện tại

  // Hàm thêm giao dịch
  const handleAddTransaction = () => {
    navigation.navigate('HomeContent'); // Điều hướng đến HomeContent.js
  };

  // Hàm lọc giao dịch theo loại
  const handleFilter = (type) => {
    setFilterType(type);
    const filteredData = transactions.filter(transaction => {
      const titleMatch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase());
      const dateMatch = transaction.date.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = type ? transaction.type.toLowerCase() === type.toLowerCase() : true; // Lọc theo loại
      const amountMatch = !isNaN(Number(searchTerm))
        ? transaction.amount === Number(searchTerm) // So sánh số
        : transaction.amount.toString().includes(searchTerm); // So sánh chuỗi
      const searchDate = new Date(searchTerm);
      const dateString = new Date(transaction.date).toDateString();
      const dateMatchByDate = !isNaN(searchDate.getTime()) && dateString.includes(searchDate.toDateString());
      
      return (filterType ? typeMatch : true) &&
             (titleMatch || dateMatch || amountMatch || dateMatchByDate);
    });
    setFilteredTransactions(filteredData);
  };

  // Hàm tìm kiếm
  const handleSearch = (text) => {
    setSearchTerm(text);
    handleFilter(filterType); // Lọc lại sau khi thay đổi tìm kiếm
  };

  // Hàm xóa bộ lọc
  const clearFilter = () => {
    setFilterType(null);
    setSearchTerm('');
    setFilteredTransactions(transactions);
  };

  // Lấy dữ liệu giao dịch từ Firebase Realtime Database
  const fetchTransactions = () => {
    const transactionsRef = ref(FIREBASE_DB, 'transactions');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      const transactionsList = data ? Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })) : [];
      setTransactions(transactionsList);
      setFilteredTransactions(transactionsList); // Cập nhật dữ liệu ban đầu
    }, (error) => {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions. Please try again.');
    });
  };

  useEffect(() => {
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

  // Hàm điều hướng đến Transaction
  const handlePressTransaction = (transaction) => {
    navigation.navigate('Transaction', { transaction });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search transactions"
          value={searchTerm}
          onChangeText={handleSearch}
        />
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, styles.leftButton]}
            onPress={() => handleFilter('Expense')}
          >
            <Text style={styles.filterButtonText}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearFilter}
          >
            <Text style={styles.filterButtonText}>Clear Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.rightButton]}
            onPress={() => handleFilter('Income')}
          >
            <Text style={styles.filterButtonText}>Income</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredTransactions} // Hiển thị các giao dịch đã lọc
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.transactionItem} 
              onPress={() => handlePressTransaction(item)} // Điều hướng khi bấm vào giao dịch
            >
              <Text style={styles.transactionText}>{item.date} - {item.title} - {item.amount} - {item.type}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <TouchableOpacity style={styles.createButton} onPress={handleAddTransaction}>
        <Text style={styles.createButtonText}>Create New Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between', // Để chứa nội dung chính và nút ở footer
  },
  mainContent: {
    flex: 1, // Chiếm không gian còn lại
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#d0d0d0',
  },
  leftButton: {
    marginRight: 10,
  },
  rightButton: {
    marginLeft: 10,
  },
  clearButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#d0d0d0',
    flex: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#0163d2',
  },
  createButton: {
    backgroundColor: '#0163d2',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  transactionItem: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  transactionText: {
    fontSize: 16,
  },
});

export default HomePage;
