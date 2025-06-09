import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  // If user is authenticated, redirect to main app
  if (user && !loading) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Welcome to Foodva',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Create Account',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}