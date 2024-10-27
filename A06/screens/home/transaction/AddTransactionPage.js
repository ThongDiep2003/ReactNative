import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

const AddTransaction = () => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [account, setAccount] = useState('VCB');
  const [category, setCategory] = useState(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Transactions</Text>

      {/* Số tiền */}
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

      {/* Chọn ngày */}
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

      {/* Tài khoản */}
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

      {/* Danh mục */}
      <Text style={styles.sectionTitle}>From category</Text>
      <View style={styles.categoryContainer}>
        {['food', 'shopping', 'entertainment', 'health', 'travel'].map((cat, index) => (
          <TouchableOpacity key={index} onPress={() => handleCategorySelect(cat)}>
            <Icon
              name={cat === category ? 'checkmark-circle' : 'ellipse-outline'}
              size={40}
              color={cat === category ? '#6200ee' : 'gray'}
              style={styles.categoryIcon}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Nút lưu */}
      <Button mode="contained" onPress={() => Alert.alert('Saved')}>
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
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  categoryIcon: {
    marginHorizontal: 10,
  },
});

export default AddTransaction;
