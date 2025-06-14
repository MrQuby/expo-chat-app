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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks';
import { firestoreService } from '../../services';
import { colors } from '../../config/colors';

const Profile = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFirstName, setInitialFirstName] = useState('');
  const [initialLastName, setInitialLastName] = useState('');
  const [initialProfileImage, setInitialProfileImage] = useState(null);

  // Set navigation options to match other screens
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#ffffff',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        color: '#ef4444',
        fontSize: 22,
        fontWeight: 'bold',
      },
      headerTintColor: '#111827',
    });
  }, [navigation]);

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
        const userFirstName = result.data.firstName || '';
        const userLastName = result.data.lastName || '';
        const userImage = result.data.profileImage || null;
        
        setFirstName(userFirstName);
        setLastName(userLastName);
        setInitialFirstName(userFirstName);
        setInitialLastName(userLastName);
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

    const hasNameChanged = firstName.trim() !== initialFirstName.trim() || lastName.trim() !== initialLastName.trim();
    const hasImageChanged = profileImage !== initialProfileImage;

    if (!hasNameChanged && !hasImageChanged) {
      Alert.alert('Info', 'No changes to save');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Updating profile for user:', user.uid);
      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      };

      if (hasImageChanged) {
        updateData.profileImage = profileImage;
      }

      const result = await firestoreService.users.update(user.uid, updateData);

      if (result.success) {
        setInitialFirstName(firstName.trim());
        setInitialLastName(lastName.trim());
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
      const name = firstName + ' ' + lastName || user?.email || 'U';
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
      <View style={styles.content}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
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
              <MaterialCommunityIcons name="camera" size={20} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.email}>{getUserEmail()}</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#9ca3af"
            maxLength={50}
          />
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            placeholderTextColor="#9ca3af"
            maxLength={50}
          />
          
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  avatarContainer: {
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
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: '#ef4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile;
