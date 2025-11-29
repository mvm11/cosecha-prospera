import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import AnalysisScreen from './AnalysisScreen';

// Mock the hook
jest.mock('../hooks/useAIAnalysis');

describe('AnalysisScreen', () => {
    const mockAnalyzeMarket = jest.fn();
    const mockClearMessages = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAIAnalysis as jest.Mock).mockReturnValue({
            messages: [],
            loading: false,
            error: null,
            analyzeMarket: mockAnalyzeMarket,
            clearMessages: mockClearMessages,
        });
    });

    it('should render correctly', () => {
        const { getByText } = render(<AnalysisScreen />);
        expect(getByText('🤖 AI Coffee Advisor')).toBeTruthy();
    });

    it('should call analyzeMarket when button is pressed', () => {
        const { getByText } = render(<AnalysisScreen />);
        const button = getByText('Start Analysis');
        fireEvent.press(button);
        expect(mockAnalyzeMarket).toHaveBeenCalled();
    });

    it('should display loading state', () => {
        (useAIAnalysis as jest.Mock).mockReturnValue({
            messages: [],
            loading: true,
            error: null,
            analyzeMarket: mockAnalyzeMarket,
            clearMessages: mockClearMessages,
        });

        const { getByText } = render(<AnalysisScreen />);
        expect(getByText('Analyzing market data...')).toBeTruthy();
    });

    it('should display error message', () => {
        (useAIAnalysis as jest.Mock).mockReturnValue({
            messages: [],
            loading: false,
            error: 'Something went wrong',
            analyzeMarket: mockAnalyzeMarket,
            clearMessages: mockClearMessages,
        });

        const { getByText } = render(<AnalysisScreen />);
        expect(getByText('❌ Something went wrong')).toBeTruthy();
    });

    it('should display messages', () => {
        (useAIAnalysis as jest.Mock).mockReturnValue({
            messages: [
                { id: '1', role: 'assistant', content: 'Market is good', timestamp: new Date() },
            ],
            loading: false,
            error: null,
            analyzeMarket: mockAnalyzeMarket,
            clearMessages: mockClearMessages,
        });

        const { getByText } = render(<AnalysisScreen />);
        expect(getByText('Market is good')).toBeTruthy();
    });
});
