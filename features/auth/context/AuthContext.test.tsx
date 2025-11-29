import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { supabase } from '../../../core/supabase';
import { AuthProvider, useAuth } from './AuthContext';

// Mock Supabase
jest.mock('../../../core/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            onAuthStateChange: jest.fn(),
        },
    },
}));

const TestComponent = () => {
    const { session, user, loading } = useAuth();
    if (loading) return <Text>Loading...</Text>;
    if (!session) return <Text>No Session</Text>;
    return <Text>User: {user?.email}</Text>;
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with loading state', async () => {
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: null },
        });
        (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
        });

        const { getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByText('Loading...')).toBeTruthy();
        await waitFor(() => expect(getByText('No Session')).toBeTruthy());
    });

    it('should provide session and user when authenticated', async () => {
        const mockSession = { user: { email: 'test@example.com' } };
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: mockSession },
        });
        (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
        });

        const { getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(getByText('User: test@example.com')).toBeTruthy());
    });

    it('should update state on auth change', async () => {
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: null },
        });

        let authCallback: any;
        (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((cb) => {
            authCallback = cb;
            return { data: { subscription: { unsubscribe: jest.fn() } } };
        });

        const { getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(getByText('No Session')).toBeTruthy());

        const mockSession = { user: { email: 'new@example.com' } };

        // Simulate auth change
        if (authCallback) {
            // Wrap in act if needed, but waitFor handles it usually.
            // However, since we are calling a callback from outside React, we should wrap in act.
            // But here we are just triggering it.
            // Actually, since it updates state, we might need act.
            // But testing-library's waitFor handles async updates.
            // Let's just call it.
            // Wait, act is needed for state updates.
            // But since we are mocking, we are simulating the library calling it.
            // Let's try without explicit act first, waitFor should catch it.

            // Actually, we need to import act from testing-library
            // But let's see if it works.

            act(() => {
                authCallback('SIGNED_IN', mockSession);
            });
        }

        await waitFor(() => expect(getByText('User: new@example.com')).toBeTruthy());
    });
});
