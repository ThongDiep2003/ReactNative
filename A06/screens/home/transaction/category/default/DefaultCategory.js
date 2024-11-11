import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'tailwind-react-native-classnames';
import { FIREBASE_DB } from '../../../../../auths/FirebaseConfig'; // Firebase configuration
import { ref, set } from 'firebase/database'; // Firebase methods

// List of available icons categorized
const incomeIcons = [
  { name: 'gift', color: '#9c27b0' },
  { name: 'wallet', color: '#3f51b5' },
  { name: 'bank', color: '#009688' },
  { name: 'cash', color: '#ff9800' },
  { name: 'chart-line', color: '#ff4081' },
  { name: 'file-document', color: '#8bc34a' },
  { name: 'emoticon-happy-outline', color: '#2196f3' },
  { name: 'laptop', color: '#ff9800' },
  { name: 'leaf', color: '#4caf50' },
];

const expenseIcons = [
  { name: 'car', color: '#f44336' },
  { name: 'food', color: '#e91e63' },
  { name: 'home', color: '#673ab7' },
  { name: 'medical-bag', color: '#2196f3' },
  { name: 'truck-fast', color: '#03a9f4' },
  { name: 'shopping-outline', color: '#4caf50' },
  { name: 'airplane', color: '#ff5722' },
  { name: 'basketball', color: '#795548' },
  { name: 'bed', color: '#607d8b' },
  { name: 'bike', color: '#8bc34a' },
  { name: 'camera', color: '#9e9e9e' },
  { name: 'cat', color: '#ff5722' },
  { name: 'coffee', color: '#795548' },
  { name: 'dog', color: '#ff9800' },
  { name: 'dumbbell', color: '#9c27b0' },
  { name: 'factory', color: '#00bcd4' },
  { name: 'flower', color: '#e91e63' },
  { name: 'fridge-outline', color: '#3f51b5' },
  { name: 'guitar-electric', color: '#673ab7' },
  { name: 'headphones', color: '#607d8b' },
  { name: 'hospital-building', color: '#ff4081' },
  { name: 'human-male-female', color: '#03a9f4' },
  { name: 'key-variant', color: '#795548' },
];

const DefaultCategory = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [categoryType, setCategoryType] = useState('Expense'); // Default to Expense

  // Dynamically choose the icon list based on the selected category type
  const getIconList = () => (categoryType === 'Income' ? incomeIcons : expenseIcons);

  const handleAddCategory = () => {
    if (categoryName && selectedIcon) {
      const categoryId = Date.now().toString(); // Generate ID for category
      const categoryRef = ref(FIREBASE_DB, `categories/default/${categoryId}`);

      // Save category to Firebase Realtime Database
      set(categoryRef, {
        name: categoryName,
        icon: selectedIcon.name,
        type: categoryType, // Add type (Income or Expense)
      })
        .then(() => {
          alert(`Category "${categoryName}" added as "${categoryType}"`);
          // Reset fields after adding
          setCategoryName('');
          setSelectedIcon(null);
          setCategoryType('Expense'); // Reset to default type
          navigation.goBack(); // Navigate back after adding category
        })
        .catch((error) => {
          console.error('Error adding category:', error);
          alert('Error adding category. Please try again.');
        });
    } else {
      alert('Please enter a category name and select an icon.');
    }
  };

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <Text style={tw`text-2xl font-bold text-center mb-5`}>Create Default Category</Text>

      {/* Input for Category Name */}
      <TextInput
        style={tw`border rounded-lg p-3 mb-5 bg-gray-100`}
        placeholder="Enter Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
      />

      {/* Toggle for Category Type */}
      <View style={tw`flex-row justify-around mb-5`}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            categoryType === 'Income' && styles.selectedTypeButton,
          ]}
          onPress={() => setCategoryType('Income')}
        >
          <Text
            style={[
              styles.typeButtonText,
              categoryType === 'Income' && styles.selectedTypeButtonText,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            categoryType === 'Expense' && styles.selectedTypeButton,
          ]}
          onPress={() => setCategoryType('Expense')}
        >
          <Text
            style={[
              styles.typeButtonText,
              categoryType === 'Expense' && styles.selectedTypeButtonText,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Icon Selection */}
      <Text style={tw`text-lg font-bold mb-3`}>Choose an Icon</Text>
      <FlatList
        data={getIconList()} // Dynamically show icons based on selected type
        keyExtractor={(item) => item.name}
        numColumns={5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.iconButton,
              selectedIcon === item && styles.selectedIcon,
            ]}
            onPress={() => setSelectedIcon(item)}
          >
            <Icon
              name={item.name}
              size={30}
              color={selectedIcon === item ? '#ffffff' : item.color}
            />
          </TouchableOpacity>
        )}
      />

      {/* Add Category Button */}
      <TouchableOpacity
        style={[
          tw`mt-10 p-4 rounded-full flex-row justify-center items-center`,
          { backgroundColor: '#6246EA' },
        ]}
        onPress={handleAddCategory}
      >
        <Text style={tw`text-white text-lg font-bold`}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    backgroundColor: '#f0f0f0',
  },
  selectedIcon: {
    backgroundColor: '#6200ee',
  },
  typeButton: {
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  selectedTypeButton: {
    backgroundColor: '#6200ee',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#6200ee',
  },
  selectedTypeButtonText: {
    color: '#ffffff',
  },
});

export default DefaultCategory;
