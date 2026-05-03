import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { auth, db, storage } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Post {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userProfilePic: string;
  imageUrl?: string;
  createdAt: any;
  likes: string[];
}

export default function HomeScreen({ navigation }: any) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setNewPostImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `${Date.now()}.jpg`;
    const storageRef = ref(storage, `posts/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const createPost = async () => {
    if (!newPostText && !newPostImage) {
      Alert.alert('Error', 'Please add text or an image');
      return;
    }

    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();

      let imageUrl = null;
      if (newPostImage) {
        imageUrl = await uploadImage(newPostImage);
      }

      await addDoc(collection(db, 'posts'), {
        text: newPostText,
        userId: currentUser.uid,
        userName: userData?.name || 'User',
        userProfilePic: userData?.profilePic || '',
        imageUrl,
        createdAt: new Date(),
        likes: [],
      });

      setNewPostText('');
      setNewPostImage(null);
      setModalVisible(false);
      Alert.alert('Success', 'Post created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', postId);
    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
    }
  };

  const handleDelete = async (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'posts', postId));
        },
      },
    ]);
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const results = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user: any) => user.name?.toLowerCase().includes(query.toLowerCase()));
    setSearchResults(results);
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = item.likes.includes(currentUser?.uid || '');

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={{ uri: item.userProfilePic || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{item.userName}</Text>
          {item.userId === currentUser?.uid && (
            <View style={styles.postActions}>
              <TouchableOpacity onPress={() => navigation.navigate('EditPost', { post: item })}>
                <Ionicons name="pencil" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.postText}>{item.text}</Text>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
        <View style={styles.postFooter}>
          <TouchableOpacity onPress={() => handleLike(item.id, isLiked)} style={styles.likeButton}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? '#FF3B30' : 'gray'} />
            <Text style={styles.likeCount}>{item.likes.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Chat', { userId: item.userId, userName: item.userName })}>
            <Ionicons name="chatbubble-outline" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.userId })}>
            <Ionicons name="person-outline" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchUsers(text);
          }}
        />
      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.searchResultItem}
              onPress={() => navigation.navigate('Profile', { userId: user.id })}
            >
              <Image source={{ uri: user.profilePic || 'https://via.placeholder.com/40' }} style={styles.searchAvatar} />
              <Text style={styles.searchName}>{user.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="What's on your mind?"
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
            />
            {newPostImage && <Image source={{ uri: newPostImage }} style={styles.previewImage} />}
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>Add Image</Text>
            </TouchableOpacity>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.postButton]} onPress={createPost}>
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin: 10, padding: 10, borderRadius: 10, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  searchResults: { backgroundColor: 'white', marginHorizontal: 10, borderRadius: 10, elevation: 3, maxHeight: 200 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  searchName: { fontSize: 16, fontWeight: '500' },
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
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#007AFF', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, fontSize: 16, minHeight: 100, marginBottom: 15 },
  previewImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  imageButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  imageButtonText: { color: 'white', fontWeight: '600' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modalButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f5f5f5' },
  cancelButtonText: { color: 'gray', fontWeight: '600' },
  postButton: { backgroundColor: '#007AFF' },
  postButtonText: { color: 'white', fontWeight: '600' },
});