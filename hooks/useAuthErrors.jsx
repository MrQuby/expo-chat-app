export const useAuthErrors = () => {
  const getErrorMessage = (error) => {
    if (error.code === 'auth/user-not-found') {
      return 'No account found with this email.';
    }
    // ... other error mappings
  };
  
  return { getErrorMessage };
}; 