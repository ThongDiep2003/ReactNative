import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FIREBASE_DB, FIREBASE_STORAGE } from './FirebaseConfig'; // Firebase config
import { ref, set } from 'firebase/database';
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage'; // Firebase storage

const HomeContent = ({ navigation }) => {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState(''); // Thông tin chi tiết mới thêm
  const [type, setType] = useState('Expense'); // Default type
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false); // To show loading indicator during upload

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access gallery is required!');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.canceled) {
        setImage(pickerResult.assets[0].uri); // Lấy URI của ảnh được chọn
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  // Hàm upload ảnh lên Firebase Storage
  const uploadImageToFirebase = async (uri) => {
    try {
      setUploading(true); // Bắt đầu tải lên
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const imageRef = storageRef(storage, `images/${Date.now()}.jpg`);

      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false); // Kết thúc tải lên
    }
  };

  // Hàm lưu giao dịch vào Firebase Realtime Database
  const handleSaveTransaction = async () => {
    try {
      if (!date || !title || !amount || !details || !image) {
        Alert.alert('Error', 'Please fill all the fields and select an image');
        return;
      }

      const imageUrl = await uploadImageToFirebase(image);

      if (!imageUrl) {
        Alert.alert('Error', 'Failed to upload image');
        return;
      }

      const transactionId = Date.now().toString();

      const transactionRef = ref(FIREBASE_DB, 'transactions/' + transactionId);
      await set(transactionRef, {
        date,
        title,
        amount,
        details,  // Lưu thêm trường thông tin chi tiết
        type,
        image: imageUrl, // Lưu URL của ảnh
      });

      Alert.alert('Success', 'Transaction saved successfully');
      setDate('');
      setTitle('');
      setAmount('');
      setDetails(''); // Reset trường thông tin chi tiết
      setType('Expense');
      setImage(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Transaction</Text>
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Details" // Trường nhập mới cho thông tin chi tiết
        value={details}
        onChangeText={setDetails}
      />
      <TextInput
        style={styles.input}
        placeholder="Type (Expense/Income)"
        value={type}
        onChangeText={setType}
      />

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.button} onPress={handleSaveTransaction}>
        <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Save Transaction'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#0163d2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
});

export default HomeContent;
