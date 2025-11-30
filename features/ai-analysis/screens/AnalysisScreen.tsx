import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { BorderRadius, CoffeeColors, Colors, FontSizes, FontWeights, Shadows, Spacing } from '../../../constants/theme';
import { useAIAnalysis } from '../hooks/useAIAnalysis';

export default function AnalysisScreen() {
    const { messages, loading, error, analyzeMarket } = useAIAnalysis();
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, loading]);

    // Initial analysis on mount (optional, or wait for user click)
    // Let's wait for user click to give them control

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Welcome Message */}
                {messages.length === 0 && !loading && (
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>🤖 Asesor de Café IA</Text>
                        <Text style={styles.welcomeText}>
                            Puedo analizar tendencias del mercado, tu historial de ventas y tu perfil para darte consejos personalizados.
                        </Text>
                        <TouchableOpacity
                            style={styles.analyzeButton}
                            onPress={analyzeMarket}
                        >
                            <Text style={styles.analyzeButtonText}>Iniciar análisis</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Chat Messages */}
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.messageBubble,
                            msg.role === 'assistant' ? styles.aiBubble : styles.userBubble
                        ]}
                    >
                        <Text style={styles.roleLabel}>
                            {msg.role === 'assistant' ? '🤖 Asesor IA' : '👤 Tú'}
                        </Text>

                        {msg.role === 'assistant' ? (
                            <Markdown style={markdownStyles}>
                                {msg.content}
                            </Markdown>
                        ) : (
                            <Text style={styles.messageText}>{msg.content}</Text>
                        )}

                        <Text style={styles.timestamp}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                ))}

                {/* Loading State */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Analizando datos del mercado...</Text>
                        <Text style={styles.loadingSubText}>Revisando precios, tendencias y tu historial</Text>
                    </View>
                )}

                {/* Error State */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>❌ {error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={analyzeMarket}
                        >
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxl,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: Spacing.xxxl,
        padding: Spacing.xl,
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        ...Shadows.medium,
    },
    welcomeTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        marginBottom: Spacing.md,
        color: Colors.text,
    },
    welcomeText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        fontSize: FontSizes.base,
        marginBottom: Spacing.lg,
        lineHeight: 24,
    },
    analyzeButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.base,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        ...Shadows.medium,
    },
    analyzeButtonText: {
        color: Colors.textOnPrimary,
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
    },
    messageBubble: {
        padding: Spacing.base,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.base,
        maxWidth: '100%',
        ...Shadows.small,
    },
    aiBubble: {
        backgroundColor: Colors.backgroundSecondary,
        borderTopLeftRadius: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    userBubble: {
        backgroundColor: CoffeeColors.lightBeige,
        alignSelf: 'flex-end',
        borderTopRightRadius: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    roleLabel: {
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    messageText: {
        fontSize: FontSizes.base,
        color: Colors.text,
        lineHeight: 24,
    },
    timestamp: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        alignSelf: 'flex-end',
        marginTop: Spacing.xs,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: Spacing.lg,
        backgroundColor: Colors.backgroundCard,
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: FontSizes.base,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
    },
    loadingSubText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    errorContainer: {
        padding: Spacing.base,
        backgroundColor: '#ffeaa7',
        borderRadius: BorderRadius.md,
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    errorText: {
        color: Colors.error,
        marginBottom: Spacing.md,
        fontSize: FontSizes.base,
    },
    retryButton: {
        backgroundColor: Colors.error,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        color: Colors.textOnPrimary,
        fontWeight: FontWeights.semibold,
    },
});

const markdownStyles = StyleSheet.create({
    body: {
        fontSize: FontSizes.base,
        color: Colors.text,
        lineHeight: 24,
    },
    heading1: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
        color: Colors.text,
    },
    heading2: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
        color: Colors.text,
    },
    strong: {
        fontWeight: FontWeights.bold,
    },
    list_item: {
        marginVertical: Spacing.xs,
    },
});
