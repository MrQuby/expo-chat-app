import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services';

export const useChat = (userId) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = chatService.onUserChatsSnapshot(userId, (snapshot) => {
      const chatList = [];
      
      snapshot.forEach((doc) => {
        chatList.push({ id: doc.id, ...doc.data() });
      });

      setChats(chatList);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const createChat = useCallback(async (participants, chatName = null) => {
    try {
      const result = await chatService.createChatRoom(participants, chatName);
      return result;
    } catch (error) {
      console.error('Error creating chat:', error);
      return { success: false, error };
    }
  }, []);

  const sendMessage = useCallback(async (chatId, senderId, text) => {
    try {
      const result = await chatService.sendMessage(chatId, senderId, text);
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error };
    }
  }, []);

  return {
    chats,
    loading,
    createChat,
    sendMessage,
  };
};

export const useChatMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = chatService.onMessagesSnapshot(chatId, (snapshot) => {
      const messageList = [];
      
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() });
      });

      // Reverse to show newest at bottom
      setMessages(messageList.reverse());
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]);

  return { messages, loading };
};
