import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue, remove } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BudgetPage = ({ navigation }) => {
  const [budgets, setBudgets] = useState([]);
  const userId = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const budgetsRef = ref(FIREBASE_DB, `users/${userId}/budgets`);
    const transactionsRef = ref(FIREBASE_DB, `users/${userId}/transactions`);

    onValue(budgetsRef, (snapshot) => {
      const budgetsData = snapshot.val() || {};
      const budgetList = Object.keys(budgetsData).map((key) => ({
        id: key,
        ...budgetsData[key],
      }));

      onValue(transactionsRef, (txnSnapshot) => {
        const transactionsData = txnSnapshot.val() || {};
        budgetList.forEach((budget) => {
          const relatedTransactions = Object.values(transactionsData).filter(
            (txn) => txn.category.id === budget.categoryId
          );

          const totalSpent = relatedTransactions.reduce(
            (sum, txn) => sum + parseFloat(txn.amount || 0),
            0
          );

          budget.expense = totalSpent;
          budget.remaining = budget.amount - totalSpent;
        });

        setBudgets(budgetList);
      });
    });
  }, [userId]);

  const handleDeleteBudget = (budgetId) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const budgetRef = ref(FIREBASE_DB, `users/${userId}/budgets/${budgetId}`);
              await remove(budgetRef);
              Alert.alert('Deleted', 'Budget has been deleted successfully.');
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets</Text>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Icon name={item.icon} size={30} color={item.color} />
              <Text style={styles.budgetName}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteBudget(item.id)} style={styles.deleteButton}>
                <Icon name="delete" size={24} color="#f44336" />
              </TouchableOpacity>
            </View>
            <Text style={styles.budgetAmount}>
              Remaining: {item.remaining} / {item.amount} VND
            </Text>
            <Text style={styles.budgetExpense}>Spent: {item.expense} VND</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddBudget')}
      >
        <Text style={styles.addButtonText}>+ Add Budget</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  budgetCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  budgetName: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  deleteButton: { marginLeft: 'auto' },
  budgetAmount: { fontSize: 16, color: '#4CAF50', marginBottom: 5 },
  budgetExpense: { fontSize: 14, color: '#f44336' },
  addButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 18 },
});

export default BudgetPage;
