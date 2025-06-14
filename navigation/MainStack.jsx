import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatList from '../screens/main/ChatList';
import ChatRoom from '../screens/main/ChatRoom';
import NewChat from '../screens/main/NewChat';
import Profile from '../screens/main/Profile';

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#dc2626',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ChatList" 
        component={ChatList} 
        options={{ 
          title: 'Chats',
          headerRight: () => null,
        }} 
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoom} 
        options={({ route }) => ({ 
          title: route.params?.chatName || 'Chat',
        })} 
      />
      <Stack.Screen 
        name="NewChat" 
        component={NewChat} 
        options={{ title: 'New Chat' }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={Profile} 
        options={{ title: 'Profile' }} 
      />
    </Stack.Navigator>
  );
};

export default MainStack;
