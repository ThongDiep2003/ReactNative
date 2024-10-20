import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, set, get } from 'firebase/database';
import { encode } from 'base-64'; // Thư viện mã hóa base-64 để mã hóa email
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'; // Import các hàm Firestore

// Firebase configuration object
const FirebaseConfig = {
  apiKey: "AIzaSyDJALgnPVtwZMcBxJb5pOhDoNSClwpKL7s",
  authDomain: "flow-up-sandbox.firebaseapp.com",
  databaseURL: "https://flow-up-sandbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "flow-up-sandbox",
  storageBucket: "flow-up-sandbox.appspot.com",
  messagingSenderId: "801098229395",
  appId: "1:801098229395:web:49ea288669a26e489d8f66",
  measurementId: "G-JK5PFFG1KY"
};

// Initialize Firebase app
export const FIREBASE_APP = initializeApp(FirebaseConfig);

// Initialize Firebase Authentication with AsyncStorage for persistence
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);

// Initialize Realtime Database
export const FIREBASE_DB = getDatabase(FIREBASE_APP);

// Mã hóa email để sử dụng trong đường dẫn
const encodeEmail = (email) => {
  return email.replace(/\./g, ','); // Thay thế dấu chấm bằng dấu phẩy
};

// Function to store OTP in Realtime Database
export const storeOTP = async (email, otp) => {
  try {
    const encodedEmail = encodeEmail(email);
    const otpRef = ref(FIREBASE_DB, 'otp/' + encodedEmail);
    await set(otpRef, { otp: otp, timestamp: Date.now() }); // Store OTP and timestamp
    console.log('OTP stored successfully');
  } catch (error) {
    console.error('Error storing OTP in database:', error);
    throw new Error('Failed to store OTP. Please try again.');
  }
};

// Function to verify OTP from Realtime Database
export const verifyOTP = async (email, otp) => {
  try {
    const encodedEmail = encodeEmail(email);
    const otpRef = ref(FIREBASE_DB, 'otp/' + encodedEmail);
    const snapshot = await get(otpRef);
    if (snapshot.exists()) {
      const storedOTP = snapshot.val();
      const currentTime = Date.now();
      // Check if OTP is correct and not expired (e.g., 10 minutes validity)
      if (storedOTP.otp === otp && (currentTime - storedOTP.timestamp) < 600000) {
        return true;
      } else {
        throw new Error('OTP is invalid or expired');
      }
    } else {
      throw new Error('No OTP found for this email');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP. Please try again.');
  }
};

// Function to store user profile in Firestore (including avatar)
export const storeUserProfile = async (userId, name, email, birthdate, avatar) => {
  try {
    const userDocRef = doc(FIRESTORE_DB, 'users', userId); // Tham chiếu đến tài liệu của người dùng trong Firestore
    await setDoc(userDocRef, {
      name: name,
      email: email,
      birthdate: birthdate,
      avatar: avatar || 'default_avatar_url', // Thêm avatar nếu có, nếu không thì sử dụng mặc định
      createdAt: Date.now(),
    });
    console.log('User profile stored in Firestore successfully');
  } catch (error) {
    console.error('Error storing user profile in Firestore:', error);
    throw new Error('Failed to store user profile in Firestore. Please try again.');
  }
};

// Function to get user profile from Firestore (including avatar)
export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(FIRESTORE_DB, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data(); // Trả về đối tượng có cả thông tin avatar và các trường khác
    } else {
      throw new Error('No profile data found');
    }
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    throw new Error('Failed to fetch user profile from Firestore. Please try again.');
  }
};

