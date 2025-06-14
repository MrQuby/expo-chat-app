import { useState, useEffect } from 'react';
import { firestoreService } from '../services';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.users.get(userId);
      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    if (!userId) return { success: false, error: 'No user ID provided' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.users.update(userId, userData);
      if (result.success) {
        // Update local state
        setProfile(prev => ({ ...prev, ...userData }));
      } else {
        setError(result.error.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete user profile
  const deleteProfile = async () => {
    if (!userId) return { success: false, error: 'No user ID provided' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firestoreService.users.delete(userId);
      if (result.success) {
        setProfile(null);
      } else {
        setError(result.error.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Listen to real-time profile updates
  const subscribeToProfile = () => {
    if (!userId) return null;
    
    return firestoreService.onDocumentSnapshot('users', userId, (doc) => {
      if (doc.exists()) {
        setProfile({ id: doc.id, ...doc.data() });
      } else {
        setProfile(null);
      }
    });
  };

  // Fetch profile on userId change
  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    deleteProfile,
    subscribeToProfile,
  };
}; 