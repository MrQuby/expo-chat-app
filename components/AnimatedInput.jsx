import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Animated } from 'react-native';

const AnimatedInput = ({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  error,
  showError,
  styles,
  isFocused,
  ...textInputProps
}) => {
  const labelAnimation = useRef(new Animated.Value(0)).current;
  const [isLocalFocused, setIsLocalFocused] = useState(false);

  const animateLabel = (focused, hasValue) => {
    Animated.timing(labelAnimation, {
      toValue: focused || hasValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleChangeText = (text) => {
    onChangeText(text);
    animateLabel(isLocalFocused, text.length > 0);
  };

  const handleFocus = () => {
    setIsLocalFocused(true);
    animateLabel(true, value.length > 0);
    onFocus();
  };

  const handleBlur = (e) => {
    setIsLocalFocused(false);
    animateLabel(false, value.length > 0);
    onBlur(e);
  };

  const getInputStyle = () => [
    styles.input,
    showError && error && styles.inputError,
    (isFocused || isLocalFocused) && styles.inputFocused
  ].filter(Boolean);

  const getLabelStyle = () => [
    styles.animatedLabel,
    {
      top: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [20, -8],
      }),
      fontSize: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 12],
      }),
      color: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['#64748b', '#374151'],
      }),
    }
  ];

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <Animated.Text style={getLabelStyle()}>
          {label}
        </Animated.Text>
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
      </View>
      {showError && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

export default AnimatedInput; 