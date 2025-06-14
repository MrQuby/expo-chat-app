import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const AppNavigator = () => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return null; // You can show a loading screen here
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
