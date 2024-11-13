import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../auths/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { LineChart } from 'react-native-chart-kit';
import { PieChart } from 'react-native-svg-charts';
import { G, Text as SVGText, Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';


const screenWidth = Dimensions.get('window').width;

const iconList = [
  { name: 'car', color: '#f44336' },
  { name: 'food', color: '#e91e63' },
  { name: 'gift', color: '#9c27b0' },
  { name: 'home', color: '#673ab7' },
  { name: 'wallet', color: '#3f51b5' },
  { name: 'medical-bag', color: '#2196f3' },
  { name: 'truck-fast', color: '#03a9f4' },
  { name: 'gamepad-variant', color: '#00bcd4' },
  { name: 'bank', color: '#009688' },
  { name: 'shopping-outline', color: '#4caf50' },
  { name: 'cash', color: '#ff9800' },
  { name: 'airplane', color: '#ff5722' },
  { name: 'basketball', color: '#795548' },
  { name: 'bed', color: '#607d8b' },
  { name: 'bike', color: '#8bc34a' },
  { name: 'book-open-page-variant', color: '#ffc107' },
  { name: 'camera', color: '#9e9e9e' },
  { name: 'cat', color: '#ff5722' },
  { name: 'chair-rolling', color: '#3f51b5' },
  { name: 'chart-line', color: '#ff4081' },
  { name: 'cellphone', color: '#4caf50' },
  { name: 'city', color: '#673ab7' },
  { name: 'coffee', color: '#795548' },
  { name: 'dog', color: '#ff9800' },
  { name: 'dumbbell', color: '#9c27b0' },
  { name: 'emoticon-happy-outline', color: '#2196f3' },
  { name: 'factory', color: '#00bcd4' },
  { name: 'file-document', color: '#8bc34a' },
  { name: 'flower', color: '#e91e63' },
  { name: 'fridge-outline', color: '#3f51b5' },
  { name: 'guitar-electric', color: '#673ab7' },
  { name: 'headphones', color: '#607d8b' },
  { name: 'hospital-building', color: '#ff4081' },
  { name: 'human-male-female', color: '#03a9f4' },
  { name: 'key-variant', color: '#795548' },
  { name: 'laptop', color: '#ff9800' },
  { name: 'leaf', color: '#4caf50' },
];

const StatisticPage = ({ navigation }) => {
  const [dailyTransactionData, setDailyTransactionData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (currentUser) {
      const transactionsRef = ref(
        FIREBASE_DB,
        `users/${currentUser.uid}/transactions`,
      );
      onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        const dailyData = {};
        const categoryData = {};

        if (data) {
          Object.values(data).forEach((transaction) => {
            const dateObj = new Date(transaction.date);
            const dateKey = dateObj.toISOString().split('T')[0];

            // Nhóm giao dịch theo ngày
            if (!dailyData[dateKey]) {
              dailyData[dateKey] = [];
            }
            dailyData[dateKey].push(transaction);

            // Tính tổng số tiền theo danh mục
            if (transaction.category && transaction.category.name) {
              if (!categoryData[transaction.category.name]) {
                categoryData[transaction.category.name] = {
                  total: 0,
                  icon: transaction.category.icon,
                };
              }
              const amount = parseFloat(transaction.amount);
              if (transaction.type === 'Expense') {
                categoryData[transaction.category.name].total -= amount;
              } else {
                categoryData[transaction.category.name].total += amount;
              }
            }
          });

          // Xử lý dữ liệu cho biểu đồ đường
          const dailyTransactionAmountLineData = Object.keys(dailyData)
            .sort()
            .map((dateKey) => {
              const transactions = dailyData[dateKey];
              let incoming = 0;
              let outgoing = 0;

              transactions.forEach((transaction) => {
                const amount = parseFloat(transaction.amount);
                if (transaction.type === 'Expense') {
                  outgoing += amount;
                } else {
                  incoming += amount;
                }
              });

              return {
                day: dateKey,
                incoming,
                outgoing,
              };
            });

          setDailyTransactionData(dailyTransactionAmountLineData);

          // Xử lý dữ liệu danh mục
          const categoriesArray = Object.keys(categoryData)
            .map((categoryName) => ({
              category: categoryName,
              total: categoryData[categoryName].total,
              icon: categoryData[categoryName].icon,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10); // Chỉ lấy tối đa 10 danh mục

          setCategories(categoriesArray);
        }
      });
    }
  }, []);

  const onDateChange = (date) => {
    setSelectedDate(date);
    const dateKey = date.toISOString().split('T')[0];
    const filteredData = dailyTransactionData.find((d) => d.day === dateKey);
    if (filteredData) {
      setFilteredTransactions(filteredData);
    } else {
      setFilteredTransactions([]);
    }
  };
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        {/* Header */}

  
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={{ paddingBottom: 80 }} // Add extra padding to prevent overlapping
        >
          {/* Calendar Picker */}
          <CalendarPicker
            onDateChange={onDateChange}
            selectedDayColor="#4caf50"
            todayBackgroundColor="#ffffff"
            textStyle={{
              color: '#000',
            }}
          />
  
          {/* Daily Summary */}
          {selectedDate && filteredTransactions && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>
                Tổng quan ngày {selectedDate.toISOString().split('T')[0]}
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.incomeText}>
                  Thu nhập: {filteredTransactions.incoming?.toLocaleString()} VND
                </Text>
                <Text style={styles.expenseText}>
                  Chi tiêu: {filteredTransactions.outgoing?.toLocaleString()} VND
                </Text>
                <Text style={styles.totalText}>
                  Tổng: {(
                    (filteredTransactions.incoming || 0) -
                    (filteredTransactions.outgoing || 0)
                  ).toLocaleString()}{' '}
                  VND
                </Text>
              </View>
            </View>
          )}
  
          {/* Income Chart */}
          {dailyTransactionData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Thu nhập</Text>
              <LineChart
                data={{
                  labels: dailyTransactionData.map((d) => d.day),
                  datasets: [
                    {
                      data: dailyTransactionData.map((d) => d.incoming),
                      color: () => '#4caf50',
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  formatYLabel: (value) => parseInt(value).toLocaleString(),
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                  },
                }}
                yAxisLabel=""
                fromZero={true}
                bezier
              />
            </View>
          )}
  
          {/* Expense Chart */}
          {dailyTransactionData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Chi tiêu</Text>
              <LineChart
                data={{
                  labels: dailyTransactionData.map((d) => d.day),
                  datasets: [
                    {
                      data: dailyTransactionData.map((d) => d.outgoing),
                      color: () => '#f44336',
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  formatYLabel: (value) => parseInt(value).toLocaleString(),
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '3',
                    strokeWidth: '1',
                    stroke: '#ffa726',
                  },
                }}
                yAxisLabel=""
                fromZero={true}
                bezier
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 16,
      paddingHorizontal: 16,
      backgroundColor: '#f5f5f5',
    },
    headerLeftAction: {
      marginRight: 16,
    },
    backText: {
      fontSize: 24,
      color: '#333',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    contentScroll: {
      padding: 16,
    },
    chartContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#333',
      textAlign: 'center',
    },
    summaryContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#333',
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    incomeText: {
      color: '#4caf50',
      fontSize: 16,
      fontWeight: 'bold',
    },
    expenseText: {
      color: '#f44336',
      fontSize: 16,
      fontWeight: 'bold',
    },
    totalText: {
      color: '#333',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  
  export default StatisticPage;
  
