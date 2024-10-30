import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ref, remove } from 'firebase/database';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig';
import { Chip, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Transaction = ({ route, navigation }) => {
  const { transaction } = route.params;

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

  const handleEditTransaction = () => {
    navigation.navigate('EditTransaction', { transaction });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageHeader}>Transaction Details</Text>

      {/* Type Selection */}
      <View style={styles.headerContainer}>
        <Text style={[styles.header, transaction.type === 'Income' ? styles.activeTab : styles.inactiveTab]}>Income</Text>
        <Text style={[styles.header, transaction.type === 'Expense' ? styles.activeTab : styles.inactiveTab]}>Expense</Text>
      </View>

      {/* Amount Display */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>{transaction.amount} VND</Text>
      </View>

      {/* Date Display */}
      <TouchableOpacity style={styles.datePicker}>
        <Icon name="calendar" size={24} color="#6246EA" />
        <Text style={styles.dateText}>{new Date(transaction.date).toLocaleDateString()}</Text>
      </TouchableOpacity>

      {/* Category Display */}
      {transaction.category && (
        <View style={styles.detailContainer}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryContainer}>
            <Icon name={transaction.category.icon} size={30} color="#6246EA" style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{transaction.category.name}</Text>
          </View>
        </View>
      )}

      {/* Account Display */}
      <Text style={styles.sectionTitle}>Account</Text>
      <Chip mode="outlined" style={styles.accountChip}>{transaction.account}</Chip>

      {/* Buttons for Edit and Delete */}
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
  pageHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  activeTab: {
    color: '#6246EA',
    borderBottomColor: '#6246EA',
  },
  inactiveTab: {
    color: 'gray',
    borderBottomColor: 'transparent',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  amountText: {
    fontSize: 24,
    color: '#FF5722',
    fontWeight: 'bold',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e0f7fa',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#6246EA',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    marginBottom: 20,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 18,
    color: '#6246EA',
    fontWeight: 'bold',
  },
  accountChip: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 30,
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
