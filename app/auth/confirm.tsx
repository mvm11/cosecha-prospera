import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../constants/theme';

export default function ConfirmScreen() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando tu cuenta...');

    useEffect(() => {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;

            // Check if there's an access_token in the URL hash (successful confirmation)
            if (hash && hash.includes('access_token')) {
                setStatus('success');
                setMessage('¡Cuenta verificada con éxito! Redirigiendo al inicio...');

                // Redirect to main app after 3 seconds
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 3000);
            } else if (hash && hash.includes('error')) {
                // Handle error case
                setStatus('error');
                setMessage('Error al verificar la cuenta. El enlace puede haber expirado. Por favor intenta registrarte nuevamente.');

                // Redirect to login after 5 seconds
                setTimeout(() => {
                    router.replace('/auth/login');
                }, 5000);
            } else {
                // No token found, likely invalid URL
                setStatus('error');
                setMessage('Enlace de confirmación inválido. Por favor verifica tu correo e intenta nuevamente.');

                setTimeout(() => {
                    router.replace('/auth/login');
                }, 5000);
            }
        }
    }, [router]);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Cosecha Próspera</Text>

                {status === 'loading' && (
                    <>
                        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
                        <Text style={styles.message}>{message}</Text>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <Text style={styles.emoji}>✅</Text>
                        <Text style={styles.successMessage}>{message}</Text>
                        <Text style={styles.submessage}>
                            ¡Bienvenido a la comunidad de caficultores!
                        </Text>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <Text style={styles.emoji}>⚠️</Text>
                        <Text style={styles.errorMessage}>{message}</Text>
                    </>
                )}
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
    card: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xxl,
        alignItems: 'center',
        ...Shadows.medium,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        marginBottom: Spacing.xl,
        textAlign: 'center',
    },
    loader: {
        marginVertical: Spacing.xl,
    },
    emoji: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    message: {
        fontSize: FontSizes.lg,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.base,
    },
    successMessage: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.semibold,
        color: Colors.success,
        textAlign: 'center',
        marginBottom: Spacing.base,
    },
    submessage: {
        fontSize: FontSizes.base,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    errorMessage: {
        fontSize: FontSizes.lg,
        color: Colors.error,
        textAlign: 'center',
        marginTop: Spacing.base,
    },
});
