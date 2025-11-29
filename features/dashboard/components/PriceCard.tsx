import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
            <Text style={styles.label}>Precio Interno (Carga 125kg)</Text>
            <Text style={styles.price}>{formattedPrice}</Text>
            <Text style={styles.date}>Fecha: {date}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 20,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#27ae60',
        marginBottom: 5,
    },
    date: {
        fontSize: 14,
        color: '#999',
    },
});
