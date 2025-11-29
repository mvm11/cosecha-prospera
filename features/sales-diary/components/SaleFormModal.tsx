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
            newErrors.date = 'Date cannot be in the future';
        }

        // Validate amount (must be a positive number)
        const numAmount = parseFloat(amount);
        if (!amount || amount.trim() === '') {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(numAmount)) {
            newErrors.amount = 'Amount must be a valid number';
        } else if (numAmount <= 0) {
            newErrors.amount = 'Amount must be greater than zero';
        }

        // Validate kilograms (must be a positive number)
        const numKilograms = parseFloat(kilograms);
        if (!kilograms || kilograms.trim() === '') {
            newErrors.kilograms = 'Kilograms is required';
        } else if (isNaN(numKilograms)) {
            newErrors.kilograms = 'Kilograms must be a valid number';
        } else if (numKilograms <= 0) {
            newErrors.kilograms = 'Kilograms must be greater than zero';
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
            Alert.alert('Error', result.error || 'Failed to save sale');
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
                    <Text style={styles.title}>{initialData ? 'Edit Sale' : 'Add New Sale'}</Text>

                    {/* Date Field */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Date *</Text>
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
                        <Text style={styles.label}>Total Amount (COP) *</Text>
                        <TextInput
                            style={[styles.input, errors.amount && styles.inputError]}
                            value={amount}
                            onChangeText={(text) => {
                                setAmount(text);
                                setErrors({ ...errors, amount: undefined });
                            }}
                            placeholder="e.g., 1890000"
                            keyboardType="numeric"
                        />
                        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                    </View>

                    {/* Kilograms Field */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Kilograms Sold *</Text>
                        <TextInput
                            style={[styles.input, errors.kilograms && styles.inputError]}
                            value={kilograms}
                            onChangeText={(text) => {
                                setKilograms(text);
                                setErrors({ ...errors, kilograms: undefined });
                            }}
                            placeholder="e.g., 125"
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
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
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
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#34495e',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#e74c3c',
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 12,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ecf0f1',
    },
    cancelButtonText: {
        color: '#34495e',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#27ae60',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});
