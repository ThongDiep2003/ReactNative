import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue } from 'firebase/database';

const AllTransaction = () => {
  const [transactions, setTransactions] = useState([]);

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
        }
      });
    }
  }, []);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionContainer}>
      <Icon name={item.category.icon} size={30} color="#6246EA" style={styles.categoryIcon} />
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.transactionCategory}>{item.category.name}</Text>
      </View>
      <Text style={styles.transactionAmount}>{`${item.type === 'Expense' ? '-' : '+'} ${item.amount} VND`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>All transactions</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Icon name="filter-variant" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="magnify" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={transactions}
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
