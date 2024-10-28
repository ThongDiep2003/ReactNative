import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ref, update, onValue } from 'firebase/database';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EditTransaction = ({ route, navigation }) => {
  const { transaction } = route.params; // Nhận tham số từ Transaction

  const [date, setDate] = useState(transaction.date);
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(transaction.amount);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);

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

  // Hàm cập nhật giao dịch vào Firebase
  const handleUpdateTransaction = async () => {
    try {
      if (!date || !title || !amount) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const transactionRef = ref(FIREBASE_DB, 'transactions/' + transaction.id);
      await update(transactionRef, {
        date,
        title,
        amount,
        category: selectedCategory,
      });

      Alert.alert('Success', 'Transaction updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Transaction</Text>

      {/* Hiển thị danh mục đã chọn */}
      <Text style={styles.label}>Selected Category:</Text>
      <View style={styles.categoryContainer}>
        {selectedCategory && (
          <Icon name={selectedCategory.icon} size={40} color="#6200ee" />
        )}
      </View>

      {/* Danh sách danh mục */}
      <Text style={styles.label}>Choose Category:</Text>
      <View style={styles.categoryList}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat)}>
            <Icon name={cat.icon} size={40} color="gray" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Nút lưu thay đổi */}
      <TouchableOpacity style={styles.button} onPress={handleUpdateTransaction}>
        <Text style={styles.buttonText}>Save Changes</Text>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default EditTransaction;
