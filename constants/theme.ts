/**
 * Sistema de diseño para Cosecha Próspera
 * Paleta de colores cálida y agrícola inspirada en el café colombiano
 */

import { Platform } from 'react-native';

// Paleta de colores principal
export const CoffeeColors = {
  // Colores base de la paleta
  lightGold: '#F0D394',      // Dorado claro - fondos secundarios, elementos destacados
  mediumBrown: '#98651E',    // Marrón medio - botones primarios, acentos
  darkBrown: '#6E4B1F',      // Marrón oscuro - texto principal, headers
  veryDarkBrown: '#533710',  // Marrón muy oscuro - texto en fondos claros
  lightBeige: '#F7DCB7',     // Beige claro - fondos principales, cards

  // Colores complementarios
  white: '#FFFFFF',
  black: '#000000',

  // Estados y feedback
  success: '#27ae60',        // Verde para éxito
  error: '#e74c3c',          // Rojo para errores
  warning: '#f39c12',        // Naranja para advertencias
  info: '#3498db',           // Azul para información

  // Neutrales derivados
  lightGray: '#f5f5f5',
  mediumGray: '#bdc3c7',
  darkGray: '#7f8c8d',
};

// Colores semánticos para uso en la app (estructura light/dark)
export const Colors = {
  light: {
    // Fondos
    background: CoffeeColors.lightBeige,
    backgroundSecondary: CoffeeColors.lightGold,
    backgroundCard: CoffeeColors.white,

    // Texto
    text: CoffeeColors.veryDarkBrown,
    textSecondary: CoffeeColors.darkBrown,
    textMuted: CoffeeColors.darkGray,
    textOnPrimary: CoffeeColors.white,

    // Botones
    primary: CoffeeColors.mediumBrown,
    primaryDark: CoffeeColors.darkBrown,
    primaryLight: CoffeeColors.lightGold,

    // Bordes
    border: CoffeeColors.lightGold,
    borderLight: CoffeeColors.lightBeige,

    // Estados
    success: CoffeeColors.success,
    error: CoffeeColors.error,
    warning: CoffeeColors.warning,
    info: CoffeeColors.info,

    // Navigation
    tabBarBackground: CoffeeColors.lightBeige,
    tabBarActive: CoffeeColors.mediumBrown,
    tabBarInactive: CoffeeColors.darkGray,

    // Inputs
    inputBackground: CoffeeColors.white,
    inputBorder: CoffeeColors.mediumBrown,
    inputPlaceholder: CoffeeColors.darkGray,

    // Icons
    icon: CoffeeColors.mediumBrown,
  },
  dark: {
    // Fondos
    background: CoffeeColors.veryDarkBrown,
    backgroundSecondary: CoffeeColors.darkBrown,
    backgroundCard: CoffeeColors.mediumBrown,

    // Texto
    text: CoffeeColors.lightBeige,
    textSecondary: CoffeeColors.lightGold,
    textMuted: CoffeeColors.mediumGray,
    textOnPrimary: CoffeeColors.white,

    // Botones
    primary: CoffeeColors.lightGold,
    primaryDark: CoffeeColors.mediumBrown,
    primaryLight: CoffeeColors.lightBeige,

    // Bordes
    border: CoffeeColors.mediumBrown,
    borderLight: CoffeeColors.darkBrown,

    // Estados
    success: CoffeeColors.success,
    error: CoffeeColors.error,
    warning: CoffeeColors.warning,
    info: CoffeeColors.info,

    // Navigation
    tabBarBackground: CoffeeColors.veryDarkBrown,
    tabBarActive: CoffeeColors.lightGold,
    tabBarInactive: CoffeeColors.mediumGray,

    // Inputs
    inputBackground: CoffeeColors.darkBrown,
    inputBorder: CoffeeColors.lightGold,
    inputPlaceholder: CoffeeColors.mediumGray,

    // Icons
    icon: CoffeeColors.lightGold,
  },
  // Backward compatibility - flat export defaults to light theme
  ...{
    background: CoffeeColors.lightBeige,
    backgroundSecondary: CoffeeColors.lightGold,
    backgroundCard: CoffeeColors.white,
    text: CoffeeColors.veryDarkBrown,
    textSecondary: CoffeeColors.darkBrown,
    textMuted: CoffeeColors.darkGray,
    textOnPrimary: CoffeeColors.white,
    primary: CoffeeColors.mediumBrown,
    primaryDark: CoffeeColors.darkBrown,
    primaryLight: CoffeeColors.lightGold,
    border: CoffeeColors.lightGold,
    borderLight: CoffeeColors.lightBeige,
    success: CoffeeColors.success,
    error: CoffeeColors.error,
    warning: CoffeeColors.warning,
    info: CoffeeColors.info,
    tabBarBackground: CoffeeColors.lightBeige,
    tabBarActive: CoffeeColors.mediumBrown,
    tabBarInactive: CoffeeColors.darkGray,
    inputBackground: CoffeeColors.white,
    inputBorder: CoffeeColors.mediumBrown,
    inputPlaceholder: CoffeeColors.darkGray,
  },
};

// Tokens de spacing (en pixels)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Border radius tokens
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

// Tamaños de fuente
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
};

// Font weights
export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Sombras
export const Shadows = {
  small: {
    shadowColor: CoffeeColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: CoffeeColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: CoffeeColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Fuentes del sistema
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
