import Constants from 'expo-constants';

// Backend API configuration
export const API_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-backend-url.com/api';  // Production

// Supabase configuration - these should match your backend
export const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || 'your_supabase_url';
export const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || 'your_supabase_anon_key';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'foodva_auth_token',
  USER_DATA: 'foodva_user_data',
} as const;

export const SCREEN_NAMES = {
  // Auth Stack
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Main Tabs
  FEED: 'Feed',
  UPLOAD: 'Upload',
  PROFILE: 'Profile',
  
  // Modal Screens
  POST_DETAIL: 'PostDetail',
  EDIT_PROFILE: 'EditProfile',
  COMMENTS: 'Comments',
} as const;