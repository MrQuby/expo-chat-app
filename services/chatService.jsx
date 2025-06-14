import { 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  where, 
  getDocs,
  setDoc,
  serverTimestamp,
  limit,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const chatService = {
  // Create a new chat room
  createChatRoom: async (participants, chatName = null) => {
    try {
      const chatData = {
        participants,
        chatName: chatName || null,
        isGroup: participants.length > 2,
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: {},
      };

      // Initialize unread count for each participant
      participants.forEach(participantId => {
        chatData.unreadCount[participantId] = 0;
      });

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      return { success: true, chatId: docRef.id };
    } catch (error) {
      console.error('Error creating chat room:', error);
      return { success: false, error };
    }
  },
  // Get user's chat rooms
  getUserChats: async (userId) => {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(chatsQuery);
      const chats = [];
      
      querySnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by lastMessageTime manually
      chats.sort((a, b) => {
        const aTime = a.lastMessageTime;
        const bTime = b.lastMessageTime;
        
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        
        return bTime.seconds - aTime.seconds;
      });
      
      return { success: true, data: chats };
    } catch (error) {
      console.error('Error getting user chats:', error);
      return { success: false, error };
    }
  },
  // Listen to user's chat rooms in real-time
  onUserChatsSnapshot: (userId, callback) => {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );
    
    return onSnapshot(chatsQuery, (snapshot) => {
      // Sort on client side to avoid needing composite index
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push(doc);
      });
      
      // Sort by lastMessageTime manually
      docs.sort((a, b) => {
        const aTime = a.data().lastMessageTime;
        const bTime = b.data().lastMessageTime;
        
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        
        return bTime.seconds - aTime.seconds;
      });
      
      // Create a mock snapshot with sorted docs
      const sortedSnapshot = {
        forEach: (callback) => {
          docs.forEach(callback);
        },
        docs: docs,
        size: docs.length,
        empty: docs.length === 0
      };
      
      callback(sortedSnapshot);
    });
  },

  // Send a message
  sendMessage: async (chatId, senderId, text, messageType = 'text') => {
    try {
      const messageData = {
        text,
        senderId,
        messageType,
        timestamp: serverTimestamp(),
        edited: false,
        editedAt: null,
      };

      // Add message to messages subcollection
      const messageRef = await addDoc(
        collection(db, 'chats', chatId, 'messages'), 
        messageData
      );

      // Update chat's last message info
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: senderId,
      }, { merge: true });

      return { success: true, messageId: messageRef.id };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error };
    }
  },

  // Listen to messages in a chat room
  onMessagesSnapshot: (chatId, callback, limitCount = 50) => {
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(messagesQuery, callback);
  },

  // Get chat room details
  getChatRoom: async (chatId) => {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      
      if (chatDoc.exists()) {
        return { success: true, data: { id: chatDoc.id, ...chatDoc.data() } };
      } else {
        return { success: false, error: new Error('Chat room not found') };
      }
    } catch (error) {
      console.error('Error getting chat room:', error);
      return { success: false, error };
    }
  },

  // Find existing chat between two users
  findDirectChat: async (userId1, userId2) => {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId1),
        where('isGroup', '==', false)
      );
      
      const querySnapshot = await getDocs(chatsQuery);
      
      for (const doc of querySnapshot.docs) {
        const chatData = doc.data();
        if (chatData.participants.includes(userId2) && chatData.participants.length === 2) {
          return { success: true, data: { id: doc.id, ...chatData } };
        }
      }
      
      return { success: false, error: new Error('No direct chat found') };
    } catch (error) {
      console.error('Error finding direct chat:', error);
      return { success: false, error };
    }
  },

  // Update unread count
  updateUnreadCount: async (chatId, userId, count = 0) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        [`unreadCount.${userId}`]: count
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating unread count:', error);
      return { success: false, error };
    }
  },
  // Get all users (for finding people to chat with)
  getAllUsers: async (currentUserId) => {
    try {
      console.log('Getting all users, excluding:', currentUserId);
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (doc.id !== currentUserId) { // Exclude current user
          users.push({ id: doc.id, ...userData });
        }
      });
      
      console.log('Found users:', users.length);
      return { success: true, data: users };
    } catch (error) {
      console.error('Error getting all users:', error);
      return { success: false, error };
    }
  },
};
