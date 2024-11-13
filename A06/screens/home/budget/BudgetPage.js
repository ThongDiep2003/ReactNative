import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import moment from 'moment';
import { PieChart } from 'react-native-svg-charts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define category icon colors
const categoryColors = {
  car: '#f44336',
  food: '#e91e63',
  home: '#673ab7',
  'medical-bag': '#2196f3',
  'truck-fast': '#03a9f4',
  'shopping-outline': '#4caf50',
  airplane: '#ff5722',
  basketball: '#795548',
  bed: '#607d8b',
  bike: '#8bc34a',
  camera: '#9e9e9e',
  cat: '#ff5722',
  coffee: '#795548',
  dog: '#ff9800',
  dumbbell: '#9c27b0',
  factory: '#00bcd4',
  flower: '#e91e63',
  'fridge-outline': '#3f51b5',
  'guitar-electric': '#673ab7',
  headphones: '#607d8b',
  'hospital-building': '#ff4081',
  'human-male-female': '#03a9f4',
  'key-variant': '#795548',
  gift: '#9c27b0',
  wallet: '#3f51b5',
  bank: '#009688',
  cash: '#ff9800',
  'chart-line': '#ff4081',
  'file-document': '#8bc34a',
  'emoticon-happy-outline': '#2196f3',
  laptop: '#ff9800',
  leaf: '#4caf50',
};

const BudgetPage = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) {
      alert('User not authenticated.');
      return;
    }

    // Fetch budgets
    const budgetsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/budgets`);
    onValue(budgetsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoryList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCategories(categoryList);
      } else {
        setCategories([]);
      }
    });

    // Calculate days left in the month
    const endOfMonth = moment().endOf('month');
    setDaysLeft(endOfMonth.diff(moment(), 'days'));
  }, []);

  const DonutChart = ({ spent, remaining }) => {
    const data = [
      { key: 1, value: spent, svg: { fill: '#FF6347' } },
      { key: 2, value: remaining, svg: { fill: '#4CAF50' } },
    ].filter((item) => item.value > 0);

    return (
      <PieChart
        style={styles.donutChart}
        valueAccessor={({ item }) => item.value}
        data={data}
        innerRadius="70%"
        outerRadius="90%"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic">
        {/* Date and Add Budget */}
        <View style={styles.dateAddContainer}>
          <View>
            <Text style={styles.dateText}>Tháng {moment().format('MMMM YYYY')}</Text>
            <Text style={styles.daysLeftText}>Còn {daysLeft} ngày nữa hết tháng</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddBudget')}
            style={styles.addButton}>
            <Icon name="plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Budgets */}
        <Text style={styles.sectionTitle}>Budgets</Text>
        <View style={styles.categoryList}>
          {categories.map((cat) => {
            const spent = cat.expense || 0;
            const remaining = (cat.amount || 0) - spent;

            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.budgetCard}
                onPress={() => navigation.navigate('EditBudget', { budgetId: cat.id })}>
                <View style={styles.budgetHeader}>
                  <Icon
                    name={cat.icon || 'wallet'}
                    size={30}
                    color={categoryColors[cat.icon] || '#4CAF50'} // Default color
                  />
                  <Text style={styles.budgetTitle}>{cat.name}</Text>
                </View>
                <DonutChart spent={spent} remaining={remaining} />
                <Text style={styles.budgetAmount}>
                  Còn lại {(remaining || 0).toLocaleString()} VND
                </Text>
                <Text style={styles.budgetSpent}>
                  Chi {(spent || 0).toLocaleString()} / {(cat.amount || 0).toLocaleString()} VND
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingTop: 16, // Adjust for safe area
  },
  dateAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  daysLeftText: {
    fontSize: 14,
    color: 'gray',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
    color: '#333',
  },
  categoryList: {
    padding: 20,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  budgetSpent: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  donutChart: {
    height: 100,
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default BudgetPage;
