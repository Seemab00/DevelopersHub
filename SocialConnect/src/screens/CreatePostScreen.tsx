import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppTabsParamList } from '../navigation/AppTabs';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = BottomTabNavigationProp<AppTabsParamList, 'Create'>;

export default function CreatePostScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<NavigationProp>();

  const handlePost = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Post cannot be empty');
      return;
    }
    
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'Unknown',
        text: text.trim(),
        timestamp: Date.now(),
        likes: []
      });
      setText('');
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error creating post', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        multiline
        autoFocus
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handlePost}>
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { fontSize: 18, height: 150, textAlignVertical: 'top', padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
