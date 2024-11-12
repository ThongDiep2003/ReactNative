import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../auths/FirebaseConfig';
import { ref, onValue, remove } from 'firebase/database';
import moment from 'moment';
import { PieChart } from 'react-native-svg-charts';
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

  const DonutChart = ({ spent, total }) => {
    const remaining = Math.max(0, total - spent);
    const data = [
      { key: 1, value: spent, svg: { fill: '#FF6347' } }, // Spent in red
      { key: 2, value: remaining, svg: { fill: '#4CAF50' } }, // Remaining in green
    ];

    return (
      <PieChart
        style={styles.donutChart}
        valueAccessor={({ item }) => item.value}
        data={data}
        innerRadius="70%"
        outerRadius="100%"
      />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Date and Add Budget */}
      <View style={styles.dateAddContainer}>
        <View>
          <Text style={styles.dateText}>Tháng {moment().format('MMMM YYYY')}</Text>
          <Text style={styles.daysLeftText}>Còn {daysLeft} ngày nữa hết tháng</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddBudget')} style={styles.addButton}>
          <Icon name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Budgets */}
      <Text style={styles.sectionTitle}>Budgets</Text>
      <View style={styles.categoryList}>
        {categories.map((cat) => {
          const spent = cat.expense || 0;
          const total = cat.amount || 0;

          return (
            <View key={cat.id} style={styles.budgetCard}>
              <View style={styles.budgetHeader}>
                <View style={styles.donutWrapper}>
                  <DonutChart spent={spent} total={total} />
                  <Icon name={cat.icon || 'wallet'} size={24} color="#fff" style={styles.budgetIcon} />
                </View>
                <View style={styles.budgetInfo}>
                  <Text style={styles.budgetName}>{cat.name}</Text>
                  <Text style={styles.budgetDetails}>
                    Chi {spent.toLocaleString()}đ / {total.toLocaleString()}đ
                  </Text>
                </View>
              </View>
              <View style={styles.budgetActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(cat.id)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(cat.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  },
  donutWrapper: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  donutChart: {
    width: 50,
    height: 50,
    position: 'absolute',
  },
  budgetIcon: {
    position: 'absolute',
    top: 13,
    left: 13,
  },
  budgetInfo: {
    flex: 1,
    marginLeft: 10,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetDetails: {
    fontSize: 14,
    color: '#999',
  },
  budgetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    paddingHorizontal: 10,
  },
  deleteButton: {
    paddingHorizontal: 10,
  },
  editText: {
    color: '#6200ee',
  },
  deleteText: {
    color: '#ff4d4d',
  },
});

export default BudgetPage;
