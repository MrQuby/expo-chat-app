import { useRef, useState } from 'react';
import { Animated } from 'react-native';

export const useAnimatedInput = () => {
  const labelAnimation = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);

  const animateLabel = (focused, hasValue) => {
    Animated.timing(labelAnimation, {
      toValue: focused || hasValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = (value) => {
    setIsFocused(true);
    animateLabel(true, value.length > 0);
  };

  const handleBlur = (onBlur, fieldName, value) => {
    setIsFocused(false);
    onBlur(fieldName);
    animateLabel(false, value.length > 0);
  };

  const handleTextChange = (onChange, fieldName, text, value) => {
    onChange(fieldName)(text);
    animateLabel(isFocused, text.length > 0);
  };

  const getLabelStyle = (baseStyle) => [
    baseStyle,
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

  return {
    isFocused,
    handleFocus,
    handleBlur,
    handleTextChange,
    getLabelStyle,
  };
}; 