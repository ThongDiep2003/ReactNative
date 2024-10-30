import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, push, onValue } from 'firebase/database';

const AddTransaction = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [account, setAccount] = useState('VCB');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [type, setType] = useState('Expense'); // Default type

  // Fetch categories from Firebase
  useEffect(() => {
    const categoriesRef = ref(FIREBASE_DB, 'categories');
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoryList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCategories(categoryList);
      }
    });
  }, []);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleAccountSelect = (selectedAccount) => {
    setAccount(selectedAccount);
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handleSaveTransaction = async () => {
    if (!amount || !category) {
      Alert.alert('Validation Error', 'Please enter an amount and select a category.');
      return;
    }

    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      const newTransaction = {
        amount,
        date: date.toISOString(),
        account,
        category: { id: category.id, icon: category.icon },
        type,
      };

      try {
        // Thêm giao dịch vào trong nhánh transactions của từng user
        const userTransactionsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/transactions`);
        await push(userTransactionsRef, newTransaction);

        Alert.alert('Success', 'Transaction added successfully.');
        navigation.goBack(); // Navigate back after saving
      } catch (error) {
        console.error('Error saving transaction:', error);
        Alert.alert('Error', 'Failed to save transaction. Please try again.');
      }
    } else {
      Alert.alert('Error', 'User not authenticated.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageHeader}>Add Transaction</Text>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, type === 'Income' && styles.inactiveTab]} onPress={() => setType('Income')}>New Income</Text>
        <Text style={[styles.header, type === 'Expense' && styles.inactiveTab]} onPress={() => setType('Expense')}>New Expense</Text>
      </View>

      {/* Amount Input */}
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

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Icon name="calendar" size={24} color="#6246EA" />
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Category Selection */}
      <Text style={styles.sectionTitle}>Select Category</Text>
      <View style={styles.categoryContainer}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => handleCategorySelect(cat)}
            style={[styles.categoryButton, cat.id === category?.id && styles.selectedCategoryButton]}
          >
            <Icon
              name={cat.icon}
              size={30}
              color={cat.id === category?.id ? '#6246EA' : CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              style={styles.categoryIcon}
            />
            <Text style={[styles.categoryText, cat.id === category?.id && styles.selectedCategoryText]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Selection */}
      <Text style={styles.sectionTitle}>Select Account</Text>
      <View style={styles.accountContainer}>
        {['VCB', 'BIDV', 'Cash'].map((acc) => (
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

      {/* Add New Category Button */}
      <TouchableOpacity
        style={styles.addCategoryButton}
        onPress={() => navigation.navigate('Category')}
      >
        <Text style={styles.addCategoryText}>+ Add New Category</Text>
      </TouchableOpacity>

      {/* Save Button */}
      <Button mode="contained" onPress={handleSaveTransaction} buttonColor="#6246EA" style={styles.saveButton}>
        Save Transaction
      </Button>
    </ScrollView>
  );
};

const CATEGORY_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b'
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 20,
  },
  pageHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#6246EA',
    color: '#6246EA',
  },
  inactiveTab: {
    color: 'gray',
    borderBottomColor: 'transparent',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  amountInput: {
    fontSize: 28,
    borderBottomWidth: 2,
    borderColor: '#6246EA',
    width: '70%',
    textAlign: 'center',
    marginRight: 10,
  },
  currency: {
    fontSize: 18,
    color: '#6246EA',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e0f7fa',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#6246EA',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fafafa',
    width: '30%',
  },
  selectedCategoryButton: {
    backgroundColor: '#D1C8FF',
  },
  categoryIcon: {
    marginBottom: 5,
  },
  selectedCategoryIcon: {
    backgroundColor: '#6246EA',
  },
  categoryText: {
    fontSize: 14,
    color: '#6246EA',
  },
  selectedCategoryText: {
    color: '#6246EA',
    fontWeight: 'bold',
  },
  accountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  accountChip: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 5,
  },
  selectedAccountChip: {
    backgroundColor: '#D1C8FF',
  },
  selectedAccountText: {
    color: '#6246EA',
    fontWeight: 'bold',
  },
  addCategoryButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addCategoryText: {
    color: '#6246EA',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    marginVertical: 5,
    paddingVertical: 10,
    borderRadius: 10,
  },
});

export default AddTransaction;