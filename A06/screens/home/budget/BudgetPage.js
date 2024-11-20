import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const navigation = useNavigation();

  useEffect(() => {
    if (userId) {
      const budgetsRef = ref(FIREBASE_DB, `users/${userId}/budgets`);

      // Lắng nghe toàn bộ dữ liệu budgets
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
    }
  }, [userId]);

  const handleUpdateBudget = (budgetId, updatedExpense) => {
    const budgetRef = ref(FIREBASE_DB, `users/${userId}/budgets/${budgetId}`);
    const updatedRemaining = budgets.find((budget) => budget.id === budgetId)?.amount - updatedExpense;

    update(budgetRef, {
      expense: updatedExpense,
      remaining: updatedRemaining,
    })
      .then(() => {
        Alert.alert('Success', 'Budget updated successfully.');
      })
      .catch((error) => {
        console.error('Error updating budget:', error);
        Alert.alert('Error', 'Failed to update budget.');
      });
  };

  const handleDeleteBudget = (budgetId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const budgetRef = ref(FIREBASE_DB, `users/${userId}/budgets/${budgetId}`);
          remove(budgetRef)
            .then(() => Alert.alert('Success', 'Budget deleted successfully.'))
            .catch((error) => {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget.');
            });
        },
      },
    ]);
  };

  const renderBudgetItem = ({ item }) => (
    <View style={styles.budgetCard}>
      <Text style={styles.budgetName}>{item.name}</Text>
      <Text>Total: {item.amount} VND</Text>
      <Text>Expense: {item.expense || 0} VND</Text>
      <Text>Remaining: {item.remaining || 0} VND</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBudget(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => handleUpdateBudget(item.id, (item.expense || 0) + 1000)} // Example: Add 1000 to expense
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets</Text>
      <FlatList
        data={budgets}
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
  budgetName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
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
