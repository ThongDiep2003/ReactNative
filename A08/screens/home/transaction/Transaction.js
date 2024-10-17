import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { ref, remove, update } from 'firebase/database';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig'; // Import Firebase configuration

const Transaction = ({ route, navigation }) => {
  const { transaction } = route.params; // Nhận tham số từ HomePage

  // Hàm xóa giao dịch khỏi Firebase
  const handleDeleteTransaction = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              // Tạo tham chiếu đến giao dịch cần xóa
              const transactionRef = ref(FIREBASE_DB, 'transactions/' + transaction.id);

              // Xóa giao dịch khỏi Firebase Realtime Database
              await remove(transactionRef);

              // Hiển thị thông báo xóa thành công
              Alert.alert('Deleted', 'Transaction has been deleted successfully.');

              // Điều hướng quay lại màn hình trước đó
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Hàm điều hướng đến màn hình chỉnh sửa giao dịch
  const handleEditTransaction = () => {
    navigation.navigate('EditTransaction', { transaction });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction Details</Text>

      {/* Hiển thị các thông tin chi tiết của giao dịch */}
      <Text style={styles.detail}>Date: {transaction.date}</Text>
      <Text style={styles.detail}>Title: {transaction.title}</Text>
      <Text style={styles.detail}>Amount: {transaction.amount}</Text>
      <Text style={styles.detail}>Type: {transaction.type}</Text>
      <Text style={styles.detail}>Details: {transaction.details}</Text>

      {/* Hiển thị ảnh */}
      {transaction.image && (
        <Image
          source={{ uri: transaction.image }}
          style={styles.image}
        />
      )}

      {/* Nút Xóa giao dịch */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTransaction}>
        <Text style={styles.deleteButtonText}>Delete Transaction</Text>
      </TouchableOpacity>

      {/* Nút Chỉnh sửa giao dịch */}
      <TouchableOpacity style={styles.editButton} onPress={handleEditTransaction}>
        <Text style={styles.editButtonText}>Edit Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    marginBottom: 10,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Transaction;
