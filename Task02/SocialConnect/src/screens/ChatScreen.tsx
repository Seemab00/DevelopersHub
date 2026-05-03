import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { auth, db } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ route }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const { userId, userName } = route.params;
  const currentUser = auth.currentUser;

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    const chatId1 = `${currentUser?.uid}_${userId}`;
    const chatId2 = `${userId}_${currentUser?.uid}`;
    const chatRef = doc(db, 'chats', chatId1);
    const chatRef2 = doc(db, 'chats', chatId2);
    const chatDoc = await getDoc(chatRef);
    const chatDoc2 = await getDoc(chatRef2);

    let id;
    if (chatDoc.exists()) {
      id = chatId1;
    } else if (chatDoc2.exists()) {
      id = chatId2;
    } else {
      await setDoc(chatRef, {
        participants: [currentUser?.uid, userId],
        createdAt: new Date(),
      });
      id = chatId1;
    }
    setChatId(id);
    loadMessages(id);
  };

  const loadMessages = (chatId: string) => {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });
    return unsubscribe;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMessage,
      senderId: currentUser?.uid,
      receiverId: userId,
      createdAt: new Date(),
    });

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: newMessage,
      lastUpdated: new Date(),
    });

    setNewMessage('');
  };

  const renderMessage = ({ item }: any) => {
    const isOwnMessage = item.senderId === currentUser?.uid;
    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messagesList: { padding: 15 },
  messageContainer: { maxWidth: '80%', marginBottom: 10, padding: 10, borderRadius: 15 },
  ownMessage: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: 'white' },
  messageText: { fontSize: 16, color: '#fff' },
  messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, fontSize: 16 },
  sendButton: { justifyContent: 'center', paddingHorizontal: 10 },
});