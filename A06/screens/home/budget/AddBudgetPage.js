import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, push, onValue } from 'firebase/database';

const AddBudgetPage = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const userId = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const defaultCategoriesRef = ref(FIREBASE_DB, 'categories/default');
    const userCategoriesRef = ref(FIREBASE_DB, `categories/${userId}`);
    const fetchCategories = [];

    onValue(defaultCategoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        fetchCategories.push(...Object.values(data));
      }
    });

    onValue(userCategoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        fetchCategories.push(...Object.values(data));
      }
    });

    setCategories(fetchCategories);
  }, [userId]);

  const handleAddBudget = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Error', 'Please enter an amount and select a category.');
      return;
    }

    try {
      const budgetsRef = ref(FIREBASE_DB, `users/${userId}/budgets`);
      await push(budgetsRef, {
        name: selectedCategory.name,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
        categoryId: selectedCategory.id,
        amount: parseFloat(amount),
        expense: 0,
        remaining: parseFloat(amount),
      });

      Alert.alert('Success', 'Budget added successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding budget:', error);
      Alert.alert('Error', 'Failed to add budget.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Budget</Text>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <Text style={styles.label}>Select Category</Text>
      <View style={styles.categoryList}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory?.id === category.id && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Icon name={category.icon} size={30} color={category.color} />
            <Text>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
        <Text style={styles.addButtonText}>Add Budget</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryButton: {
    alignItems: 'center',
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  selectedCategory: { borderColor: '#6200ee', backgroundColor: '#f0e6ff' },
  addButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 18 },
});

export default AddBudgetPage;
