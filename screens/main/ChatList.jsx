import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks';
import { chatService, firestoreService } from '../../services';
import { colors } from '../../config/colors';

const ChatList = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (!user?.uid) return;

    console.log('Setting up chat listener for user:', user.uid);

    // Set up real-time listener for chats
    const unsubscribe = chatService.onUserChatsSnapshot(user.uid, async (snapshot) => {
      console.log('Received chat update, number of chats:', snapshot.size);
      const chatList = [];
      const userIds = new Set();

      snapshot.forEach((doc) => {
        const chatData = { id: doc.id, ...doc.data() };
        chatList.push(chatData);
        
        // Collect all participant IDs to fetch user data
        chatData.participants.forEach(participantId => {
          if (participantId !== user.uid) {
            userIds.add(participantId);
          }
        });
      });

      // Fetch user data for all participants
      const userPromises = Array.from(userIds).map(async (userId) => {
        const result = await firestoreService.users.get(userId);
        return result.success ? { id: userId, ...result.data } : null;
      });

      const userData = await Promise.all(userPromises);
      const usersMap = {};
      userData.forEach(user => {
        if (user) {
          usersMap[user.id] = user;
        }
      });

      console.log('Setting chats and users:', chatList.length, 'chats,', Object.keys(usersMap).length, 'users');
      setUsers(usersMap);
      setChats(chatList);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // The real-time listener will automatically update the data
    setTimeout(() => setRefreshing(false), 1000);
  };
  const handleChatPress = (chat) => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to access chats');
      return;
    }    const otherParticipants = chat.participants.filter(id => id !== user.uid);
    const chatName = chat.isGroup 
      ? chat.chatName 
      : users[otherParticipants[0]]?.displayName || users[otherParticipants[0]]?.email || 'Unknown User';
    
    const profileImage = chat.isGroup 
      ? null 
      : users[otherParticipants[0]]?.profileImage;

    console.log('Navigating to chat:', chat.id, 'with name:', chatName);
    navigation.navigate('ChatRoom', {
      chatId: chat.id,
      chatName,
      isGroup: chat.isGroup,
      profileImage,
      fullName: chatName,
    });
  };

  const handleNewChat = () => {
    navigation.navigate('NewChat');
  };
  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const getChatDisplayName = (chat) => {
    if (chat.isGroup) {
      return chat.chatName || 'Group Chat';
    }
    
    const otherParticipant = chat.participants.find(id => id !== user.uid);
    const otherUser = users[otherParticipant];
    return otherUser?.displayName || otherUser?.email || 'Unknown User';
  };

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const chatName = getChatDisplayName(chat).toLowerCase();
    const lastMessage = chat.lastMessage?.text?.toLowerCase() || '';
    
    return chatName.includes(query) || lastMessage.includes(query);
  });

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });    }
  };

  const renderChatItem = ({ item }) => {
    const otherParticipant = item.participants.find(id => id !== user.uid);
    const otherUser = users[otherParticipant];
    const profileImage = otherUser?.profileImage;

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, item.isGroup && styles.groupAvatar]}>
            {!item.isGroup && profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {item.isGroup ? '👥' : getChatDisplayName(item).charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {getChatDisplayName(item)}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessageTime)}
            </Text>
          </View>
          
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || 'No messages yet'}
            </Text>
            {(item.unreadCount?.[user.uid] || 0) > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount[user.uid]}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#fef2f2', '#ffffff', '#fef2f2']} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#fef2f2', '#ffffff', '#fef2f2']} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Chats</Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />

        {filteredChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptySubtitle}>Start a conversation with someone!</Text>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            style={styles.chatList}
          />
        )}

        <TouchableOpacity style={styles.fab} onPress={handleNewChat}>
          <Text style={styles.fabText}>💬</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#dc2626',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    margin: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    color: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
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
  avatarContainer: {
    marginRight: 12,
  },  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  groupAvatar: {
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '600',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
  },
});

export default ChatList;
