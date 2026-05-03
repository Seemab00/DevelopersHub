import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditPostScreen({ route, navigation }: any) {
  const { post } = route.params;
  const [text, setText] = useState(post.text);

  const handleUpdate = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Post cannot be empty');
      return;
    }

    await updateDoc(doc(db, 'posts', post.id), { text: text });
    Alert.alert('Success', 'Post updated!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Post</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Edit your post..."
      />
      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.image} />}
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 16, minHeight: 150, textAlignVertical: 'top', marginBottom: 15 },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  button: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f5f5f5' },
  cancelButtonText: { color: 'gray', fontWeight: '600' },
  updateButton: { backgroundColor: '#007AFF' },
  updateButtonText: { color: 'white', fontWeight: '600' },
});