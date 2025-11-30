import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../constants/theme';
import SaleCard from '../components/SaleCard';
import SaleFormModal from '../components/SaleFormModal';
import { useSalesNotes } from '../hooks/useSalesNotes';

export default function SalesDiaryScreen() {
    const { sales, loading, error, createSale, updateSale, deleteSale, refetch } = useSalesNotes();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSale, setEditingSale] = useState<{
        id: number;
        date: string;
        total_amount: number;
        kilograms_sold: number;
    } | undefined>();

    const handleAddSale = () => {
        setEditingSale(undefined);
        setModalVisible(true);
    };

    const handleEditSale = (sale: { id: number; date: string; total_amount: number; kilograms_sold: number }) => {
        setEditingSale(sale);
        setModalVisible(true);
    };

    const handleSaveSale = async (data: { date: string; total_amount: number; kilograms_sold: number }) => {
        if (editingSale) {
            return await updateSale(editingSale.id, data);
        } else {
            return await createSale(data);
        }
    };

    const handleDeleteSale = async (id: number) => {
        await deleteSale(id);
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aún no hay ventas</Text>
            <Text style={styles.emptyText}>Comienza a registrar tus ventas para llevar control de tus ganancias</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Mis ventas</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddSale}>
                    <Text style={styles.addButtonText}>+ Agregar</Text>
                </TouchableOpacity>
            </View>

            {/* Error State */}
            {error && <Text style={styles.errorText}>Error: {error}</Text>}

            {/* Sales List */}
            <FlatList
                data={sales}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <SaleCard
                        sale={item}
                        onEdit={() => handleEditSale(item)}
                        onDelete={() => handleDeleteSale(item.id)}
                    />
                )}
                contentContainerStyle={sales.length === 0 ? styles.emptyList : styles.list}
                ListEmptyComponent={!loading ? renderEmptyState : null}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
            />

            {/* Add/Edit Modal */}
            <SaleFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveSale}
                initialData={editingSale}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingTop: Spacing.xxxl + Spacing.lg,
        backgroundColor: Colors.backgroundCard,
        borderBottomWidth: 2,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    addButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        borderRadius: BorderRadius.md,
        ...Shadows.small,
    },
    addButtonText: {
        color: Colors.textOnPrimary,
        fontWeight: FontWeights.semibold,
        fontSize: FontSizes.sm,
    },
    list: {
        padding: Spacing.lg,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    emptyState: {
        alignItems: 'center',
        backgroundColor: Colors.backgroundCard,
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
    },
    emptyTitle: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
    },
    emptyText: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    errorText: {
        color: Colors.error,
        padding: Spacing.md,
        textAlign: 'center',
        fontSize: FontSizes.base,
    },
});
