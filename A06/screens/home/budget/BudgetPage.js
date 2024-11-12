import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue, remove } from 'firebase/database';
import moment from 'moment';
import { PieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  const handleEdit = (categoryId) => {
    navigation.navigate('EditBudget', { budgetId: categoryId });
  };

  const handleDelete = async (categoryId) => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) {
      alert('User not authenticated.');
      return;
    }

    const budgetRef = ref(FIREBASE_DB, `users/${currentUser.uid}/budgets/${categoryId}`);
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(budgetRef);
              alert('Budget deleted successfully.');
            } catch (error) {
              console.error('Error deleting budget:', error);
              alert('Failed to delete budget.');
            }
          },
        },
      ]
    );
  };

  // Separate "Monthly Total Budget"
  const totalBudget = categories.find((cat) => cat.name === 'Monthly Total Budget');
  const otherCategories = categories.filter((cat) => cat.name !== 'Monthly Total Budget');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.tabText}>Personal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Household</Text>
        </TouchableOpacity>
      </View>

      {/* Date and Add Budget */}
      <View style={styles.dateAddContainer}>
        <View style={styles.dateInfoContainer}>
          <Text style={styles.dateText}>Tháng {moment().format('MMMM YYYY')}</Text>
          <Text style={styles.daysLeftText}>Còn {daysLeft} ngày nữa hết tháng</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddBudget')}>
          <Text style={styles.addBudgetText}>+ Thêm ngân sách</Text>
        </TouchableOpacity>
      </View>

      {/* Total Budget */}
      {totalBudget && (
        <View style={styles.totalBudgetContainer}>
          <View style={styles.categoryItem}>
            <View style={styles.categoryInfoContainer}>
              <Icon name={totalBudget.icon || 'wallet'} size={30} color="gray" style={styles.categoryIcon} />
              <Text style={styles.categoryName}>{totalBudget.name}</Text>
            </View>
            <Text>Amount: {(totalBudget.amount || 0).toLocaleString()} VND</Text>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => handleEdit(totalBudget.id)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(totalBudget.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Other Categories */}
      <View style={styles.categoryListContainer}>
        {otherCategories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <View style={styles.categoryInfoContainer}>
              <Icon name={cat.icon || 'wallet'} size={30} color="gray" style={styles.categoryIcon} />
              <Text>{cat.name}</Text>
            </View>
            <Text>Amount: {(cat.amount || 0).toLocaleString()} VND</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={() => handleEdit(cat.id)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(cat.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
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
  totalBudgetContainer: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  categoryListContainer: {
    marginVertical: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editText: {
    color: '#6200ee',
    fontSize: 14,
    marginRight: 10,
  },
  deleteText: {
    color: '#ff4d4d',
    fontSize: 14,
  },
});

export default BudgetPage;
