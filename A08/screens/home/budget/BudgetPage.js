import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-paper';
import { PieChart } from 'react-native-svg-charts'; // For Donut Chart
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const navigation = useNavigation();

  useEffect(() => {
    if (userId) {
      // Fetch budgets
      const budgetsRef = ref(FIREBASE_DB, `users/${userId}/budgets`);
      onValue(budgetsRef, (snapshot) => {
        const budgetData = snapshot.val();
        if (budgetData) {
          const budgetsList = Object.entries(budgetData).map(([id, data]) => ({
            id,
            ...data,
          }));
          setBudgets(budgetsList);
        } else {
          setBudgets([]);
        }
      });

      // Fetch transactions
      const transactionsRef = ref(FIREBASE_DB, `users/${userId}/transactions`);
      onValue(transactionsRef, (snapshot) => {
        const transactionData = snapshot.val();
        if (transactionData) {
          const transactionsList = Object.entries(transactionData).map(([id, data]) => ({
            id,
            ...data,
          }));
          setTransactions(transactionsList);
        } else {
          setTransactions([]);
        }
      });
    }
  }, [userId]);

  // Calculate the expense for each budget
  const getUpdatedBudgets = () => {
    return budgets.map((budget) => {
      const relatedTransactions = transactions.filter(
        (transaction) => transaction.category?.id === budget.categoryId
      );
      const totalExpense = relatedTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = budget.amount - totalExpense;

      return {
        ...budget,
        expense: totalExpense,
        remaining,
      };
    });
  };

  const updatedBudgets = getUpdatedBudgets();

  const renderBudgetItem = ({ item }) => {
    const data = [
      { key: 1, value: item.remaining || 0, svg: { fill: '#4caf50' } }, // Remaining
      { key: 2, value: item.expense || 0, svg: { fill: '#ccc' } }, // Expense
    ];

    return (
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Icon
            name={item.categoryIcon}
            size={40}
            color={'#6246EA'}
            style={styles.categoryIcon}
          />
          <Text style={styles.budgetName}>{item.name}</Text>
        </View>
        <View style={styles.budgetContent}>
          <View>
            <Text>Total: {item.amount} VND</Text>
            <Text style={{ color: 'red' }}>Expense: {item.expense || 0} VND</Text>
            <Text style={{ color: 'green' }}>Remaining: {item.remaining || 0} VND</Text>
          </View>
          <PieChart
            style={styles.donutChart}
            data={data}
            innerRadius="50%" // Create the donut effect
            outerRadius="80%"
          />
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteBudget(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={styles.updateButton}
          onPress={() => navigation.navigate('EditBudget', { budgetId: item.id, budgetData: item })}>
          <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets</Text>
      <FlatList
        data={updatedBudgets}
        keyExtractor={(item) => item.id}
        renderItem={renderBudgetItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No budgets found. Create one below!</Text>}
        ListFooterComponent={
          <Button
            mode="contained"
            style={styles.createButton}
            onPress={() => navigation.navigate('AddBudget')}
          >
            Add New Budget
          </Button>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  budgetCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    marginRight: 10,
  },
  budgetName: { fontSize: 18, fontWeight: 'bold' },
  budgetContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donutChart: {
    width: 100,
    height: 100,
  },
  actionButtons: { flexDirection: 'row', marginTop: 10 },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  updateButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: { color: '#ffffff', fontWeight: 'bold' },
  createButton: {
    marginVertical: 20,
    backgroundColor: '#6246EA',
    alignSelf: 'center',
    width: '80%',
  },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
});

export default BudgetPage;
