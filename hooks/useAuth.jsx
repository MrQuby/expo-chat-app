import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { authService, firestoreService } from '../services';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsInitializing(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        Alert.alert('Success', 'Welcome back!');
        return { success: true, user: result.user };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.signUp(userData.email, userData.password);
      if (result.success) {
        const user = result.user;

        // Sign out immediately to prevent auto-navigation
        await authService.signOut();

        // Save user data to Firestore
        await firestoreService.users.create(user.uid, {
          uid: user.uid,
          email: user.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: `${userData.firstName} ${userData.lastName}`,
        });

        return { success: true, user };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please use a different email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format. Please enter a valid email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
      
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      Alert.alert('Success', 'Logged out successfully');
    } else {
      console.error('Logout error:', result.error);
      Alert.alert('Error', 'Failed to logout');
    }
    return result;
  };

  return {
    user,
    loading,
    isInitializing,
    login,
    signup,
    logout,
  };
}; 