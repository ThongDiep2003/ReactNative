import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../auths/FirebaseConfig"; // Ensure correct Firebase config is imported
import { ref, update, onValue } from "firebase/database";

const EditBudgetPage = ({ navigation, route }) => {
  const { budgetId } = route.params || {}; // Safely extract budgetId
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "User not authenticated.");
      navigation.goBack();
      return;
    }

    if (!budgetId) {
      Alert.alert("Error", "Budget ID is missing.");
      navigation.goBack();
      return;
    }

    const budgetRef = ref(FIREBASE_DB, `users/${currentUser.uid}/budgets/${budgetId}`);

    // Fetch budget data
    onValue(budgetRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBudgetName(data.name || "");
        setBudgetAmount(data.amount?.toString() || "0");
        setLoading(false);
      } else {
        Alert.alert("Error", "Budget not found.");
        navigation.goBack();
      }
    });
  }, [budgetId, navigation]);

  const handleSave = async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const budgetRef = ref(FIREBASE_DB, `users/${currentUser.uid}/budgets/${budgetId}`);
    try {
      await update(budgetRef, {
        name: budgetName,
        amount: parseFloat(budgetAmount),
      });
      Alert.alert("Success", "Budget updated successfully.");
      navigation.pop(2); // Go back to the previous page (BudgetPage)
    } catch (error) {
      Alert.alert("Error", "Failed to update budget.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Budget</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Name</Text>
        <TextInput
          style={styles.input}
          value={budgetName}
          onChangeText={setBudgetName}
          placeholder="Enter budget name"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Amount</Text>
        <TextInput
          style={styles.input}
          value={budgetAmount}
          onChangeText={setBudgetAmount}
          placeholder="Enter budget amount"
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditBudgetPage;
