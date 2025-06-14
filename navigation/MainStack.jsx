import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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
        headerTitleAlign: 'left',
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
          headerTitle: () => (
            <View style={headerStyles.headerContainer}>
              <View style={headerStyles.avatar}>
                {route.params?.profileImage ? (
                  <Image 
                    source={{ uri: route.params.profileImage }} 
                    style={headerStyles.avatarImage} 
                  />
                ) : (
                  <Text style={headerStyles.avatarText}>
                    {(route.params?.chatName || 'Chat').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text style={headerStyles.titleText}>
                {route.params?.fullName || route.params?.chatName || 'Chat'}
              </Text>
            </View>
          ),
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

const headerStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 18,
    flexShrink: 1,
  },
});

export default MainStack;
