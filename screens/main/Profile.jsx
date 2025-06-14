import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks';
import { firestoreService } from '../../services';

const Profile = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialDisplayName, setInitialDisplayName] = useState('');
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user]);
  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('Loading profile for user:', user.uid);
      const result = await firestoreService.users.get(user.uid);
      
      if (result.success) {
        const userName = result.data.displayName || '';
        setDisplayName(userName);
        setInitialDisplayName(userName);
      } else {
        console.error('Failed to load profile:', result.error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };
  const saveProfile = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to update your profile');
      return;
    }

    if (displayName.trim() === initialDisplayName.trim()) {
      Alert.alert('Info', 'No changes to save');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Updating profile for user:', user.uid);
      const result = await firestoreService.users.update(user.uid, {
        displayName: displayName.trim(),
      });

      if (result.success) {
        setInitialDisplayName(displayName.trim());
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        console.error('Failed to update profile:', result.error);
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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

  if (!user?.uid) {
    return (
      <LinearGradient colors={['#fef2f2', '#ffffff', '#fef2f2']} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#fef2f2', '#ffffff', '#fef2f2']} style={styles.gradient}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(displayName || user.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.userId}>ID: {user.uid.substring(0, 8)}...</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor="#6b7280"
                maxLength={50}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={saveProfile}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  },  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  userId: {
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  saveButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile;
