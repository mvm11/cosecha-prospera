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
                        <Text style={styles.welcomeTitle}>🤖 AI Coffee Advisor</Text>
                        <Text style={styles.welcomeText}>
                            I can analyze market trends, your sales history, and your farm profile to give you personalized advice.
                        </Text>
                        <TouchableOpacity
                            style={styles.analyzeButton}
                            onPress={analyzeMarket}
                        >
                            <Text style={styles.analyzeButtonText}>Start Analysis</Text>
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
                            {msg.role === 'assistant' ? '🤖 AI Advisor' : '👤 You'}
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
                        <ActivityIndicator size="large" color="#27ae60" />
                        <Text style={styles.loadingText}>Analyzing market data...</Text>
                        <Text style={styles.loadingSubText}>Checking prices, trends, and your history</Text>
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
                            <Text style={styles.retryButtonText}>Retry</Text>
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
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 60,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 2,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2c3e50',
    },
    welcomeText: {
        textAlign: 'center',
        color: '#7f8c8d',
        fontSize: 16,
        marginBottom: 20,
        lineHeight: 24,
    },
    analyzeButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 3,
    },
    analyzeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageBubble: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        maxWidth: '100%',
        elevation: 1,
    },
    aiBubble: {
        backgroundColor: 'white',
        borderTopLeftRadius: 5,
    },
    userBubble: {
        backgroundColor: '#dff9fb',
        alignSelf: 'flex-end',
        borderTopRightRadius: 5,
    },
    roleLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#95a5a6',
        marginBottom: 5,
    },
    messageText: {
        fontSize: 16,
        color: '#2c3e50',
        lineHeight: 24,
    },
    timestamp: {
        fontSize: 10,
        color: '#bdc3c7',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    loadingSubText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 5,
    },
    errorContainer: {
        padding: 15,
        backgroundColor: '#ffeaa7',
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    errorText: {
        color: '#d35400',
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#d35400',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 15,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 16,
        color: '#2c3e50',
        lineHeight: 24,
    },
    heading1: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#2c3e50',
    },
    heading2: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#2c3e50',
    },
    strong: {
        fontWeight: 'bold',
    },
    list_item: {
        marginVertical: 5,
    },
});
