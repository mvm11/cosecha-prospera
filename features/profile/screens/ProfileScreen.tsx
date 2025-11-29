import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COFFEE_VARIETIES, COLOMBIAN_DEPARTMENTS } from '../constants/colombia';
import { useProfile } from '../hooks/useProfile';

export default function ProfileScreen() {
    const { profile, loading, updateProfile } = useProfile();

    const [region, setRegion] = useState('');
    const [hectares, setHectares] = useState('');
    const [variety, setVariety] = useState('');
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showRegionModal, setShowRegionModal] = useState(false);
    const [showVarietyModal, setShowVarietyModal] = useState(false);

    useEffect(() => {
        if (profile) {
            setRegion(profile.region || '');
            setHectares(profile.hectares?.toString() || '');
            setVariety(profile.coffee_variety || '');
        }
    }, [profile]);

    const handleSave = async () => {
        // Validation
        if (!region) {
            Alert.alert('Error', 'Please select a region');
            return;
        }
        if (!hectares || isNaN(parseFloat(hectares)) || parseFloat(hectares) <= 0) {
            Alert.alert('Error', 'Please enter a valid number of hectares');
            return;
        }
        if (!variety) {
            Alert.alert('Error', 'Please select a coffee variety');
            return;
        }

        setSaving(true);
        const result = await updateProfile({
            region,
            hectares: parseFloat(hectares),
            coffee_variety: variety,
        });
        setSaving(false);

        if (result.success) {
            Alert.alert('Success', 'Profile updated successfully');
        } else {
            Alert.alert('Error', result.error || 'Failed to update profile');
        }
    };

    const renderSelectionModal = (
        visible: boolean,
        onClose: () => void,
        title: string,
        data: string[],
        onSelect: (item: string) => void
    ) => (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.modalItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    if (loading && !profile) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading profile...</Text>
            </View>
        );
    }

    const isEditing = !!profile;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>{isEditing ? 'Edit Profile' : 'Create Profile'}</Text>
            <Text style={styles.subHeader}>
                {isEditing
                    ? 'Update your farm details to keep AI recommendations accurate.'
                    : 'Complete your profile to get personalized AI recommendations.'}
            </Text>

            {/* Region Selection */}
            <View style={styles.field}>
                <Text style={styles.label}>Region (Department)</Text>
                <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowRegionModal(true)}
                >
                    <Text style={region ? styles.selectorText : styles.placeholderText}>
                        {region || 'Select Department'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Hectares Input */}
            <View style={styles.field}>
                <Text style={styles.label}>Farm Size (Hectares)</Text>
                <TextInput
                    style={styles.input}
                    value={hectares}
                    onChangeText={setHectares}
                    placeholder="e.g., 5.5"
                    keyboardType="numeric"
                />
            </View>

            {/* Variety Selection */}
            <View style={styles.field}>
                <Text style={styles.label}>Coffee Variety</Text>
                <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowVarietyModal(true)}
                >
                    <Text style={variety ? styles.selectorText : styles.placeholderText}>
                        {variety || 'Select Variety'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
            >
                <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : (isEditing ? 'Update Profile' : 'Create Profile')}
                </Text>
            </TouchableOpacity>

            {/* Modals */}
            {renderSelectionModal(
                showRegionModal,
                () => setShowRegionModal(false),
                'Select Department',
                COLOMBIAN_DEPARTMENTS,
                setRegion
            )}
            {renderSelectionModal(
                showVarietyModal,
                () => setShowVarietyModal(false),
                'Select Variety',
                COFFEE_VARIETIES,
                setVariety
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
        marginTop: 40,
    },
    subHeader: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 30,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#bdc3c7',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    selector: {
        borderWidth: 1,
        borderColor: '#bdc3c7',
        borderRadius: 8,
        padding: 15,
        backgroundColor: '#f9f9f9',
    },
    selectorText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    placeholderText: {
        fontSize: 16,
        color: '#95a5a6',
    },
    saveButton: {
        backgroundColor: '#27ae60',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#95a5a6',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    closeButton: {
        color: '#e74c3c',
        fontSize: 16,
        fontWeight: '600',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalItemText: {
        fontSize: 18,
        color: '#34495e',
    },
});
