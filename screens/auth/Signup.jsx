import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth, useAnimatedInput, useFormValidation } from '../../hooks';

const Signup = ({ navigation }) => {
  const { signup, loading } = useAuth();
  const { showErrors, handleSubmit: handleFormSubmit } = useFormValidation();
  
  // Animated inputs
  const firstNameInput = useAnimatedInput();
  const lastNameInput = useAnimatedInput();
  const emailInput = useAnimatedInput();
  const passwordInput = useAnimatedInput();
  const confirmPasswordInput = useAnimatedInput();

  // Validation schema
  const signupSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const handleSignup = async (values) => {
    const result = await signup(values);
    if (result.success) {
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]);
    }
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
                <Text style={styles.logoText}>🚀</Text>
              </View>
            </View>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join our community today</Text>
            </View>
          </View>

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={signupSchema}
            onSubmit={handleSignup}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <View style={styles.nameRowContainer}>
                <View style={styles.nameInputContainer}>
                  <View style={styles.inputWrapper}>
                    <Animated.Text style={firstNameInput.getLabelStyle(styles.animatedLabel)}>
                      First Name
                    </Animated.Text>
                    <TextInput
                      style={[
                        styles.input,
                        showErrors && errors.firstName && styles.inputError,
                        firstNameInput.isFocused && styles.inputFocused
                      ]}
                      value={values.firstName}
                      onChangeText={(text) => {
                        firstNameInput.handleTextChange(handleChange, 'firstName', text, values.firstName);
                      }}
                      onFocus={() => {
                        firstNameInput.handleFocus(values.firstName);
                      }}
                      onBlur={() => {
                        firstNameInput.handleBlur(handleBlur, 'firstName', values.firstName);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                  {showErrors && errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>

                <View style={styles.nameInputContainer}>
                  <View style={styles.inputWrapper}>
                    <Animated.Text style={lastNameInput.getLabelStyle(styles.animatedLabel)}>
                      Last Name
                    </Animated.Text>
                    <TextInput
                      style={[
                        styles.input,
                        showErrors && errors.lastName && styles.inputError,
                        lastNameInput.isFocused && styles.inputFocused
                      ]}
                      value={values.lastName}
                      onChangeText={(text) => {
                        lastNameInput.handleTextChange(handleChange, 'lastName', text, values.lastName);
                      }}
                      onFocus={() => {
                        lastNameInput.handleFocus(values.lastName);
                      }}
                      onBlur={() => {
                        lastNameInput.handleBlur(handleBlur, 'lastName', values.lastName);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                  {showErrors && errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Animated.Text style={emailInput.getLabelStyle(styles.animatedLabel)}>
                    Email
                  </Animated.Text>
                  <TextInput
                    style={[
                      styles.input,
                      showErrors && errors.email && styles.inputError,
                      emailInput.isFocused && styles.inputFocused
                    ]}
                    value={values.email}
                    onChangeText={(text) => {
                      emailInput.handleTextChange(handleChange, 'email', text, values.email);
                    }}
                    onFocus={() => {
                      emailInput.handleFocus(values.email);
                    }}
                    onBlur={() => {
                      emailInput.handleBlur(handleBlur, 'email', values.email);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {showErrors && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Animated.Text style={passwordInput.getLabelStyle(styles.animatedLabel)}>
                    Password
                  </Animated.Text>
                  <TextInput
                    style={[
                      styles.input,
                      showErrors && errors.password && styles.inputError,
                      passwordInput.isFocused && styles.inputFocused
                    ]}
                    value={values.password}
                    onChangeText={(text) => {
                      passwordInput.handleTextChange(handleChange, 'password', text, values.password);
                    }}
                    onFocus={() => {
                      passwordInput.handleFocus(values.password);
                    }}
                    onBlur={() => {
                      passwordInput.handleBlur(handleBlur, 'password', values.password);
                    }}
                    secureTextEntry
                  />
                </View>
                {showErrors && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Animated.Text style={confirmPasswordInput.getLabelStyle(styles.animatedLabel)}>
                    Confirm Password
                  </Animated.Text>
                  <TextInput
                    style={[
                      styles.input,
                      showErrors && errors.confirmPassword && styles.inputError,
                      confirmPasswordInput.isFocused && styles.inputFocused
                    ]}
                    value={values.confirmPassword}
                    onChangeText={(text) => {
                      confirmPasswordInput.handleTextChange(handleChange, 'confirmPassword', text, values.confirmPassword);
                    }}
                    onFocus={() => {
                      confirmPasswordInput.handleFocus(values.confirmPassword);
                    }}
                    onBlur={() => {
                      confirmPasswordInput.handleBlur(handleBlur, 'confirmPassword', values.confirmPassword);
                    }}
                    secureTextEntry
                  />
                </View>
                {showErrors && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={() => handleFormSubmit({ errors, isValid: Object.keys(errors).length === 0, values }, handleSignup)}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#ffffff" size="small" style={styles.loadingIndicator} />
                      <Text style={styles.buttonText}>Signing Up</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
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
  nameRowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nameInputContainer: {
    flex: 1,
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

export default Signup;