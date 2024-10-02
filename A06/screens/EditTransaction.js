import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ref, update } from 'firebase/database';
import { FIREBASE_DB } from './FirebaseConfig'; // Import Firebase configuration

const EditTransaction = ({ route, navigation }) => {
  const { transaction } = route.params; // Nhận tham số từ Transaction

  const [date, setDate] = useState(transaction.date);
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(transaction.amount);
  const [type, setType] = useState(transaction.type);
  const [details, setDetails] = useState(transaction.details);

  // Hàm lưu thay đổi giao dịch vào Firebase
  const handleUpdateTransaction = async () => {
    try {
      // Validate input fields
      if (!date || !title || !amount) {
        Alert.alert('Error', 'Please fill all the fields');
        return;
      }

      // Tạo tham chiếu đến giao dịch cần cập nhật
      const transactionRef = ref(FIREBASE_DB, 'transactions/' + transaction.id);

      // Cập nhật thông tin giao dịch
      await update(transactionRef, {
        date,
        title,
        amount,
        type,
        details,
      });

      Alert.alert('Success', 'Transaction updated successfully');
      // Quay lại màn hình trước đó
      navigation.goBack();
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Transaction</Text>
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Type (Expense/Income)"
        value={type}
        onChangeText={setType}
      />
      <TextInput
        style={styles.input}
        placeholder="Details"
        value={details}
        onChangeText={setDetails}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateTransaction}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditTransaction;
