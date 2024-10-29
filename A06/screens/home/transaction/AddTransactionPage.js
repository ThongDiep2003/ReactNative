import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.header}>Add Transactions</Text>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Text style={styles.currency}>VND</Text>
      </View>

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
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
      <Text style={styles.sectionTitle}>From category</Text>
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} onPress={() => handleCategorySelect(cat)}>
            <Icon
              name={cat.icon}  // Assuming each category has an 'icon' property
              size={40}
              color={cat.id === category?.id ? '#6200ee' : 'gray'}
              style={styles.categoryIcon}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Type Selection */}
      <Text style={styles.sectionTitle}>Transaction Type</Text>
      <View style={styles.chipContainer}>
        {['Expense', 'Income'].map((t) => (
          <Chip
            key={t}
            mode="outlined"
            selected={type === t}
            onPress={() => setType(t)}
            style={styles.chip}
          >
            {t}
          </Chip>
        ))}
      </View>

      {/* Account Selection */}
      <Text style={styles.sectionTitle}>From account</Text>
      <View style={styles.chipContainer}>
        {['VCB', 'BIDV', 'Cash'].map((acc) => (
          <Chip
            key={acc}
            mode="outlined"
            selected={account === acc}
            onPress={() => handleAccountSelect(acc)}
            style={styles.chip}
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
        <Text style={styles.addCategoryText}>Add New Category</Text>
      </TouchableOpacity>

      {/* Save Button */}
      <Button mode="contained" onPress={handleSaveTransaction}>
        Save Transaction
      </Button>
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
    marginTop: 20,
    textAlign: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  amountInput: {
    fontSize: 36,
    borderBottomWidth: 1,
    borderColor: 'gray',
    width: '70%',
    textAlign: 'center',
  },
  currency: {
    fontSize: 18,
    marginLeft: 5,
  },
  datePicker: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
    marginVertical: 10,
  },
  dateText: {
    fontSize: 18,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    marginRight: 5,
    backgroundColor: '#f1f1f1',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  categoryIcon: {
    marginHorizontal: 10,
  },
  addCategoryButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  addCategoryText: {
    color: '#6200ee',
    fontSize: 16,
  },
});

export default AddTransaction;
