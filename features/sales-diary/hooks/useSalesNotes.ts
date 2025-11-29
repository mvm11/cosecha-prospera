import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../core/supabase';

export type SaleNote = {
    id: number;
    user_id: string;
    date: string;
    total_amount: number;
    kilograms_sold: number;
    created_at: string;
};

export type CreateSaleInput = {
    date: string;
    total_amount: number;
    kilograms_sold: number;
};

export function useSalesNotes() {
    const [sales, setSales] = useState<SaleNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('sales_notes')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            setSales(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    /**
     * ✅ SECURITY FIX: Validates sale input data
     */
    function validateSaleInput(input: CreateSaleInput): { valid: boolean; error?: string } {
        const date = new Date(input.date);
        const now = new Date();

        // Validate date format
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }

        // Prevent future dates
        if (date > now) {
            return { valid: false, error: 'Date cannot be in the future' };
        }

        // Prevent dates too far in the past (max 5 years ago)
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        if (date < fiveYearsAgo) {
            return { valid: false, error: 'Date is too old (max 5 years ago)' };
        }

        // Validate amounts are positive
        if (input.total_amount <= 0 || input.kilograms_sold <= 0) {
            return { valid: false, error: 'Amounts must be positive numbers' };
        }

        // Validate reasonable ranges to prevent data entry errors
        if (input.total_amount > 1000000000) { // 1 billion COP
            return { valid: false, error: 'Total amount seems unrealistic (max 1 billion COP)' };
        }

        if (input.kilograms_sold > 1000000) { // 1 million kg
            return { valid: false, error: 'Kilograms sold seems unrealistic (max 1 million kg)' };
        }

        return { valid: true };
    }

    const createSale = async (input: CreateSaleInput) => {
        // ✅ SECURITY FIX: Validate input before sending to database
        const validation = validateSaleInput(input);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('sales_notes')
                .insert({
                    user_id: user.id,
                    date: input.date,
                    total_amount: input.total_amount,
                    kilograms_sold: input.kilograms_sold,
                });

            if (error) throw error;

            await fetchSales();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const updateSale = async (id: number, input: CreateSaleInput) => {
        // ✅ SECURITY FIX: Validate input before updating
        const validation = validateSaleInput(input);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        try {
            const { error } = await supabase
                .from('sales_notes')
                .update({
                    date: input.date,
                    total_amount: input.total_amount,
                    kilograms_sold: input.kilograms_sold,
                })
                .eq('id', id);

            if (error) throw error;

            await fetchSales();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const deleteSale = async (id: number) => {
        try {
            const { error } = await supabase
                .from('sales_notes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await fetchSales();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    return {
        sales,
        loading,
        error,
        createSale,
        updateSale,
        deleteSale,
        refetch: fetchSales,
    };
}
