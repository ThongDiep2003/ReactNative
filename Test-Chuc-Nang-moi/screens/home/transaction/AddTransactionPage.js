import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Button, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Để sử dụng icon trong các button danh mục

const AddTransaction = () => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [account, setAccount] = useState('VCB');
  const [category, setCategory] = useState(null);
  const [transactionType, setTransactionType] = useState('Expense');

  const accounts = ['VCB', 'BIDV', 'Cash']; // Các tùy chọn tài khoản
  const categories = [
    { id: 1, name: 'Food', icon: 'fast-food' },
    { id: 2, name: 'Shopping', icon: 'cart' },
    { id: 3, name: 'Entertainment', icon: 'game-controller' },
    { id: 4, name: 'Bills', icon: 'receipt' },
    { id: 5, name: 'Health', icon: 'medkit' },
    { id: 6, name: 'Travel', icon: 'airplane' },
  ]; // Các danh mục

  const handleCategorySelect = (category) => {
    setCategory(category);
  };

  const handleSaveTransaction = () => {
    // Hàm xử lý khi người dùng nhấn "Confirm"
    if (!amount || !date || !category || !account) {
      alert('Please fill in all fields');
      return;
    }
    alert('Transaction saved');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction</Text>

      {/* Chọn kiểu giao dịch: Income hoặc Expense */}
      <View style={styles.transactionTypeContainer}>
        <TouchableOpacity onPress={() => setTransactionType('Income')} style={styles.transactionTypeButton}>
          <Text style={transactionType === 'Income' ? styles.activeType : styles.inactiveType}>New Income</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTransactionType('Expense')} style={styles.transactionTypeButton}>
          <Text style={transactionType === 'Expense' ? styles.activeType : styles.inactiveType}>New Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Nhập số tiền */}
      <View style={styles.amountContainer}>
        <TextInput
          style={styles.amountInput}
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Text style={styles.currency}>vnd</Text>
      </View>

      {/* Chọn ngày */}
      <TextInput
        style={styles.input}
        placeholder="Select date"
        value={date}
        onChangeText={setDate}
      />

      {/* Chọn tài khoản */}
      <Text style={styles.label}>From account</Text>
      <View style={styles.accountContainer}>
        {accounts.map((acc) => (
          <TouchableOpacity
            key={acc}
            style={[styles.accountButton, account === acc && styles.selectedAccount]}
            onPress={() => setAccount(acc)}
          >
            <Text style={account === acc ? styles.selectedAccountText : styles.accountText}>{acc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chọn danh mục */}
      <Text style={styles.label}>From category</Text>
      <FlatList
        data={categories}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              category?.id === item.id && styles.selectedCategory,
            ]}
            onPress={() => handleCategorySelect(item)}
          >
            <Ionicons name={item.icon} size={24} color={category?.id === item.id ? 'white' : 'black'} />
            <Text style={category?.id === item.id ? styles.selectedCategoryText : styles.categoryText}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Nút xác nhận */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleSaveTransaction}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  transactionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  transactionTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  activeType: {
    fontSize: 18,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  inactiveType: {
    fontSize: 18,
    color: '#9e9e9e',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginRight: 10,
  },
  currency: {
    fontSize: 24,
    color: '#9e9e9e',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  accountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  accountButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#6200ee',
    alignItems: 'center',
  },
  selectedAccount: {
    backgroundColor: '#6200ee',
  },
  accountText: {
    color: '#6200ee',
  },
  selectedAccountText: {
    color: 'white',
  },
  categoryButton: {
    flex: 1,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  selectedCategory: {
    backgroundColor: '#6200ee',
  },
  categoryText: {
    marginTop: 5,
    color: '#333',
  },
  selectedCategoryText: {
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddTransaction;
