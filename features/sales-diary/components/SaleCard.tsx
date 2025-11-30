import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../constants/theme';

type SaleCardProps = {
    sale: {
        id: number;
        date: string;
        total_amount: number;
        kilograms_sold: number;
    };
    onEdit: () => void;
    onDelete: () => void;
};

export default function SaleCard({ sale, onEdit, onDelete }: SaleCardProps) {
    const handleDelete = () => {
        Alert.alert(
            'Eliminar Venta',
            '¿Estás seguro de que quieres eliminar esta venta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: onDelete },
            ]
        );
    };

    // Format date as readable string
    const formattedDate = new Date(sale.date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Format amount as currency
    const formattedAmount = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(sale.total_amount);

    // Calculate price per kilo
    const pricePerKilo = sale.total_amount / sale.kilograms_sold;
    const formattedPricePerKilo = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(pricePerKilo);

    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <Text style={styles.date}>{formattedDate}</Text>
                <Text style={styles.amount}>{formattedAmount}</Text>
                <Text style={styles.details}>
                    {sale.kilograms_sold} kg • {formattedPricePerKilo}/kg
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                    <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                    <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundCard,
        padding: Spacing.base,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.small,
    },
    content: {
        flex: 1,
    },
    date: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    amount: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    details: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    actionButton: {
        padding: Spacing.sm,
    },
    editText: {
        color: Colors.primary,
        fontWeight: FontWeights.semibold,
        fontSize: FontSizes.sm,
    },
    deleteText: {
        color: Colors.error,
        fontWeight: FontWeights.semibold,
        fontSize: FontSizes.sm,
    },
});
