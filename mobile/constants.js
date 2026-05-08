import { Platform } from 'react-native';

// Android emulator maps 10.0.2.2 to host localhost
// Web and iOS simulator can use localhost directly
const BASE = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const API_URL = BASE;
export const SOCKET_URL = BASE;

export const COLORS = {
  bg: '#fdf4ff',
  primary: '#5b0fa8',
  primaryLight: '#7c3aed',
  accent: '#e879f9',
  cardBg: '#ffffff',
  cardBorder: '#e9d5ff',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  success: '#10b981',
  error: '#ef4444',
  white: '#ffffff',
  pending: '#fef3c7',
  pendingText: '#92400e',
  confirmed: '#dbeafe',
  confirmedText: '#1e40af',
  completed: '#d1fae5',
  completedText: '#065f46',
};
