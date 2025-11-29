import { renderHook, waitFor } from '@testing-library/react-native';
import { supabase } from '../../../core/supabase';
import { useLatestPrice } from './useLatestPrice';

// Mock Supabase
jest.mock('../../../core/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('useLatestPrice', () => {
    const mockSelect = jest.fn();
    const mockOrder = jest.fn();
    const mockLimit = jest.fn();
    const mockSingle = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (supabase.from as jest.Mock).mockReturnValue({
            select: mockSelect,
        });
        mockSelect.mockReturnValue({
            order: mockOrder,
        });
        mockOrder.mockReturnValue({
            limit: mockLimit,
        });
        mockLimit.mockReturnValue({
            single: mockSingle,
        });
    });

    it('should fetch price successfully', async () => {
        const mockData = { date: '2023-10-27', fnc_price: 1000 };
        mockSingle.mockResolvedValue({ data: mockData, error: null });

        const { result } = renderHook(() => useLatestPrice());

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.price).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it('should handle no data found', async () => {
        mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

        const { result } = renderHook(() => useLatestPrice());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.price).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should handle error', async () => {
        mockSingle.mockResolvedValue({ data: null, error: { message: 'Network error' } });

        const { result } = renderHook(() => useLatestPrice());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.price).toBeNull();
        expect(result.current.error).toBe('Network error');
    });
});
