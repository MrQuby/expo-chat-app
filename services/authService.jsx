import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Authentication service functions
export const authService = {
  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Create new user account
  signUp: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Sign out current user
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Send password reset email
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Update user profile
  updateUserProfile: async (user, profileData) => {
    try {
      await updateProfile(user, profileData);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Delete user account
  deleteUserAccount: async (user) => {
    try {
      await deleteUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  }
}; 