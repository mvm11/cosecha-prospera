import { useState } from 'react';
import { supabase } from '../../../core/supabase';

export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

export function useAIAnalysis() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeMarket = async () => {
        try {
            setLoading(true);
            setError(null);

            // Add user message placeholder (optional, since this is a "one-click" analysis initially)
            // But for a chat interface, we might want to show "Analyzing..."

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('User not authenticated');

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/analyze-coffee-market`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}), // No input needed, context is fetched server-side
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze market');
            }

            // Add AI response
            const aiMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.recommendation,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
            return { success: true, data: data.recommendation };

        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
        setError(null);
    };

    return {
        messages,
        loading,
        error,
        analyzeMarket,
        clearMessages
    };
}
