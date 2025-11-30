import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../constants/theme';
import { supabase } from '../../../core/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert('Error', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Éxito', '¡Por favor revisa tu correo para verificar tu cuenta!');
        }
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Cosecha Próspera</Text>
                <Text style={styles.tagline}>Cultiva mejores resultados</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.subtitle}>
                    {isRegistering ? 'Crear cuenta' : 'Bienvenido'}
                </Text>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Correo</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="correo@gmail.com"
                            placeholderTextColor={Colors.inputPlaceholder}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••••••••••••••••••••••"
                            placeholderTextColor={Colors.inputPlaceholder}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {!isRegistering && (
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>
                    )}

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
                    ) : (
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={isRegistering ? signUpWithEmail : signInWithEmail}
                        >
                            <Text style={styles.primaryButtonText}>
                                {isRegistering ? 'Registrarse' : 'Iniciar sesión'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>
                            {isRegistering ? '¿Ya tienes cuenta? ' : '¿No tienes una cuenta? '}
                        </Text>
                        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                            <Text style={styles.switchLink}>
                                {isRegistering ? 'Inicia sesión' : 'Regístrate'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    title: {
        fontSize: FontSizes.huge,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    tagline: {
        fontSize: FontSizes.base,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        ...Shadows.medium,
    },
    subtitle: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
        textAlign: 'center',
    },
    form: {
        gap: Spacing.base,
    },
    inputContainer: {
        gap: Spacing.sm,
    },
    label: {
        fontSize: FontSizes.base,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
    },
    input: {
        borderWidth: 2,
        borderColor: Colors.inputBorder,
        backgroundColor: Colors.inputBackground,
        padding: Spacing.base,
        borderRadius: BorderRadius.md,
        fontSize: FontSizes.base,
        color: Colors.text,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        textDecorationLine: 'underline',
    },
    loader: {
        marginVertical: Spacing.lg,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
        ...Shadows.small,
    },
    primaryButtonText: {
        color: Colors.textOnPrimary,
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    switchText: {
        color: Colors.textMuted,
        fontSize: FontSizes.sm,
    },
    switchLink: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
});
