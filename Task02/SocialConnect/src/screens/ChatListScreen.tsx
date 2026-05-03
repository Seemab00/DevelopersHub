import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function ChatListScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser?.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const chatData = doc.data();
          const otherUserId = chatData.participants.find((id: string) => id !== currentUser?.uid);
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          return {
            id: doc.id,
            ...chatData,
            otherUser: userDoc.data(),
          };
        })
      );
      setChats(chatsData);
    });
    return unsubscribe;
  }, []);

  const renderChat = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { userId: item.otherUser.id, userName: item.otherUser.name })}
    >
      <Image source={{ uri: item.otherUser.profilePic || 'https://via.placeholder.com/50' }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.userName}>{item.otherUser.name}</Text>
        <Text numberOfLines={1} style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation from someone's profile</Text>
        </View>
      ) : (
        <FlatList data={chats} renderItem={renderChat} keyExtractor={(item) => item.id} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  chatItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  chatInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  lastMessage: { fontSize: 14, color: 'gray', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: 'gray' },
  emptySubtext: { fontSize: 14, color: 'lightgray', marginTop: 10 },
});