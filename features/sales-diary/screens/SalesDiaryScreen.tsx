import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
            <Text style={styles.emptyTitle}>No Sales Yet</Text>
            <Text style={styles.emptyText}>Start recording your sales to track your earnings</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Sales Diary</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddSale}>
                    <Text style={styles.addButtonText}>+ Add Sale</Text>
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    addButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    list: {
        padding: 20,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#95a5a6',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        color: '#bdc3c7',
        textAlign: 'center',
    },
    errorText: {
        color: '#e74c3c',
        padding: 10,
        textAlign: 'center',
    },
});
