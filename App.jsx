import React from 'react';
import { StatusBar } from 'expo-status-bar';
import './config/firebase'; // Initialize Firebase
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}