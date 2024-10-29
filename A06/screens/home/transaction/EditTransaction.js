import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ref, update, onValue } from 'firebase/database';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';

const EditTransaction = ({ route }) => {
  const navigation = useNavigation();
  const { transaction } = route.params; // Nhận tham số từ Transaction

  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(new Date(transaction.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [account, setAccount] = useState(transaction.account || 'VCB');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);
  const [type, setType] = useState(transaction.type || 'Expense');

  useEffect(() => {
    // Lấy danh sách danh mục từ Firebase
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
    setSelectedCategory(selectedCategory);
  };

  const handleSaveChanges = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Validation Error', 'Please enter an amount and select a category.');
      return;
    }

    try {
      const transactionRef = ref(FIREBASE_DB, 'transactions/' + transaction.id);
      await update(transactionRef, {
        amount,
        date: date.toISOString(),
        account,
        category: { id: selectedCategory.id, icon: selectedCategory.icon },
        type,
      });

      Alert.alert('Success', 'Transaction updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Transaction</Text>

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
              color={cat.id === selectedCategory?.id ? '#6200ee' : 'gray'}
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

      {/* Save Button */}
      <Button mode="contained" onPress={handleSaveChanges}>
        Save Changes
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
});

export default EditTransaction;
