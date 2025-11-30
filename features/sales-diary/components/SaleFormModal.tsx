import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../constants/theme';

type SaleFormModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { date: string; total_amount: number; kilograms_sold: number }) => Promise<{ success: boolean; error?: string }>;
    initialData?: {
        id: number;
        date: string;
        total_amount: number;
        kilograms_sold: number;
    };
};

export default function SaleFormModal({ visible, onClose, onSave, initialData }: SaleFormModalProps) {
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date) : new Date());
    const [amount, setAmount] = useState(initialData?.total_amount?.toString() || '');
    const [kilograms, setKilograms] = useState(initialData?.kilograms_sold?.toString() || '');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<{ date?: string; amount?: string; kilograms?: string }>({});
    const [saving, setSaving] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: { date?: string; amount?: string; kilograms?: string } = {};

        // Validate date (must not be in the future)
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (date > today) {
            newErrors.date = 'La fecha no puede ser futura';
        }

        // Validate amount (must be a positive number)
        const numAmount = parseFloat(amount);
        if (!amount || amount.trim() === '') {
            newErrors.amount = 'El monto es requerido';
        } else if (isNaN(numAmount)) {
            newErrors.amount = 'El monto debe ser un número válido';
        } else if (numAmount <= 0) {
            newErrors.amount = 'El monto debe ser mayor a cero';
        }

        // Validate kilograms (must be a positive number)
        const numKilograms = parseFloat(kilograms);
        if (!kilograms || kilograms.trim() === '') {
            newErrors.kilograms = 'Los kilogramos son requeridos';
        } else if (isNaN(numKilograms)) {
            newErrors.kilograms = 'Los kilogramos deben ser un número válido';
        } else if (numKilograms <= 0) {
            newErrors.kilograms = 'Los kilogramos deben ser mayor a cero';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        const numAmount = parseFloat(amount);
        const numKilograms = parseFloat(kilograms);
        const dateString = date.toISOString().split('T')[0];

        const result = await onSave({
            date: dateString,
            total_amount: numAmount,
            kilograms_sold: numKilograms,
        });

        setSaving(false);

        if (result.success) {
            // Reset form
            setDate(new Date());
            setAmount('');
            setKilograms('');
            setErrors({});
            onClose();
        } else {
            Alert.alert('Error', result.error || 'Error al guardar la venta');
        }
    };

    const handleCancel = () => {
        setDate(initialData?.date ? new Date(initialData.date) : new Date());
        setAmount(initialData?.total_amount?.toString() || '');
        setKilograms(initialData?.kilograms_sold?.toString() || '');
        setErrors({});
        onClose();
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
            setErrors({ ...errors, date: undefined });
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>{initialData ? 'Editar Venta' : 'Agregar Venta'}</Text>

                    {/* Date Field */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Fecha *</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, errors.date && styles.inputError]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>
                                {date.toLocaleDateString('es-CO', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Text>
                        </TouchableOpacity>
                        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    {/* Amount Field */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Monto Total (COP) *</Text>
                        <TextInput
                            style={[styles.input, errors.amount && styles.inputError]}
                            value={amount}
                            onChangeText={(text) => {
                                setAmount(text);
                                setErrors({ ...errors, amount: undefined });
                            }}
                            placeholder="ej. 1890000"
                            placeholderTextColor={Colors.inputPlaceholder}
                            keyboardType="numeric"
                        />
                        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                    </View>

                    {/* Kilograms Field */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Kilogramos Vendidos *</Text>
                        <TextInput
                            style={[styles.input, errors.kilograms && styles.inputError]}
                            value={kilograms}
                            onChangeText={(text) => {
                                setKilograms(text);
                                setErrors({ ...errors, kilograms: undefined });
                            }}
                            placeholder="ej. 125"
                            placeholderTextColor={Colors.inputPlaceholder}
                            keyboardType="numeric"
                        />
                        {errors.kilograms && <Text style={styles.errorText}>{errors.kilograms}</Text>}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                            disabled={saving}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        width: '90%',
        maxWidth: 400,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        marginBottom: Spacing.lg,
        color: Colors.text,
    },
    field: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
        marginBottom: Spacing.sm,
        color: Colors.text,
    },
    input: {
        borderWidth: 2,
        borderColor: Colors.inputBorder,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSizes.base,
        backgroundColor: Colors.inputBackground,
        color: Colors.text,
    },
    inputError: {
        borderColor: Colors.error,
    },
    dateButton: {
        borderWidth: 2,
        borderColor: Colors.inputBorder,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        backgroundColor: Colors.inputBackground,
    },
    dateText: {
        fontSize: FontSizes.base,
        color: Colors.text,
    },
    errorText: {
        color: Colors.error,
        fontSize: FontSizes.xs,
        marginTop: Spacing.xs,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.md,
        marginTop: Spacing.md,
    },
    button: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelButtonText: {
        color: Colors.text,
        fontWeight: FontWeights.semibold,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        ...Shadows.small,
    },
    saveButtonText: {
        color: Colors.textOnPrimary,
        fontWeight: FontWeights.semibold,
    },
});
