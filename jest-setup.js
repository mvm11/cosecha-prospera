import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
