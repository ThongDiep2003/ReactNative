import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import moment from 'moment';
import { PieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BudgetPage = ({ navigation }) => {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedSubTab, setSelectedSubTab] = useState('Budget');
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const budgetRef = ref(FIREBASE_DB, 'budget');
    onValue(budgetRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTotalBudget(data.totalBudget || 0);
        setTotalExpense(data.totalExpense || 0);
      }
    });

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

    const endOfMonth = moment().endOf('month');
    setDaysLeft(endOfMonth.diff(moment(), 'days'));

    if (moment().date() === endOfMonth.date()) {
      update(budgetRef, { totalBudget: 0, totalExpense: 0 });
    }
  }, []);

  // Data for Pie Chart
  const pieData = [
    {
      key: 1,
      value: totalExpense,
      svg: { fill: '#FF6347' },
      label: 'Expense',
    },
    {
      key: 2,
      value: totalBudget - totalExpense,
      svg: { fill: '#4CAF50' },
      label: 'Remaining',
    },
  ].filter((data) => data.value > 0);

  // Render function for Pie Chart Labels
  const Labels = ({ slices }) => {
    return slices.map((slice, index) => {
      const { pieCentroid, data } = slice;
      return (
        <SvgText
          key={index}
          x={pieCentroid[0]}
          y={pieCentroid[1]}
          fill="white"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={16}
          stroke="black"
          strokeWidth={0.2}
        >
          {data.label}
        </SvgText>
      );
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.tabText}>Personal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Household</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateAddContainer}>
        <View style={styles.dateInfoContainer}>
          <Text style={styles.dateText}>Tháng {moment().format('MMMM YYYY')}</Text>
          <Text style={styles.daysLeftText}>Còn {daysLeft} ngày nữa hết tháng</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddBudget')}>
          <Text style={styles.addBudgetText}>+ Thêm ngân sách</Text>
        </TouchableOpacity>
      </View>

      {selectedSubTab === 'Budget' && (
        <View style={styles.budgetContainer}>
          <Text style={styles.sectionTitle}>Total budget</Text>
          <PieChart
            style={{ height: 200 }}
            valueAccessor={({ item }) => item.value}
            data={pieData}
            outerRadius="95%"
          >
            <Labels />
          </PieChart>
          <View style={styles.budgetDetailContainer}>
            <View style={styles.budgetDetailItem}>
              <Text>Expense</Text>
              <Text>{totalExpense.toLocaleString()} VND</Text>
            </View>
            <View style={styles.budgetDetailItem}>
              <Text>Budget</Text>
              <Text>{totalBudget.toLocaleString()} VND</Text>
            </View>
          </View>
        </View>
      )}

      {selectedSubTab === 'Goal' && (
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <Text style={styles.goalText}>You currently have no goals set. Start by adding a new goal!</Text>
        </View>
      )}

      <View style={styles.categoryListContainer}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <View style={styles.categoryInfoContainer}>
              <Icon name={cat.icon} size={30} color="gray" style={styles.categoryIcon} />
              <Text>{cat.name}</Text>
            </View>
            <Text>Expense: {totalExpense.toLocaleString()} VND</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Do you want to edit budget? Edit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  dateInfoContainer: {
    flexDirection: 'column',
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
  addBudgetText: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  budgetContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  budgetDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  goalsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  goalText: {
    fontSize: 16,
    color: 'gray',
  },
  categoryListContainer: {
    marginVertical: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
  },
  categoryInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 10,
  },
  editButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#6200ee',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default BudgetPage;
