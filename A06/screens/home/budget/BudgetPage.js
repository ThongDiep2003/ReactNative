import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, Chip, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import moment from 'moment';

const BudgetPage = ({ navigation }) => {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedSubTab, setSelectedSubTab] = useState('Budget');
  const [daysLeft, setDaysLeft] = useState(0);
  const [today, setToday] = useState('');

  useEffect(() => {
    // Lấy dữ liệu tổng ngân sách và tổng chi tiêu từ Firebase
    const budgetRef = ref(FIREBASE_DB, 'budget');
    onValue(budgetRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTotalBudget(data.totalBudget || 0);
        setTotalExpense(data.totalExpense || 0);
      }
    });

    // Lấy danh sách các danh mục chi tiêu
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

    // Tính số ngày còn lại và ngày hôm nay
    const todayDate = moment().format('MMMM Do YYYY');
    setToday(todayDate);
    const endOfMonth = moment().endOf('month');
    setDaysLeft(endOfMonth.diff(moment(), 'days'));

    // Reset ngân sách vào cuối tháng
    if (moment().date() === endOfMonth.date()) {
      update(budgetRef, { totalBudget: 0, totalExpense: 0 });
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budget</Text>

      {/* Tabs for Personal and Household Budgets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.tabText}>Personal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Household</Text>
        </TouchableOpacity>
      </View>

      {/* Date and Add Budget Section */}
      <View style={styles.dateAddContainer}>
        <View style={styles.dateInfoContainer}>
          <Text style={styles.dateText}>Tháng {moment().format('MMMM YYYY')}</Text>
          <Text style={styles.daysLeftText}>Còn {daysLeft} ngày nữa hết tháng</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddBudget')}>
          <Text style={styles.addBudgetText}>+ Thêm ngân sách</Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs for Budgets and Goals */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity
          onPress={() => setSelectedSubTab('Budget')}
          style={[styles.subTab, selectedSubTab === 'Budget' && styles.activeSubTab]}
        >
          <Text style={[styles.subTabText, selectedSubTab === 'Budget' && styles.activeSubTabText]}>Budgets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedSubTab('Goal')}
          style={[styles.subTab, selectedSubTab === 'Goal' && styles.activeSubTab]}
        >
          <Text style={[styles.subTabText, selectedSubTab === 'Goal' && styles.activeSubTabText]}>Goals</Text>
        </TouchableOpacity>
      </View>

      {/* Total Budget Section */}
      {selectedSubTab === 'Budget' && (
        <View style={styles.budgetContainer}>
          <Text style={styles.sectionTitle}>Total budget</Text>
          <View style={styles.budgetCircle}>
            <Text style={styles.budgetRemain}>Remain</Text>
            <Text style={styles.budgetValue}>{(totalBudget - totalExpense).toLocaleString()} VND</Text>
          </View>
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

      {/* Goals Section */}
      {selectedSubTab === 'Goal' && (
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <Text style={styles.goalText}>You currently have no goals set. Start by adding a new goal!</Text>
        </View>
      )}

      {/* Category Details */}
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

      {/* Edit Budget Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Do you want to edit budget? Edit</Text>
      </TouchableOpacity>
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
  subTabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 5,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  subTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  activeSubTab: {
    backgroundColor: '#6200ee',
  },
  subTabText: {
    fontSize: 16,
    color: '#333',
  },
  activeSubTabText: {
    color: '#fff',
  },
  budgetContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetRemain: {
    fontSize: 16,
    color: 'gray',
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: 'bold',
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
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#6200ee',
  },
});

export default BudgetPage;