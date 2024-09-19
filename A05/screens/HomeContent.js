import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FIREBASE_DB } from './FirebaseConfig'; // Import Firebase configuration
import { ref, set } from 'firebase/database';

const HomeContent = ({ navigation }) => {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense'); // Default type

  // Hàm lưu giao dịch vào Firebase
  const handleSaveTransaction = async () => {
    try {
      // Validate input fields
      if (!date || !title || !amount) {
        Alert.alert('Error', 'Please fill all the fields');
        return;
      }

      // Generate a unique ID for the transaction
      const transactionId = Date.now().toString();

      // Save transaction to Firebase Realtime Database
      const transactionRef = ref(FIREBASE_DB, 'transactions/' + transactionId);
      await set(transactionRef, {
        date,
        title,
        amount,
        type,
      });

      Alert.alert('Success', 'Transaction saved successfully');
      // Reset form fields
      setDate('');
      setTitle('');
      setAmount('');
      setType('Expense');
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create New Transaction</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleSaveTransaction}>
        <Text style={styles.buttonText}>Save Transaction</Text>
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
    backgroundColor: '#0163d2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeContent;
