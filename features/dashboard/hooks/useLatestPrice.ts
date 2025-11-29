import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../core/supabase';

export function useLatestPrice() {
    const [price, setPrice] = useState<{ date: string; fnc_price: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrice = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('historical_prices')
                .select('date, fnc_price')
                .order('date', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows found
                    setPrice(null);
                } else {
                    throw error;
                }
            } else {
                setPrice(data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrice();
    }, [fetchPrice]);

    return { price, loading, error, refetch: fetchPrice };
}
