import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Post } from '../store/postsSlice';
import { Ionicons } from '@expo/vector-icons';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?.uid;
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;

  const handleLike = async () => {
    if (!currentUserId) return;
    const postRef = doc(db, 'posts', post.id);
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUserId)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUserId)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const formattedDate = new Date(post.timestamp).toLocaleString();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.userName[0].toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.timestamp}>{formattedDate}</Text>
        </View>
      </View>
      
      <Text style={styles.content}>{post.text}</Text>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? "#e0245e" : "#666"} 
          />
          <Text style={[styles.likeCount, { color: isLiked ? "#e0245e" : "#666" }]}>
            {post.likes.length}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007bff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userName: { fontWeight: 'bold', fontSize: 16 },
  timestamp: { color: '#888', fontSize: 12 },
  content: { fontSize: 16, lineHeight: 22, color: '#333', marginBottom: 15 },
  footer: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  likeButton: { flexDirection: 'row', alignItems: 'center' },
  likeCount: { marginLeft: 5, fontSize: 16, fontWeight: '500' }
});
