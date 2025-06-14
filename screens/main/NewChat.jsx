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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import { chatService } from '../../services';

const NewChat = ({ navigation }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Set navigation options to match ChatList header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#ffffff',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        color: '#ef4444',
        fontSize: 22,
        fontWeight: 'bold',
      },
      headerTintColor: '#111827',
    });
  }, [navigation]);

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
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#9ca3af"
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 2,
    margin: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#111827',
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
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  userList: {
    flex: 1,
    paddingHorizontal: 5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#f8fafc',
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#64748b',
  },
});

export default NewChat;
