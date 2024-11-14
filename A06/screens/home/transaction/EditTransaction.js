import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, update, get } from 'firebase/database';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const EditTransaction = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transaction } = route.params;

  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(new Date(transaction.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [account, setAccount] = useState(transaction.account);
  const [category, setCategory] = useState(transaction.category);
  const [type, setType] = useState(transaction.type);
  const userId = FIREBASE_AUTH.currentUser?.uid;

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleAccountSelect = (selectedAccount) => {
    setAccount(selectedAccount);
  };

  const handleSaveTransaction = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please enter an amount and select a category.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const transactionRef = ref(FIREBASE_DB, `users/${userId}/transactions/${transaction.id}`);
    const budgetsRef = ref(FIREBASE_DB, `users/${userId}/budgets`);

    try {
      // Lấy ngân sách hiện tại để xử lý cập nhật
      const budgetsSnapshot = await get(budgetsRef);
      const budgets = budgetsSnapshot.val();

      const updatedTransaction = {
        amount: parseFloat(amount),
        date: date.toISOString(),
        account,
        category: { id: category.id, icon: category.icon, name: category.name },
        type,
      };

      // Batch cập nhật ngân sách
      const updates = {};
      if (budgets) {
        Object.entries(budgets).forEach(([budgetId, budget]) => {
          // Xử lý ngân sách cũ
          if (budget.categoryId === transaction.category.id) {
            const revertedExpense = (budget.expense || 0) - parseFloat(transaction.amount);
            updates[`users/${userId}/budgets/${budgetId}/expense`] = revertedExpense;
            updates[`users/${userId}/budgets/${budgetId}/remaining`] = budget.amount - revertedExpense;
          }
          // Cập nhật ngân sách mới
          if (budget.categoryId === category.id) {
            const newExpense = (budget.expense || 0) + parseFloat(amount);
            updates[`users/${userId}/budgets/${budgetId}/expense`] = newExpense;
            updates[`users/${userId}/budgets/${budgetId}/remaining`] = budget.amount - newExpense;
          }
        });
      }

      // Cập nhật giao dịch và ngân sách trong một lần
      updates[`users/${userId}/transactions/${transaction.id}`] = updatedTransaction;
      await update(ref(FIREBASE_DB), updates);

      Alert.alert('Success', 'Transaction updated successfully.');
      navigation.goBack();
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction.');
    }
  };

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text
          style={[styles.header, type === 'Income' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setType('Income')}
        >
          Edit Income
        </Text>
        <Text
          style={[styles.header, type === 'Expense' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setType('Expense')}
        >
          Edit Expense
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <TextInput
          style={styles.amountInput}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Text style={styles.currency}>VND</Text>
      </View>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Icon name="calendar" size={24} color="#6246EA" />
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
      )}

      <Text style={styles.sectionTitle}>Edit Account</Text>
      <View style={styles.accountContainer}>
        {['VCB', 'BIDV', 'Momo', 'Cash'].map((acc) => (
          <Chip
            key={acc}
            mode="outlined"
            selected={account === acc}
            onPress={() => handleAccountSelect(acc)}
            style={[styles.accountChip, account === acc && styles.selectedAccountChip]}
            textStyle={account === acc ? styles.selectedAccountText : null}
          >
            {acc}
          </Chip>
        ))}
      </View>

      <Button mode="contained" onPress={handleSaveTransaction} style={styles.saveButton}>
        Save Changes
      </Button>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  contentContainer: { padding: 20, paddingBottom: 100 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  header: { fontSize: 18, fontWeight: 'bold', paddingVertical: 10, borderBottomWidth: 2 },
  activeTab: { color: '#6246EA', borderBottomColor: '#6246EA' },
  inactiveTab: { color: 'gray', borderBottomColor: 'transparent' },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  amountInput: { fontSize: 24, borderBottomWidth: 2, borderColor: '#6246EA', width: '70%', textAlign: 'center', marginRight: 10 },
  currency: { fontSize: 18, color: '#6246EA' },
  datePicker: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, backgroundColor: '#e0f7fa', marginBottom: 20 },
  dateText: { fontSize: 18, marginLeft: 10, color: '#6246EA' },
  accountContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  accountChip: { backgroundColor: '#e3f2fd', marginHorizontal: 5 },
  selectedAccountChip: { backgroundColor: '#D1C8FF' },
  selectedAccountText: { color: '#6246EA', fontWeight: 'bold' },
  saveButton: { marginTop: 20, height: 50, backgroundColor: '#6246EA', borderRadius: 25, justifyContent: 'center' },
});

export default EditTransaction;
