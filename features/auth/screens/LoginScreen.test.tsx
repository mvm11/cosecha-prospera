import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../core/supabase';
import LoginScreen from './LoginScreen';

// Mock Supabase
jest.mock('../../../core/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
        },
    },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        const { getByText, getByPlaceholderText } = render(<LoginScreen />);
        expect(getByText('Cosecha Próspera')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('should handle sign in', async () => {
        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            error: null,
        });

        const { getByText, getByPlaceholderText } = render(<LoginScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password');
        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password',
            });
        });
    });

    it('should handle sign up', async () => {
        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
            error: null,
        });

        const { getByText, getByPlaceholderText } = render(<LoginScreen />);

        fireEvent.press(getByText('Switch to Sign Up'));

        fireEvent.changeText(getByPlaceholderText('Email'), 'new@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password');
        fireEvent.press(getByText('Sign Up'));

        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: 'new@example.com',
                password: 'password',
            });
            expect(Alert.alert).toHaveBeenCalledWith('Success', expect.any(String));
        });
    });

    it('should display error on failure', async () => {
        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            error: { message: 'Invalid login' },
        });

        const { getByText, getByPlaceholderText } = render(<LoginScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password');
        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid login');
        });
    });
});
