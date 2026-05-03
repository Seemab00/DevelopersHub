import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PostCardProps {
  post: any;
  currentUserId: string;
  onLike: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onChat: () => void;
  onProfile: () => void;
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  onEdit,
  onChat,
  onProfile,
}: PostCardProps) {
  const isLiked = post.likes.includes(currentUserId);
  const isOwnPost = post.userId === currentUserId;

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: post.userProfilePic || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{post.userName}</Text>
        {isOwnPost && (
          <View style={styles.postActions}>
            <TouchableOpacity onPress={onEdit}>
              <Ionicons name="pencil" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Ionicons name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
      <View style={styles.postFooter}>
        <TouchableOpacity onPress={onLike} style={styles.likeButton}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? '#FF3B30' : 'gray'} />
          <Text style={styles.likeCount}>{post.likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onChat}>
          <Ionicons name="chatbubble-outline" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onProfile}>
          <Ionicons name="person-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: { backgroundColor: 'white', margin: 10, borderRadius: 10, padding: 15, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  postActions: { flexDirection: 'row', gap: 15 },
  postText: { fontSize: 16, marginBottom: 10 },
  postImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  likeButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  likeCount: { marginLeft: 5, fontSize: 14 },
});