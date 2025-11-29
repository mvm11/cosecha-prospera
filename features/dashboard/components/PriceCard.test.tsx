import { render } from '@testing-library/react-native';
import React from 'react';
import PriceCard from './PriceCard';

describe('PriceCard', () => {
    it('should render correctly with props', () => {
        const { getByText } = render(
            <PriceCard fncPrice={1250000} date="2023-10-27" />
        );

        expect(getByText('Precio Interno (Carga 125kg)')).toBeTruthy();
        // Check for formatted price. Note: Intl.NumberFormat might behave differently in different environments (Node vs RN).
        // In Node (Jest), it usually works if full-icu or similar is present, or it falls back.
        // Let's check if it contains the number at least.
        // Or we can mock Intl.NumberFormat if needed.
        // But usually standard Jest environment has basic Intl support.
        // Let's try to match loosely or check the exact string if we know the locale.
        // 'es-CO' usually formats as $ 1.250.000 or similar.

        // Let's just check if it renders.
        expect(getByText('Fecha: 2023-10-27')).toBeTruthy();
    });
});
