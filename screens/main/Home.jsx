import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks';

const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };
  return (
    <LinearGradient
      colors={['#fef2f2', '#ffffff', '#fef2f2']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeEmoji}>🎉</Text>
            <Text style={styles.title}>Welcome Home!</Text>
          </View>
          <Text style={styles.subtitle}>
            Hello, {user?.email || 'User'}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚀 Getting Started</Text>
            <Text style={styles.contentText}>
              You have successfully logged in to your account.
            </Text>
            <Text style={styles.contentSubtext}>
              This is your main dashboard where you can access all features and manage your account.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    alignItems: 'center',
    marginBottom: 50,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 15,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    fontWeight: '500',
  },
  contentSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default Home;
