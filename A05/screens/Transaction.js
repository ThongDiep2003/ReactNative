import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Transaction = ({ route }) => {
  const { transaction } = route.params; // Nhận tham số từ HomePage

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction Details</Text>
      <Text style={styles.detail}>Date: {transaction.date}</Text>
      <Text style={styles.detail}>Title: {transaction.title}</Text>
      <Text style={styles.detail}>Amount: {transaction.amount}</Text>
      <Text style={styles.detail}>Type: {transaction.type}</Text>
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
});

export default Transaction;
