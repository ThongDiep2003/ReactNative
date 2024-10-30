import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig';
import { ref, push } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

const AddBudgetPage = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const handleAddBudget = () => {
    if (amount && category) {
      const categoryRef = ref(FIREBASE_DB, 'categories');
      push(categoryRef, {
        name: category,
        amount: parseFloat(amount),
        date: moment().format('MMMM Do YYYY'),
      });

      const budgetRef = ref(FIREBASE_DB, 'budget');
      push(budgetRef, {
        category: category,
        amount: parseFloat(amount),
        date: moment().format('MMMM Do YYYY'),
      }).then(() => {
        setAmount('');
        setCategory('');
        navigation.goBack();
      });
    } else {
      alert('Please enter all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Budget</Text>
      
      <View style={styles.inputContainer}>
        <Icon name="currency-vnd" size={25} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Amount (VND)"
          keyboardType="numeric"
          value={amount}
          onChangeText={(text) => setAmount(text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="format-list-bulleted" size={25} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Category"
          value={category}
          onChangeText={(text) => setCategory(text)}
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
        <Text style={styles.addButtonText}>Add Budget</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddBudgetPage;
