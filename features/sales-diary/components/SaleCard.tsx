import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
            'Delete Sale',
            'Are you sure you want to delete this sale?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: onDelete },
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
                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        flex: 1,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    details: {
        fontSize: 12,
        color: '#95a5a6',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        padding: 8,
    },
    editText: {
        color: '#2980b9',
        fontWeight: '600',
    },
    deleteText: {
        color: '#e74c3c',
        fontWeight: '600',
    },
});
