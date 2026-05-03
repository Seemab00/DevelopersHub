import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }: any) {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await auth.signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('ChatList')}>
        <Ionicons name="chatbubbles-outline" size={24} color="#007AFF" />
        <Text style={styles.settingText}>Messages</Text>
        <Ionicons name="chevron-forward" size={24} color="gray" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('App Version', 'Version 1.0.0')}>
        <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.settingText}>About</Text>
        <Ionicons name="chevron-forward" size={24} color="gray" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
        <Ionicons name="chevron-forward" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 1 },
  settingText: { flex: 1, fontSize: 16, marginLeft: 15 },
  logoutItem: { marginTop: 20 },
  logoutText: { color: '#FF3B30' },
});