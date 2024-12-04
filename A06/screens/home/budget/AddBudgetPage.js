import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, set, onValue } from 'firebase/database';

const AddBudgetPage = () => {
  const navigation = useNavigation();
  const [budgetName, setBudgetName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Lấy danh sách categories từ Firebase
  useEffect(() => {
    if (userId) {
      const categoryRef = ref(FIREBASE_DB, `categories/${userId}`);
      onValue(categoryRef, (snapshot) => {
        const data = snapshot.val();
        const categoryList = data
          ? Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }))
          : [];
        setCategories(categoryList);
      });
    }
  }, [userId]);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowDatePicker(false);
    setEndDate(currentDate);
  };

  const handleSaveBudget = () => {
    if (!budgetName || !totalAmount || !selectedCategory) {
      Alert.alert('Error', 'Please fill all fields and select a category.');
      return;
    }

    const newBudget = {
      name: budgetName,
      amount: parseFloat(totalAmount),
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      endDate: endDate.toISOString(),
    };

    const budgetRef = ref(FIREBASE_DB, `users/${userId}/budgets/${Date.now()}`);
    set(budgetRef, newBudget)
      .then(() => {
        Alert.alert('Success', 'Budget created successfully.');
        navigation.goBack();
      })
      .catch((error) => {
        console.error('Error saving budget:', error);
        Alert.alert('Error', 'Failed to save budget.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Budget</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Budget Name"
        value={budgetName}
        onChangeText={setBudgetName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Total Amount"
        keyboardType="numeric"
        value={totalAmount}
        onChangeText={setTotalAmount}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={endDate} mode="date" display="default" onChange={onDateChange} />
      )}
      <Text style={styles.sectionTitle}>Select Category</Text>
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.categoryButton,
              cat.id === selectedCategory?.id && styles.selectedCategoryButton,
            ]}
          >
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button mode="contained" onPress={handleSaveBudget} style={styles.saveButton}>
        Save Budget
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 },
  datePicker: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5, marginBottom: 20 },
  dateText: { fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryButton: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedCategoryButton: { backgroundColor: '#ddd' },
  saveButton: { marginTop: 20, backgroundColor: '#6246EA' },
});

export default AddBudgetPage;
