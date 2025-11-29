import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../../core/supabase';
import { useAuth } from '../../auth/context/AuthContext';
import PriceCard from '../components/PriceCard';
import { useLatestPrice } from '../hooks/useLatestPrice';

export default function DashboardScreen() {
    const router = useRouter();
    const { user, session } = useAuth();
    const { price, loading, error, refetch } = useLatestPrice();
    const [refreshing, setRefreshing] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const handleAnalyze = () => {
        Alert.alert('Coming Soon', 'AI Analysis will be available in the next update!');
    };

    const handleNavigateToSalesDiary = () => {
        router.push('/sales-diary');
    };

    const handleRefreshPrices = async () => {
        if (!session) {
            Alert.alert('Error', 'You must be logged in to refresh prices');
            return;
        }

        setRefreshing(true);
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-colombian-coffee-federation-prices`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch prices');
            }

            Alert.alert('Success', `Latest price updated: $${data.data.price.toLocaleString('es-CO')} (${data.data.date})`);

            // Refresh the local data
            await refetch();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to refresh prices');
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refetch} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Hola, {user?.email?.split('@')[0]}</Text>
                <Button title="Sign Out" onPress={handleSignOut} color="#e74c3c" />
            </View>

            {error ? (
                <Text style={styles.error}>Error loading price: {error}</Text>
            ) : price ? (
                <PriceCard fncPrice={price.fnc_price} date={price.date} />
            ) : (
                <View style={styles.emptyState}>
                    <Text>No price data available.</Text>
                    <Text style={styles.hint}>Pull down to refresh or fetch from FNC</Text>
                </View>
            )}

            <View style={styles.actions}>
                <Button
                    title={refreshing ? "Fetching from FNC..." : "Refresh Prices from FNC"}
                    onPress={handleRefreshPrices}
                    color="#27ae60"
                    disabled={refreshing}
                />
                <View style={{ height: 10 }} />
                <Button title="Analyze with AI" onPress={handleAnalyze} color="#2980b9" />
                <View style={{ height: 10 }} />
                <Button title="My Sales Diary" onPress={handleNavigateToSalesDiary} color="#8e44ad" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 20,
    },
    emptyState: {
        alignItems: 'center',
        marginVertical: 40,
    },
    hint: {
        color: '#999',
        marginTop: 5,
    },
    actions: {
        marginTop: 20,
    },
});
