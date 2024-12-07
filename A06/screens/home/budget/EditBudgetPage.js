import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Dimensions } from "react-native";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../auths/FirebaseConfig"; // Ensure correct Firebase config is imported
import { ref, update, onValue } from "firebase/database";
import * as scale from "d3-scale";
import { Line } from 'react-native-svg';
import { BarChart } from "react-native-gifted-charts";

const EditBudgetPage = ({ navigation, route }) => {
  const { budgetId } = route.params || {}; // Safely extract budgetId
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [spendingTrend, setSpendingTrend] = useState([]); // For spending trends
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
    const spendingTrendRef = ref(FIREBASE_DB, `users/${currentUser.uid}/spendingTrends/${budgetId}`);

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

    // Fetch spending trend data
    onValue(spendingTrendRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const trendData = Object.keys(data).map((key) => ({
          month: key,
          value: data[key],
        }));
        setSpendingTrend(trendData);
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
      navigation.pop(2); // Go back to the BudgetPage
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

  // Data for BarChart
  const spendingData = spendingTrend.map((item) => item.value);
  const spendingMonths = spendingTrend.map((item) => item.month);

  const ThresholdLine = ({ y, threshold }) => (
    <Line
      key={'threshold-line'}
      x1={'0%'}
      x2={'100%'}
      y1={y(threshold)}
      y2={y(threshold)}
      stroke={'red'}
      strokeWidth={2}
      strokeDasharray={[4, 4]}
    />
  );

  const renderChart = () => {
    // Chuẩn bị dữ liệu cho chart
    const barData = spendingTrend.map((item) => ({
      value: item.value,
      label: item.month,
      frontColor: '#6200ee',
      topLabelComponent: () => (
        <Text style={styles.barLabel}>
          ${item.value}
        </Text>
      ),
    }));


    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={barData}
          width={Dimensions.get('window').width - 60}
          height={250}
          barWidth={30}
          spacing={20}
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          yAxisTextStyle={{ color: 'gray' }}
          xAxisLabelTextStyle={{ color: 'gray', textAlign: 'center' }}
          noOfSections={5}
          maxValue={Math.max(...spendingTrend.map(item => item.value), parseFloat(budgetAmount)) * 1.2}
          // Thêm đường ngân sách
          dashWidth={2}
          dashGap={4}
          horizontalRulesStyle={{
            strokeDasharray: [4, 4],
          }}
          horizontalRulesAnimation={true}
          rulesColor="lightgray"
          rulesType="solid"
          showReferenceLine1
          referenceLine1Position={parseFloat(budgetAmount)}
          referenceLine1Config={{
            color: 'red',
            dashWidth: 2,
            dashGap: 3,
            width: 1,
          }}
        />

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#6200ee' }]} />
            <Text style={styles.legendText}>Monthly Spending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>Budget Limit</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Budget</Text>
      
      {/* Budget Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Name</Text>
        <TextInput
          style={styles.input}
          value={budgetName}
          onChangeText={setBudgetName}
          placeholder="Enter budget name"
        />
      </View>

      {/* Budget Amount Input */}
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

      {/* Spending Trends */}
      <Text style={styles.trendTitle}>Spending Trend</Text>
      {renderChart()}

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
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
  trendTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  chartContainer: {
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 5,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: 'gray',
  },
  barLabel: {
    color: 'gray',
    fontSize: 10,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});


export default EditBudgetPage;
