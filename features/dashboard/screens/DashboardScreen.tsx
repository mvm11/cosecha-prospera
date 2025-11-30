
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../constants/theme';
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

    const handleRefreshPrices = async () => {
        if (!session) {
            Alert.alert('Error', 'Debes iniciar sesión para actualizar los precios');
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
                throw new Error(data.error || 'Error al obtener precios');
            }

            // Guard against unexpected shape
            // Edge Function returns { success: true, latestPrice: { date, price }, summary: ... }
            const priceValue = data?.latestPrice?.price;
            const priceDate = data?.latestPrice?.date;

            if (priceValue == null || priceDate == null) {
                throw new Error('Datos de precio inválidos recibidos');
            }

            Alert.alert('Éxito', `Precio actualizado: $${priceValue.toLocaleString('es-CO')} (${priceDate})`);

            // Refresh the local data
            await refetch();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Error al actualizar precios');
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />
            }
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hola,</Text>
                    <Text style={styles.userName}>{user?.email?.split('@')[0]}</Text>
                </View>
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error al cargar precio: {error}</Text>
                </View>
            ) : price != null ? (
                <PriceCard fncPrice={price.fnc_price} date={price.date} />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No hay datos de precio disponibles</Text>
                    <Text style={styles.hint}>Desliza hacia abajo para actualizar o consulta la FNC</Text>
                </View>
            )}

            {/* AI Analysis Button */}
            <TouchableOpacity
                style={styles.aiButton}
                onPress={() => router.push('/ai-analysis')}
            >
                <Text style={styles.aiButtonText}>✨ Analizar con IA</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.refreshButton, refreshing && styles.disabledButton]}
                    onPress={handleRefreshPrices}
                    disabled={refreshing}
                >
                    <Text style={styles.refreshButtonText}>
                        {refreshing ? "Consultando FNC..." : "Refrescar precios FNC"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: Spacing.lg,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.xxxl,
    },
    greeting: {
        fontSize: FontSizes.base,
        color: Colors.textSecondary,
    },
    userName: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    signOutButton: {
        backgroundColor: Colors.error,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        borderRadius: BorderRadius.md,
    },
    signOutText: {
        color: Colors.textOnPrimary,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
    errorContainer: {
        backgroundColor: '#ffeaa7',
        padding: Spacing.base,
        borderRadius: BorderRadius.md,
        marginVertical: Spacing.lg,
    },
    errorText: {
        color: Colors.error,
        textAlign: 'center',
        fontSize: FontSizes.base,
    },
    emptyState: {
        alignItems: 'center',
        marginVertical: Spacing.xxxl,
        backgroundColor: Colors.backgroundCard,
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
    },
    emptyTitle: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.semibold,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
    },
    hint: {
        color: Colors.textMuted,
        fontSize: FontSizes.sm,
        textAlign: 'center',
    },
    aiButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginBottom: Spacing.lg,
        ...Shadows.medium,
    },
    aiButtonText: {
        color: Colors.textOnPrimary,
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
    },
    actions: {
        gap: Spacing.md,
    },
    refreshButton: {
        backgroundColor: Colors.success,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        ...Shadows.small,
    },
    refreshButtonText: {
        color: Colors.textOnPrimary,
        fontSize: FontSizes.base,
        fontWeight: FontWeights.semibold,
    },
    disabledButton: {
        backgroundColor: Colors.textMuted,
    },
});
