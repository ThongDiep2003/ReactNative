import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig'; // Ensure correct Firebase config is imported
import { ref, push } from 'firebase/database';

const AddBudgetPage = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState({ name: 'tshirt-crew-outline', color: '#f39cc3' }); // Default icon and color

  // Navigate to IconSelectionPage
  const handleIconChange = () => {
    navigation.navigate('IconSelection', {
      onIconSelected: (icon) => setSelectedIcon(icon), // Set both name and color of the icon
    });
  };

  const handleSubmit = async () => {
    if (!categoryName || !selectedIcon.name) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) {
      alert('User not authenticated.');
      return;
    }

    try {
      const userBudgetsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/budgets`);
      const newBudgetRef = await push(userBudgetsRef, {
        name: categoryName,
        icon: selectedIcon.name,
        color: selectedIcon.color,
        amount: 0, // Set budget limit to 0 initially
        expense: 0, // Default expense value to 0
      });

      alert('Budget added successfully!');
      navigation.navigate('EditBudget', { budgetId: newBudgetRef.key }); // Pass the new budget ID to EditBudgetPage
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Failed to add budget. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Icon Section */}
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleIconChange}>
          <View style={[styles.iconCircle, { backgroundColor: selectedIcon.color }]}>
            <Icon name={selectedIcon.name} size={50} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changeIconText}>Đổi biểu tượng</Text>
      </View>

      {/* Input Fields */}
      <Text style={styles.label}>Tên danh mục *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên danh mục"
        maxLength={30}
        value={categoryName}
        onChangeText={(text) => setCategoryName(text)}
      />

      {/* Confirm Button */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!categoryName) && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={!categoryName}
      >
        <Text style={styles.confirmButtonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIconText: {
    color: '#f39cc3',
    fontSize: 14,
    marginTop: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#f39cc3',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  confirmButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddBudgetPage;
