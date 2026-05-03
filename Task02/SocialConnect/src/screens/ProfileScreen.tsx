import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ route, navigation }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const currentUser = auth.currentUser;
  const userId = route.params?.userId || currentUser?.uid;
  const isOwnProfile = userId === currentUser?.uid;

  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
      if (!isOwnProfile && currentUser) {
        const following = userDoc.data().followers?.includes(currentUser.uid) || false;
        setIsFollowing(following);
      }
    }
    setLoading(false);
  };

  const fetchUserPosts = async () => {
    const q = query(collection(db, 'posts'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPosts(postsData);
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', userId);
    const currentUserRef = doc(db, 'users', currentUser.uid);

    if (isFollowing) {
      await updateDoc(userRef, { followers: arrayRemove(currentUser.uid) });
      await updateDoc(currentUserRef, { following: arrayRemove(userId) });
      Alert.alert('Unfollowed', `You unfollowed ${userData?.name}`);
    } else {
      await updateDoc(userRef, { followers: arrayUnion(currentUser.uid) });
      await updateDoc(currentUserRef, { following: arrayUnion(userId) });
      Alert.alert('Followed', `You are now following ${userData?.name}`);
    }
    setIsFollowing(!isFollowing);
  };

  const updateProfilePic = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      const blob = await fetch(uri).then(r => r.blob());
      const filename = `${Date.now()}.jpg`;
      const storageRef = ref(storage, `profilePics/${currentUser?.uid}/${filename}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', currentUser!.uid), { profilePic: downloadUrl });
      fetchUserData();
      Alert.alert('Success', 'Profile picture updated!');
    }
  };

  const updateBio = async () => {
    Alert.prompt('Update Bio', 'Enter your new bio', async (text) => {
      if (text) {
        await updateDoc(doc(db, 'users', currentUser!.uid), { bio: text });
        fetchUserData();
        Alert.alert('Success', 'Bio updated!');
      }
    });
  };

  const updateName = async () => {
    Alert.prompt('Update Name', 'Enter your new name', async (text) => {
      if (text) {
        await updateDoc(doc(db, 'users', currentUser!.uid), { name: text });
        fetchUserData();
        Alert.alert('Success', 'Name updated!');
      }
    });
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
      <View style={styles.header}>
        <TouchableOpacity onPress={updateProfilePic} disabled={!isOwnProfile}>
          <Image source={{ uri: userData?.profilePic || 'https://via.placeholder.com/100' }} style={styles.profilePic} />
          {isOwnProfile && <Ionicons name="camera" size={24} color="#007AFF" style={styles.cameraIcon} />}
        </TouchableOpacity>
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
        <Text style={styles.bio}>{userData?.bio || 'No bio yet'}</Text>

        {isOwnProfile ? (
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.editButton} onPress={updateName}>
              <Text style={styles.editButtonText}>Edit Name</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={updateBio}>
              <Text style={styles.editButtonText}>Edit Bio</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.followButton, isFollowing && styles.followingButton]} onPress={handleFollow}>
            <Text style={styles.followButtonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{userData?.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{userData?.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={posts}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('EditPost', { post: item })}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.postGridImage} />
            ) : (
              <View style={styles.postGridPlaceholder}>
                <Text numberOfLines={2} style={styles.placeholderText}>{item.text}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />

      {!isOwnProfile && (
        <TouchableOpacity style={styles.messageButton} onPress={() => navigation.navigate('Chat', { userId, userName: userData?.name })}>
          <Ionicons name="chatbubble" size={24} color="white" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: 'white', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  profilePic: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  cameraIcon: { position: 'absolute', bottom: 10, right: 0, backgroundColor: 'white', borderRadius: 12, padding: 4 },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  email: { fontSize: 14, color: 'gray', marginBottom: 5 },
  bio: { fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 15 },
  editButtons: { flexDirection: 'row', gap: 10 },
  editButton: { backgroundColor: '#007AFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  editButtonText: { color: 'white', fontWeight: '600' },
  followButton: { backgroundColor: '#007AFF', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 25 },
  followingButton: { backgroundColor: '#34C759' },
  followButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: 'gray' },
  postGridImage: { width: '33.33%', height: 120, margin: 1 },
  postGridPlaceholder: { width: '33.33%', height: 120, margin: 1, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', padding: 5 },
  placeholderText: { fontSize: 12, textAlign: 'center' },
  messageButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#007AFF', flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, alignItems: 'center', gap: 8 },
  messageButtonText: { color: 'white', fontWeight: '600' },
});