import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../core/supabase';
import { useAuth } from '../../auth/context/AuthContext';
import { useLatestPrice } from '../hooks/useLatestPrice';
import DashboardScreen from './DashboardScreen';

// Mock hooks
jest.mock('../../auth/context/AuthContext');
jest.mock('../hooks/useLatestPrice');
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

// Mock Supabase
jest.mock('../../../core/supabase', () => ({
    supabase: {
        auth: {
            signOut: jest.fn(),
        },
    },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock global fetch
global.fetch = jest.fn();

describe('DashboardScreen', () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockSignOut = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useAuth as jest.Mock).mockReturnValue({
            user: { email: 'test@example.com' },
            session: { access_token: 'token' },
        });
        (useLatestPrice as jest.Mock).mockReturnValue({
            price: { fnc_price: 1000, date: '2023-10-27' },
            loading: false,
            error: null,
            refetch: mockRefetch,
        });
        (supabase.auth.signOut as jest.Mock).mockImplementation(mockSignOut);
    });

    it('should render correctly', () => {
        const { getByText } = render(<DashboardScreen />);
        expect(getByText('Hola, test')).toBeTruthy();
        expect(getByText('Precio Interno (Carga 125kg)')).toBeTruthy();
        expect(getByText('✨ Analyze with AI')).toBeTruthy();
    });

    it('should handle sign out', () => {
        const { getByText } = render(<DashboardScreen />);
        fireEvent.press(getByText('Sign Out'));
        expect(mockSignOut).toHaveBeenCalled();
    });

    it('should navigate to AI analysis', () => {
        const { getByText } = render(<DashboardScreen />);
        fireEvent.press(getByText('✨ Analyze with AI'));
        expect(mockPush).toHaveBeenCalledWith('/ai-analysis');
    });

    it('should handle refresh prices', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                latestPrice: { price: 2000, date: '2023-10-28' },
            }),
        });

        const { getByText } = render(<DashboardScreen />);
        fireEvent.press(getByText('Refresh Prices from FNC'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith('Success', expect.stringContaining('Latest price updated'));
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('should handle refresh error', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Failed' }),
        });

        const { getByText } = render(<DashboardScreen />);
        fireEvent.press(getByText('Refresh Prices from FNC'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed');
        });
    });
});
