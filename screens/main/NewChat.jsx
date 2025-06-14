import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks';
import { chatService } from '../../services';

const NewChat = ({ navigation }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.uid) {
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);
  const loadUsers = async () => {
    try {
      if (!user?.uid) {
        console.error('User is not authenticated');
        Alert.alert('Error', 'You must be logged in to view users');
        return;
      }

      console.log('Loading users for current user:', user.uid);
      const result = await chatService.getAllUsers(user.uid);
      
      if (result.success) {
        console.log('Loaded users:', result.data.length);
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        console.error('Failed to load users:', result.error);
        Alert.alert('Error', 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  const startChat = async (selectedUser) => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to start a chat');
      return;
    }

    try {
      console.log('Starting chat between:', user.uid, 'and', selectedUser.id);
      
      // First, check if a direct chat already exists
      const existingChatResult = await chatService.findDirectChat(user.uid, selectedUser.id);
      
      if (existingChatResult.success) {
        console.log('Found existing chat:', existingChatResult.data.id);
        // Chat exists, navigate to it
        const chat = existingChatResult.data;
        navigation.navigate('ChatRoom', {
          chatId: chat.id,
          chatName: selectedUser.displayName || selectedUser.email,
          isGroup: false,
        });
      } else {
        console.log('Creating new chat');
        // Create new chat
        const createChatResult = await chatService.createChatRoom([user.uid, selectedUser.id]);
        
        if (createChatResult.success) {
          console.log('Created new chat:', createChatResult.chatId);
          navigation.navigate('ChatRoom', {
            chatId: createChatResult.chatId,
            chatName: selectedUser.displayName || selectedUser.email,
            isGroup: false,
          });
        } else {
          console.error('Failed to create chat:', createChatResult.error);
          Alert.alert('Error', 'Failed to create chat');
        }
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.displayName || item.email || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.userContent}>
        <Text style={styles.userName}>
          {item.displayName || 'Unknown User'}
        </Text>
        <Text style={styles.userEmail}>
          {item.email}
        </Text>
      </View>
      
      <View style={styles.chatIcon}>
        <Text style={styles.chatIconText}>💬</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#fef2f2', '#ffffff', '#fef2f2']} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#fef2f2', '#ffffff', '#fef2f2']} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No users found' : 'No users available'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Invite friends to join the app!'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            style={styles.userList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIconText: {
    fontSize: 20,
  },
});

export default NewChat;
