import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth, useFormValidation } from '../../hooks';
import AnimatedInput from '../../components/AnimatedInput';

const Login = ({ navigation }) => {
  const { login, loading } = useAuth();
  const { showErrors, handleSubmit: handleFormSubmit } = useFormValidation();
  
  // Focus states for styling
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Validation schema
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleLogin = async (values) => {
    await login(values.email, values.password);
  };
  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality will be implemented soon.');
  };
  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#ffffff']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>🔥</Text>
              </View>
            </View>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>
          </View>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <AnimatedInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onFocus={() => setEmailFocused(true)}
                onBlur={(e) => {
                  setEmailFocused(false);
                  handleBlur('email')(e);
                }}
                error={errors.email}
                showError={showErrors}
                styles={styles}
                isFocused={emailFocused}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AnimatedInput
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onFocus={() => setPasswordFocused(true)}
                onBlur={(e) => {
                  setPasswordFocused(false);
                  handleBlur('password')(e);
                }}
                error={errors.password}
                showError={showErrors}
                styles={styles}
                isFocused={passwordFocused}
                secureTextEntry
              />

              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={() => handleFormSubmit({ errors, isValid: Object.keys(errors).length === 0, values }, handleLogin)}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#ffffff" size="small" style={styles.loadingIndicator} />
                      <Text style={styles.buttonText}>Signing In</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.linkText}>
                  Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
            )}
          </Formik>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoText: {
    fontSize: 32,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  form: {
    width: '100%',
    paddingHorizontal: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  animatedLabel: {
    position: 'absolute',
    left: 16,
    fontWeight: '600',
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1e293b',
  },
  inputFocused: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 6,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  button: {
    borderRadius: 16,
    marginTop: 6,
    marginBottom: 20,
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  linkTextBold: {
    color: '#dc2626',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default Login;
