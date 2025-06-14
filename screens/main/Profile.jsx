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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks';
import { firestoreService } from '../../services';
import { colors } from '../../config/colors';

const Profile = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialDisplayName, setInitialDisplayName] = useState('');
  const [initialProfileImage, setInitialProfileImage] = useState(null);  useEffect(() => {
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
        const userImage = result.data.profileImage || null;
        setDisplayName(userName);
        setInitialDisplayName(userName);
        setProfileImage(userImage);
        setInitialProfileImage(userImage);
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

    const hasNameChanged = displayName.trim() !== initialDisplayName.trim();
    const hasImageChanged = profileImage !== initialProfileImage;

    if (!hasNameChanged && !hasImageChanged) {
      Alert.alert('Info', 'No changes to save');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Updating profile for user:', user.uid);
      const updateData = {
        displayName: displayName.trim(),
      };

      if (hasImageChanged) {
        updateData.profileImage = profileImage;
      }

      const result = await firestoreService.users.update(user.uid, updateData);

      if (result.success) {
        setInitialDisplayName(displayName.trim());
        setInitialProfileImage(profileImage);
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

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Image = `data:${asset.type}/jpeg;base64,${asset.base64}`;
        setProfileImage(base64Image);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Image = `data:${asset.type}/jpeg;base64,${asset.base64}`;
        setProfileImage(base64Image);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to set your profile picture',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
  // Helper function to get user initial
  const getUserInitial = () => {
    try {
      const name = displayName || user?.email || 'U';
      const initial = String(name).charAt(0).toUpperCase();
      return initial || 'U';
    } catch (error) {
      console.error('Error getting user initial:', error);
      return 'U';
    }
  };

  // Helper function to get user email
  const getUserEmail = () => {
    try {
      const email = user?.email || 'No email';
      return String(email);
    } catch (error) {
      console.error('Error getting user email:', error);
      return 'No email';
    }
  };

  // Helper function to get user ID
  const getUserId = () => {
    try {
      const uid = user?.uid;
      if (!uid) return 'Unknown';
      const shortId = String(uid).substring(0, 8);
      return shortId || 'Unknown';
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 'Unknown';
    }
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
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatarTouchable} onPress={showImagePicker}>
              <View style={styles.avatar}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{getUserInitial()}</Text>
                )}
              </View>
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraIconText}>📷</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <Text style={styles.email}>{getUserEmail()}</Text>
            <Text style={styles.userId}>{`ID: ${getUserId()}...`}</Text>
          </View>

          {/* Form Section */}
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
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor || '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },  avatarText: {
    color: colors.textInverse || '#ffffff',
    fontSize: 36,
    fontWeight: '700',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  cameraIconText: {
    fontSize: 14,
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
