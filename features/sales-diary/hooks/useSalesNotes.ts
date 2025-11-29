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

    const createSale = async (input: CreateSaleInput) => {
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
