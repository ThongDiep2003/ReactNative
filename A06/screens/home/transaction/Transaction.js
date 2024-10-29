import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ref, remove } from 'firebase/database';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig';
import { Chip, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import MaterialCommunityIcons

const Transaction = ({ route, navigation }) => {
  const { transaction } = route.params;

  // Hàm xóa giao dịch khỏi Firebase
  const handleDeleteTransaction = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const transactionRef = ref(FIREBASE_DB, 'transactions/' + transaction.id);
              await remove(transactionRef);
              Alert.alert('Deleted', 'Transaction has been deleted successfully.');
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

  // Điều hướng đến màn hình chỉnh sửa giao dịch
  const handleEditTransaction = () => {
    navigation.navigate('EditTransaction', { transaction });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction Details</Text>

      {/* Hiển thị chi tiết giao dịch */}
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Date:</Text>
        <Text style={styles.detail}>{transaction.date}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Amount:</Text>
        <Text style={styles.detailAmount}>{transaction.amount} VND</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Account:</Text>
        <Chip mode="outlined" style={styles.chip}>
          {transaction.account}
        </Chip>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Type:</Text>
        <Chip mode="outlined" style={styles.chip}>
          {transaction.type}
        </Chip>
      </View>

      {/* Hiển thị danh mục nếu có */}
      {transaction.category && (
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>Category:</Text>
          <View style={styles.categoryContainer}>
            {/* Hiển thị icon của danh mục từ MaterialCommunityIcons */}
            <Icon name={transaction.category.icon} size={24} color="#333" style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{transaction.category.name}</Text>
          </View>
        </View>
      )}

      {/* Nút chỉnh sửa và xóa giao dịch */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          color="#4CAF50"
          onPress={handleEditTransaction}
          style={styles.button}
        >
          Edit Transaction
        </Button>
        <Button
          mode="contained"
          color="red"
          onPress={handleDeleteTransaction}
          style={styles.button}
        >
          Delete Transaction
        </Button>
      </View>
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
    textAlign: 'center',
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detail: {
    fontSize: 18,
    color: '#555',
  },
  detailAmount: {
    fontSize: 18,
    color: '#FF5722',
    fontWeight: 'bold',
  },
  chip: {
    backgroundColor: '#f1f1f1',
    marginLeft: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 18,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default Transaction;
