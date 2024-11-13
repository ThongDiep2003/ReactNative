import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const EditTransaction = ({ route }) => {
  const navigation = useNavigation();
  const { transaction } = route.params;

  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(new Date(transaction.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [account, setAccount] = useState(transaction.account || 'VCB');
  const [category, setCategory] = useState(transaction.category);
  const [type, setType] = useState(transaction.type || 'Expense');
  const [defaultCategories, setDefaultCategories] = useState([]);
  const [userCategories, setUserCategories] = useState([]);

  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Fetch default and user categories from Firebase
  useEffect(() => {
    // Fetch default categories
    const defaultCategoriesRef = ref(FIREBASE_DB, 'categories/default');
    onValue(defaultCategoriesRef, (snapshot) => {
      const data = snapshot.val();
      const categories = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];
      setDefaultCategories(categories);
    });

    // Fetch user categories
    if (userId) {
      const userCategoriesRef = ref(FIREBASE_DB, `categories/${userId}`);
      onValue(userCategoriesRef, (snapshot) => {
        const data = snapshot.val();
        const categories = data
          ? Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }))
          : [];
        setUserCategories(categories);
      });
    }
  }, [userId]);

  // Combine default and user categories
  const getFilteredCategories = () => {
    const filteredDefaultCategories = defaultCategories.filter((cat) => cat.type === type);
    const filteredUserCategories = userCategories.filter((cat) => cat.type === type);
    return [...filteredDefaultCategories, ...filteredUserCategories];
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleSaveTransaction = async () => {
    if (!amount || !category) {
      Alert.alert('Validation Error', 'Please enter an amount and select a category.');
      return;
    }

    const updatedTransaction = {
      amount,
      date: date.toISOString(),
      account,
      category: { id: category.id, icon: category.icon, name: category.name },
      type,
    };

    try {
      const transactionRef = ref(FIREBASE_DB, `transactions/${transaction.id}`);
      await update(transactionRef, updatedTransaction);
      Alert.alert('Success', 'Transaction updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
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
        <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
      )}

      {/* Category Selection */}
      <Text style={styles.sectionTitle}>Select Category</Text>
      <View style={styles.categoryContainer}>
        {getFilteredCategories().map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setCategory(cat)}
            style={[styles.categoryButton, cat.id === category?.id && styles.selectedCategoryButton]}
          >
            <Icon
              name={cat.icon}
              size={30}
              color={cat.id === category?.id ? '#fff' : cat.color || '#6246EA'}
              style={styles.categoryIcon}
            />
            <Text style={[styles.categoryText, cat.id === category?.id && styles.selectedCategoryText]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Selection */}
      <Text style={styles.sectionTitle}>Select Account</Text>
      <View style={styles.accountContainer}>
        {['VCB', 'BIDV', 'Momo', 'Cash'].map((acc) => (
          <Chip
            key={acc}
            mode="outlined"
            selected={account === acc}
            onPress={() => setAccount(acc)}
            style={[styles.accountChip, account === acc && styles.selectedAccountChip]}
            textStyle={account === acc ? styles.selectedAccountText : null}
          >
            {acc}
          </Chip>
        ))}
      </View>

      {/* Save Button */}
      <Button mode="contained" onPress={handleSaveTransaction} buttonColor="#6246EA" style={styles.saveButton}>
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
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 20 },
  categoryButton: { alignItems: 'center', marginBottom: 15, padding: 10, borderRadius: 10, backgroundColor: '#fafafa', width: '23%' },
  selectedCategoryButton: { backgroundColor: '#D1C8FF' },
  categoryIcon: { marginBottom: 3 },
  categoryText: { fontSize: 11, color: '#6246EA' },
  selectedCategoryText: { fontWeight: 'bold', color: '#fff' },
  accountContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  accountChip: { backgroundColor: '#e3f2fd', marginHorizontal: 5 },
  selectedAccountChip: { backgroundColor: '#D1C8FF' },
  selectedAccountText: { color: '#6246EA', fontWeight: 'bold' },
  saveButton: { height: 50, backgroundColor: '#6246EA', borderRadius: 25, justifyContent: 'center', alignItems: 'center', width: '100%' },
});

export default EditTransaction;
