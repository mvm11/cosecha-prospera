import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../../core/supabase';

export type FarmerProfile = {
    user_id: string;
    region: string | null;
    hectares: number | null;
    coffee_variety: string | null;
    updated_at: string;
};

export type UpdateProfileInput = {
    region: string;
    hectares: number;
    coffee_variety: string;
};

export function useProfile() {
    const [profile, setProfile] = useState<FarmerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const fetchAttemptRef = useRef(0);

    const fetchProfile = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            setLoading(true);
            setError(null);
            fetchAttemptRef.current += 1;
            const currentAttempt = fetchAttemptRef.current;

            const { data: { user } } = await supabase.auth.getUser();

            if (!isMountedRef.current || currentAttempt !== fetchAttemptRef.current) {
                return;
            }

            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('farmer_profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!isMountedRef.current || currentAttempt !== fetchAttemptRef.current) {
                return;
            }

            if (error) {
                console.warn('Profile fetch error:', error);
                throw error;
            }

            setProfile(data);
        } catch (err: any) {
            if (isMountedRef.current) {
                console.error('fetchProfile error:', err);
                setError(err.message);
                // No establecer profile a null si ya existe uno
                if (!profile) {
                    setProfile(null);
                }
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [profile]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchProfile();

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const updateProfile = async (input: UpdateProfileInput) => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('User not authenticated');

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/save-farmer-profile`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(input),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save profile');
            }

            // Actualizar optimistamente
            const { data: { user } } = await supabase.auth.getUser();
            if (user && isMountedRef.current) {
                setProfile({
                    user_id: user.id,
                    region: input.region,
                    hectares: input.hectares,
                    coffee_variety: input.coffee_variety,
                    updated_at: new Date().toISOString(),
                });
            }

            return { success: true };
        } catch (err: any) {
            console.error('updateProfile error:', err);
            return { success: false, error: err.message };
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    return {
        profile,
        loading,
        error,
        updateProfile,
        refetch: fetchProfile,
    };
}