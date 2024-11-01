import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart, PieChart } from 'react-native-svg-charts';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../auths/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { G, Text as SVGText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const iconList = [
  { name: 'car', color: '#f44336' },
  { name: 'food', color: '#e91e63' },
  // Thêm các icon khác theo danh sách của bạn
];

const StatisticPage = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [selectedSlice, setSelectedSlice] = useState(null);

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      const transactionsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/transactions`);
      onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        const monthlyData = [];
        const expenseData = {};
        const incomeData = {};

        if (data) {
          Object.values(data).forEach(transaction => {
            const month = new Date(transaction.date).getMonth();
            if (!monthlyData[month]) monthlyData[month] = { expense: 0, income: 0 };

            if (transaction.type === 'Expense') {
              monthlyData[month].expense += parseFloat(transaction.amount);
              const icon = iconList.find(icon => icon.name === transaction.category.icon) || { color: '#6246EA' };
              if (expenseData[transaction.category.id]) {
                expenseData[transaction.category.id].amount += parseFloat(transaction.amount);
              } else {
                expenseData[transaction.category.id] = {
                  amount: parseFloat(transaction.amount),
                  color: icon.color,
                  name: transaction.category.name,
                  icon: icon.name,
                };
              }
            } else {
              monthlyData[month].income += parseFloat(transaction.amount);
              const icon = iconList.find(icon => icon.name === transaction.category.icon) || { color: '#6246EA' };
              if (incomeData[transaction.category.id]) {
                incomeData[transaction.category.id].amount += parseFloat(transaction.amount);
              } else {
                incomeData[transaction.category.id] = {
                  amount: parseFloat(transaction.amount),
                  color: icon.color,
                  name: transaction.category.name,
                  icon: icon.name,
                };
              }
            }
          });
          setMonthlyData(monthlyData);
          setExpenseCategories(Object.values(expenseData));
          setIncomeCategories(Object.values(incomeData));
        }
      });
    }
  }, []);

  const handleSlicePress = (category) => {
    setSelectedSlice(category === selectedSlice ? null : category);
  };

  const renderPieChart = (categories, title) => (
    <View style={styles.pieContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <PieChart
        style={styles.pieChart}
        data={categories.map(item => ({
          value: item.amount,
          svg: {
            fill: item.color,
            onPress: () => handleSlicePress(item),
          },
          key: item.name,
          arc: { outerRadius: item === selectedSlice ? '110%' : '100%', cornerRadius: 5 },
        }))}
        innerRadius="60%"
        outerRadius="100%"
        padAngle={0.02}
      >
        {selectedSlice && (
          <G x="50%" y="50%">
            <Icon name={selectedSlice.icon} size={24} color={selectedSlice.color} />
            <SVGText
              fill="black"
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="14"
              y={-30}
            >
              {selectedSlice.name}
            </SVGText>
            <SVGText
              fill="black"
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="12"
              y={0}
            >
              {selectedSlice.amount.toLocaleString()} VND
            </SVGText>
          </G>
        )}
      </PieChart>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Monthly Expense and Income</Text>
      <BarChart
        style={styles.barChart}
        data={monthlyData.map((item) => ({ value: item.expense, svg: { fill: '#f44336' } }))}
        yMin={0}
        yAccessor={({ item }) => item.value}
        spacingInner={0.3}
        gridMin={0}
        contentInset={{ top: 20, bottom: 20 }}
      />

      <View style={styles.rowContainer}>
        {renderPieChart(expenseCategories, 'Expense Distribution')}
        {renderPieChart(incomeCategories, 'Income Distribution')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  barChart: {
    height: 200,
    width: Dimensions.get('window').width - 32,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  pieContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pieChart: {
    height: 150,
    width: '100%',
  },
});

export default StatisticPage;
