import { useState } from 'react';

export const useFormValidation = () => {
  const [showErrors, setShowErrors] = useState(false);

  const handleSubmit = async (formikProps, onSubmit) => {
    const { errors, isValid, values } = formikProps;
    
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getInputStyle = (baseStyle, errorStyle, focusedStyle, hasError, isFocused) => [
    baseStyle,
    showErrors && hasError && errorStyle,
    isFocused && focusedStyle
  ].filter(Boolean);

  const shouldShowError = (error, touched) => showErrors && error;

  return {
    showErrors,
    setShowErrors,
    handleSubmit,
    getInputStyle,
    shouldShowError,
  };
}; 