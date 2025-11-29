import { act, renderHook, waitFor } from '@testing-library/react-native';
import { supabase } from '../../../core/supabase';
import { useProfile } from './useProfile';

// Mock Supabase
jest.mock('../../../core/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
            getSession: jest.fn(),
        },
        from: jest.fn(),
    },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('useProfile', () => {
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockMaybeSingle = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (supabase.from as jest.Mock).mockReturnValue({
            select: mockSelect,
        });
        mockSelect.mockReturnValue({
            eq: mockEq,
        });
        mockEq.mockReturnValue({
            maybeSingle: mockMaybeSingle,
        });
    });

    it('should fetch profile successfully', async () => {
        const mockUser = { id: 'user-123' };
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
        });

        const mockProfile = {
            user_id: 'user-123',
            region: 'Huila',
            hectares: 5,
            coffee_variety: 'Castillo',
            updated_at: '2023-10-27',
        };
        mockMaybeSingle.mockResolvedValue({ data: mockProfile, error: null });

        const { result } = renderHook(() => useProfile());

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.error).toBeNull();
    });

    it('should handle no user', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: null },
        });

        const { result } = renderHook(() => useProfile());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.profile).toBeNull();
    });

    it('should handle fetch error', async () => {
        const mockUser = { id: 'user-123' };
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
        });

        mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'Fetch failed' } });

        const { result } = renderHook(() => useProfile());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Fetch failed');
    });

    it('should update profile successfully', async () => {
        const mockUser = { id: 'user-123' };
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
        });
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: { access_token: 'token' } },
        });

        mockMaybeSingle.mockResolvedValue({ data: null, error: null });

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        const { result } = renderHook(() => useProfile());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const response = await result.current.updateProfile({
                region: 'Antioquia',
                hectares: 10,
                coffee_variety: 'Caturra',
            });
            expect(response.success).toBe(true);
        });

        expect(result.current.profile).toEqual({
            user_id: 'user-123',
            region: 'Antioquia',
            hectares: 10,
            coffee_variety: 'Caturra',
            updated_at: expect.any(String),
        });
    });
});
