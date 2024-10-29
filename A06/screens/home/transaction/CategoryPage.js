import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'tailwind-react-native-classnames';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig'; // Import Firebase configuration
import { ref, set } from 'firebase/database'; // Import methods from Firebase

// List of available icons
const iconList = [
  'car', 'food', 'gift', 'home', 'wallet', 'medical-bag', 'truck-fast', 'gamepad-variant', 'bank', 'shopping-outline'
];

const CategoryPage = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);

  const handleAddCategory = () => {
    if (categoryName && selectedIcon) {
      const categoryId = Date.now().toString(); // Generate ID for category
      const categoryRef = ref(FIREBASE_DB, `categories/${categoryId}`);

      // Save category to Firebase Realtime Database
      set(categoryRef, {
        name: categoryName,
        icon: selectedIcon,
      })
        .then(() => {
          alert(`Category "${categoryName}" added with icon "${selectedIcon}"`);
          // Reset fields after adding
          setCategoryName('');
          setSelectedIcon(null);
          navigation.goBack();  // Navigate back to AddTransaction after adding category
        })
        .catch((error) => {
          console.error("Error adding category: ", error);
          alert("Error adding category. Please try again.");
        });
    } else {
      alert("Please enter a category name and select an icon.");
    }
  };

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <Text style={tw`text-2xl font-bold text-center mb-5`}>Create New Category</Text>

      {/* Input for Category Name */}
      <TextInput
        style={tw`border rounded-lg p-3 mb-5 bg-gray-100`}
        placeholder="Enter Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
      />

      {/* Icon Selection */}
      <Text style={tw`text-lg font-bold mb-3`}>Choose an Icon</Text>
      <FlatList
        data={iconList}
        keyExtractor={(item) => item}
        numColumns={5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.iconButton,
              selectedIcon === item && styles.selectedIcon,
            ]}
            onPress={() => setSelectedIcon(item)}
          >
            <Icon name={item} size={30} color={selectedIcon === item ? "#ffffff" : "#555"} />
          </TouchableOpacity>
        )}
      />

      {/* Add Category Button */}
      <TouchableOpacity
        style={tw`mt-10 bg-purple-500 p-4 rounded-full flex-row justify-center items-center`}
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
});

export default CategoryPage;
