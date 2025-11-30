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
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../constants/theme';
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
            Alert.alert('Error', 'Por favor selecciona un departamento');
            return;
        }
        if (!hectares || isNaN(parseFloat(hectares)) || parseFloat(hectares) <= 0) {
            Alert.alert('Error', 'Por favor ingresa un número válido de hectáreas');
            return;
        }
        if (!variety) {
            Alert.alert('Error', 'Por favor selecciona una variedad de café');
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
            Alert.alert('Éxito', 'Perfil actualizado exitosamente');
        } else {
            Alert.alert('Error', result.error || 'Error al actualizar perfil');
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
                            <Text style={styles.closeButton}>Cerrar</Text>
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
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    const isEditing = !!profile;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>{isEditing ? 'Editar perfil' : 'Crear perfil'}</Text>
            <Text style={styles.subHeader}>
                {isEditing
                    ? 'Actualiza los detalles de tu cultivo y ubicación para obtener mejores recomendaciones'
                    : 'Completa tu perfil para recibir recomendaciones personalizadas'}
            </Text>

            {/* Region Selection */}
            <View style={styles.field}>
                <Text style={styles.label}>Departamento</Text>
                <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowRegionModal(true)}
                >
                    <Text style={region ? styles.selectorText : styles.placeholderText}>
                        {region || 'Selecciona tu departamento'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Hectares Input */}
            <View style={styles.field}>
                <Text style={styles.label}>Tamaño (Hectáreas)</Text>
                <TextInput
                    style={styles.input}
                    value={hectares}
                    onChangeText={setHectares}
                    placeholder="ej. 5.5"
                    placeholderTextColor={Colors.inputPlaceholder}
                    keyboardType="numeric"
                />
            </View>

            {/* Variety Selection */}
            <View style={styles.field}>
                <Text style={styles.label}>Variedad de café</Text>
                <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowVarietyModal(true)}
                >
                    <Text style={variety ? styles.selectorText : styles.placeholderText}>
                        {variety || 'Selecciona variedad'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
            >
                <Text style={styles.saveButtonText}>
                    {saving ? 'Guardando...' : (isEditing ? 'Actualizar perfil' : 'Crear perfil')}
                </Text>
            </TouchableOpacity>

            {/* Modals */}
            {renderSelectionModal(
                showRegionModal,
                () => setShowRegionModal(false),
                'Seleccionar Departamento',
                COLOMBIAN_DEPARTMENTS,
                setRegion
            )}
            {renderSelectionModal(
                showVarietyModal,
                () => setShowVarietyModal(false),
                'Seleccionar Variedad',
                COFFEE_VARIETIES,
                setVariety
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        backgroundColor: Colors.background,
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        fontSize: FontSizes.base,
        color: Colors.textMuted,
    },
    header: {
        fontSize: FontSizes.xxxl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        marginBottom: Spacing.md,
        marginTop: Spacing.xxxl,
    },
    subHeader: {
        fontSize: FontSizes.base,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
        lineHeight: 24,
    },
    field: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.base,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    input: {
        borderWidth: 2,
        borderColor: Colors.inputBorder,
        borderRadius: BorderRadius.md,
        padding: Spacing.base,
        fontSize: FontSizes.base,
        backgroundColor: Colors.inputBackground,
        color: Colors.text,
    },
    selector: {
        borderWidth: 2,
        borderColor: Colors.inputBorder,
        borderRadius: BorderRadius.md,
        padding: Spacing.base,
        backgroundColor: Colors.inputBackground,
    },
    selectorText: {
        fontSize: FontSizes.base,
        color: Colors.text,
    },
    placeholderText: {
        fontSize: FontSizes.base,
        color: Colors.inputPlaceholder,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: Spacing.lg,
        ...Shadows.medium,
    },
    disabledButton: {
        backgroundColor: Colors.textMuted,
    },
    saveButtonText: {
        color: Colors.textOnPrimary,
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.backgroundCard,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.base,
        borderBottomWidth: 2,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    closeButton: {
        color: Colors.error,
        fontSize: FontSizes.base,
        fontWeight: FontWeights.semibold,
    },
    modalItem: {
        paddingVertical: Spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    modalItemText: {
        fontSize: FontSizes.lg,
        color: Colors.text,
    },
});
