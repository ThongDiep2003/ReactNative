import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'tailwind-react-native-classnames';
import { FIREBASE_DB } from '../../../auths/FirebaseConfig';
import { ref, set } from 'firebase/database';
import { Modalize } from 'react-native-modalize';

// List of available icons with fixed colors
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

const CategoryBottomSheet = ({ isVisible, onClose, onAddCategory }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const modalizeRef = useRef(null);

  const handleAddCategory = () => {
    if (categoryName && selectedIcon) {
      const categoryId = Date.now().toString();
      const categoryRef = ref(FIREBASE_DB, `categories/${categoryId}`);

      // Save category to Firebase Realtime Database
      set(categoryRef, {
        name: categoryName,
        icon: selectedIcon,
      })
        .then(() => {
          alert(`Category "${categoryName}" added with icon "${selectedIcon.name}"`);
          setCategoryName('');
          setSelectedIcon(null);
          modalizeRef.current?.close();
          onAddCategory(categoryName);;
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
    <Modalize ref={modalizeRef} adjustToContentHeight={true} onClosed={onClose}>
      <View style={tw`p-5 bg-white`}>
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
              <Icon name={item.name} size={30} color={selectedIcon === item ? "#ffffff" : item.color} />
            </TouchableOpacity>
          )}
        />

        {/* Add Category Button */}
        <TouchableOpacity
          style={[
            tw`mt-10 p-4 rounded-full flex-row justify-center items-center`,
            { backgroundColor: '#6246EA' } // Thay đổi mã màu tại đây
          ]}
          onPress={handleAddCategory}
        >
          <Text style={tw`text-white text-lg font-bold`}>Add Category</Text>
        </TouchableOpacity>
      </View>
    </Modalize>
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

export default CategoryBottomSheet;
