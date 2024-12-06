// notificationService.js
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { getMessaging, getToken } from 'firebase/messaging';
import app from './firebase';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    try {
      const messaging = getMessaging(app);
      token = await getToken(messaging);
      
      // Lưu token vào database nếu cần
      console.log('FCM Token:', token);
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export const onForegroundMessage = () => {
  const messaging = getMessaging(app);
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};