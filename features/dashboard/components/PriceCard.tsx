import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../constants/theme';

type PriceCardProps = {
    fncPrice: number;
    date: string;
};

export default function PriceCard({ fncPrice, date }: PriceCardProps) {
    // Format price as currency (COP)
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(fncPrice);

    return (
        <View style={styles.card}>
            <Text style={styles.label}>Precio Interno (Carga 125 kg)</Text>
            <Text style={styles.price}>{formattedPrice}</Text>
            <Text style={styles.date}>Fecha: {date}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundSecondary,
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
        ...Shadows.medium,
        marginVertical: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.base,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        fontWeight: FontWeights.medium,
    },
    price: {
        fontSize: FontSizes.huge,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    date: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
    },
});
