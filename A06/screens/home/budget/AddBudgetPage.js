import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AddBudgetPage = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('tshirt-crew-outline'); // Default icon
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);

  const parentCategories = ['Giao lưu', 'Tiết kiệm', 'Du lịch', 'Trả nợ', 'Khám bệnh'];

  const handleIconChange = () => {
    navigation.navigate('CategorySelection', {
      onIconSelected: (icon) => setSelectedIcon(icon),
    });
  };

  const handleSubmit = () => {
    if (!categoryName || !selectedParentCategory) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Handle submission logic here
    console.log('Category Submitted:', {
      name: categoryName,
      icon: selectedIcon,
      parentCategory: selectedParentCategory,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Icon Section */}
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleIconChange}>
          <View style={styles.iconCircle}>
            <Icon name={selectedIcon} size={50} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changeIconText}>Đổi biểu tượng</Text>
      </View>

      {/* Input Fields */}
      <Text style={styles.label}>Tên danh mục (0/30) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên"
        maxLength={30}
        value={categoryName}
        onChangeText={(text) => setCategoryName(text)}
      />
      {/* Confirm Button */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!categoryName || !selectedParentCategory) && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={!categoryName || !selectedParentCategory}
      >
        <Text style={styles.confirmButtonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7d4e4',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f39cc3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIconText: {
    color: '#f39cc3',
    fontSize: 14,
    marginTop: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  selectedChip: {
    backgroundColor: '#f39cc3',
    borderColor: '#f39cc3',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedChipText: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#f39cc3',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  confirmButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddBudgetPage;
