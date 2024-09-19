import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import { FIREBASE_DB } from './FirebaseConfig'; 
import { ref, onValue } from 'firebase/database';

const HomePage = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState(null);

  // Hàm lấy 10 giao dịch có amount lớn nhất dựa theo loại đã lọc
  const getTopTransactions = () => {
    return [...transactions]
      .filter(transaction => filterType ? transaction.type.toLowerCase() === filterType.toLowerCase() : true) // Lọc theo loại
      .sort((a, b) => b.amount - a.amount) // Sắp xếp giảm dần theo amount
      .slice(0, 10); // Lấy top 10 giao dịch
  };

  // Hàm thêm giao dịch
  const handleAddTransaction = () => {
    navigation.navigate('HomeContent'); 
  };

  // Hàm lọc giao dịch theo loại
  const handleFilter = (type) => {
    setFilterType(type);
    const filteredData = transactions.filter(transaction => {
      const titleMatch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase());
      const dateMatch = transaction.date.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = type ? transaction.type.toLowerCase() === type.toLowerCase() : true;
      const amountMatch = !isNaN(Number(searchTerm))
        ? transaction.amount === Number(searchTerm)
        : transaction.amount.toString().includes(searchTerm);
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
    handleFilter(filterType);
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
      setFilteredTransactions(transactionsList);
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

        {/* Danh sách các giao dịch có amount lớn nhất theo loại */}
        <FlatList
          data={getTopTransactions()} // Lấy top 10 giao dịch có amount lớn nhất theo loại hiện tại
          keyExtractor={(item) => item.id.toString()}
          horizontal={true} // Hiển thị theo chiều ngang
          renderItem={({ item }) => (
            <View style={styles.topTransactionItem}>
              <Text style={styles.topTransactionText}>
                {item.title}: {item.amount} vnd
              </Text>
            </View>
          )}
          style={{ marginBottom: 10 }}
        />

        {/* Danh sách giao dịch đã lọc */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.transactionItem} 
              onPress={() => handlePressTransaction(item)} 
            >
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.transactionImage} />
              )}
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionText}>
                  {item.date} - {item.title} - {item.amount} vnd - {item.type}
                </Text>
              </View>
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
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
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
  topTransactionItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginRight: 10,
  },
  topTransactionText: {
    fontSize: 14,
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
    flexDirection: 'row',
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 10,
  },
  transactionText: {
    fontSize: 16,
  },
  transactionImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
});

export default HomePage;
