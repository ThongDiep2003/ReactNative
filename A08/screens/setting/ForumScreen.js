import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../auths/FirebaseConfig';
import { ref, push, onValue, remove } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import ForumNotificationManager from '../../services/ForumNotifications';
import moment from 'moment';

const ForumScreen = () => {
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');
  const [forumData, setForumData] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [noticationManager] = useState(new ForumNotificationManager());

    // Khởi tạo notification manager
  useEffect(() => {
    const initializeNotifications = async () => {
      await notificationManager.initialize();
    };

    initializeNotifications();

    // Thiết lập handler cho việc nhấn vào thông báo
    const subscription = ForumNotificationManager.setupNotificationHandler(navigation);

    return () => {
      subscription.remove();
      notificationManager.cleanup();
    };
  }, []);


  // Lấy email người dùng từ Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setCurrentUser(user.email);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);


  useEffect(() => {
    const forumRef = ref(FIREBASE_DB, 'forum');
    const unsubscribe = onValue(forumRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Sắp xếp theo thời gian mới nhất
        setForumData(formattedData);
      }
    });

    return () => unsubscribe();
  }, []);

  // Thêm câu hỏi
  const handleAddQuestion = () => {
    if (!question.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập câu hỏi');
      return;
    }
  
    const forumRef = ref(FIREBASE_DB, 'forum');
    const newQuestion = {
      question,
      email: currentUser,
      timestamp: Date.now(),
      replies: {},
    };
  
    push(forumRef, newQuestion)
      .then(() => {
        setQuestion('');
      })
      .catch((error) => {
        Alert.alert('Lỗi', 'Không thể thêm câu hỏi: ' + error.message);
      });
  };

  // Thêm câu trả lời
  const handleAddReply = () => {
    if (!reply.trim() || !selectedQuestionId) {
      Alert.alert('Lỗi', 'Vui lòng nhập câu trả lời');
      return;
    }
  
    const repliesRef = ref(FIREBASE_DB, `forum/${selectedQuestionId}/replies`);
    const newReply = {
      reply,
      email: currentUser,
      timestamp: Date.now(),
    };
  
    push(repliesRef, newReply)
      .then(() => {
        setReply('');
        setSelectedQuestionId(null);
      })
      .catch((error) => {
        Alert.alert('Lỗi', 'Không thể thêm câu trả lời: ' + error.message);
      });
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (id, email) => {
    if (email !== currentUser) {
      Alert.alert('Error', 'You can only delete your own questions.');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this question?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            const questionRef = ref(FIREBASE_DB, `forum/${id}`);
            remove(questionRef)
              .then(() => {
                Alert.alert('Success', 'Question deleted.');
                reloadPage();
              })
              .catch((error) => {
                Alert.alert('Error', 'Failed to delete question: ' + error.message);
              });
          },
        },
      ]
    );
  };

  // Xóa câu trả lời
  const handleDeleteReply = (questionId, replyId, email) => {
    if (email !== currentUser) {
      Alert.alert('Error', 'You can only delete your own replies.');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this reply?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            const replyRef = ref(FIREBASE_DB, `forum/${questionId}/replies/${replyId}`);
            remove(replyRef)
              .then(() => {
                Alert.alert('Success', 'Reply deleted.');
                reloadPage();
              })
              .catch((error) => {
                Alert.alert('Error', 'Failed to delete reply: ' + error.message);
              });
          },
        },
      ]
    );
  };

  // Tải lại trang
  const reloadPage = () => {
    const forumRef = ref(FIREBASE_DB, 'forum');
    onValue(forumRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setForumData(formattedData);
      }
    });
  };

  // Hiển thị từng câu hỏi
  const renderQuestion = ({ item }) => (
    <View style={styles.questionContainer}>
    <Text style={styles.questionText}>{item.question}</Text>
    <View style={styles.questionInfo}>
      <Text style={styles.emailText}>Hỏi bởi: {item.email}</Text>
      <Text style={styles.timeText}>
        {moment(item.timestamp).fromNow()}
      </Text>
    </View>
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={styles.replyButton}
        onPress={() => setSelectedQuestionId(selectedQuestionId === item.id ? null : item.id)}
      >
        <Text style={styles.replyButtonText}>
          {selectedQuestionId === item.id ? 'Hủy' : 'Trả lời'}
        </Text>
      </TouchableOpacity>
      {item.email === currentUser && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteQuestion(item.id, item.email)}
        >
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.repliesContainer}>
      {item.replies &&
        Object.entries(item.replies)
          .sort(([,a], [,b]) => b.timestamp - a.timestamp) // Sắp xếp replies theo thời gian
          .map(([replyId, replyData]) => (
            <View key={replyId} style={styles.replyItem}>
              <Text style={styles.replyText}>- {replyData.reply}</Text>
              <View style={styles.replyInfo}>
                <Text style={styles.emailText}>
                  Trả lời bởi: {replyData.email}
                </Text>
                <Text style={styles.timeText}>
                  {moment(replyData.timestamp).fromNow()}
                </Text>
              </View>
              {replyData.email === currentUser && (
                <TouchableOpacity
                  style={styles.deleteReplyButton}
                  onPress={() => handleDeleteReply(item.id, replyId, replyData.email)}
                >
                  <Text style={styles.deleteReplyButtonText}>Xóa</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
    </View>
  </View>
);

  return (
    <View style={styles.container}>
      <FlatList
        data={forumData}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={
            selectedQuestionId ? 'Enter your reply' : 'Enter your question'
          }
          value={selectedQuestionId ? reply : question}
          onChangeText={selectedQuestionId ? setReply : setQuestion}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={selectedQuestionId ? handleAddReply : handleAddQuestion}
        >
          <Text style={styles.buttonText}>
            {selectedQuestionId ? 'Add Reply' : 'Add Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f7f9fc', // Nền tổng thể sáng dịu
      padding: 10,
    },
    header: {
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 10,
      color: '#2c3e50',
    },
    listContainer: {
      paddingBottom: 100,
    },
    inputContainer: {
      position: 'absolute',
      bottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 10,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      paddingVertical: 10,
    },
    input: {
      flex: 1,
      borderColor: '#dfe4ea',
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      backgroundColor: '#fff',
      marginRight: 10,
    },
    button: {
      backgroundColor: '#3498db',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    questionContainer: {
      borderRadius: 8,
      backgroundColor: '#ffffff',
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    questionText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#34495e',
      marginBottom: 5,
    },
    emailText: {
      fontSize: 14,
      color: '#7f8c8d',
      marginBottom: 10,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    replyButton: {
      backgroundColor: '#2ecc71',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    replyButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    repliesContainer: {
      marginTop: 10,
      paddingLeft: 15,
      borderLeftWidth: 2,
      borderLeftColor: '#dcdde1',
    },
    replyItem: {
      marginBottom: 10,
    },
    replyText: {
      fontSize: 14,
      color: '#2c3e50',
    },
    deleteReplyButton: {
      backgroundColor: '#e74c3c',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
      alignSelf: 'flex-start',
      marginTop: 5,
    },
    deleteReplyButtonText: {
      color: '#fff',
      fontSize: 12,
    },
  });
  

export default ForumScreen;
