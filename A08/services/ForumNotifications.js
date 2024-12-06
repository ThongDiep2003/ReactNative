import * as Notifications from 'expo-notifications';
import { FIREBASE_DB, FIREBASE_AUTH } from '../auths/FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { fr } from 'date-fns/locale';

// Cấu hình notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class ForumNotificationManager {
  constructor() {
    this.currentUser = null;
    this.notifiedReplies = new Set();
  }

  // Khởi tạo và lắng nghe thông báo
  async initialize() {
    try {
      // Kiểm tra và yêu cầu quyền thông báo
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Không có quyền gửi thông báo');
        return false;
      }

      // Lưu thông tin người dùng hiện tại
      this.currentUser = FIREBASE_AUTH.currentUser?.email;

      // Bắt đầu lắng nghe các câu trả lời mới
      this.startListeningToReplies();

      return true;
    } catch (error) {
      console.error('Lỗi khởi tạo thông báo:', error);
      return false;
    }
  }

  // Lắng nghe câu trả lời mới
  startListeningToReplies() {
    if (!this.currentUser) return;

    const forumRef = ref(FIREBASE_DB, 'forum');
    onValue(forumRef, (snapshot) => {
      const forumData = snapshot.val();
      if (!forumData) return;

      Object.entries(forumData).forEach(([questionId, questionData]) => {
        // Chỉ xử lý câu hỏi của người dùng hiện tại
        if (questionData.email === this.currentUser) {
          this.checkNewReplies(questionId, questionData);
        }
      });
    });
  }

  // Kiểm tra và xử lý câu trả lời mới
  checkNewReplies(questionId, questionData) {
    if (!questionData.replies) return;

    Object.entries(questionData.replies).forEach(([replyId, replyData]) => {
      const notificationKey = `${questionId}-${replyId}`;

      // Kiểm tra xem đã thông báo về câu trả lời này chưa
      if (!this.notifiedReplies.has(notificationKey)) {
        // Chỉ thông báo về câu trả lời mới
        const isNewReply = this.isReplyNew(replyData.timestamp);
        if (isNewReply) {
          this.sendNotification(questionData.question, replyData);
          this.notifiedReplies.add(notificationKey);
        }
      }
    });
  }

  // Kiểm tra xem câu trả lời có phải là mới không (trong vòng 5 phút)
  isReplyNew(timestamp) {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return timestamp > fiveMinutesAgo;
  }

  // Gửi thông báo
  async sendNotification(question, replyData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Có câu trả lời mới',
          body: `${replyData.email} đã trả lời câu hỏi "${question.substring(0, 50)}..."`,
          data: { question, reply: replyData },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Gửi ngay lập tức
      });
      console.log('Đã gửi thông báo về câu trả lời mới');
    } catch (error) {
      console.error('Lỗi gửi thông báo:', error);
    }
  }

  // Xử lý khi người dùng nhấn vào thông báo
  static async setupNotificationHandler(navigation) {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // Điều hướng đến màn hình Forum khi nhấn vào thông báo
      navigation.navigate('Forum');
    });

    return subscription;
  }

  // Dọn dẹp
  cleanup() {
    this.notifiedReplies.clear();
  }
}

export default ForumNotificationManager;