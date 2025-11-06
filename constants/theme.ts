import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Define the font families we loaded
const fonts = {
  regular: 'Inter_400Regular',
  bold: 'Inter_700Bold',
};

// A complete font scale for react-native-paper
const fontConfig = {
  displayLarge: { fontFamily: fonts.bold },
  displayMedium: { fontFamily: fonts.bold },
  displaySmall: { fontFamily: fonts.bold },
  headlineLarge: { fontFamily: fonts.bold },
  headlineMedium: { fontFamily: fonts.bold },
  headlineSmall: { fontFamily: fonts.bold },
  titleLarge: { fontFamily: fonts.bold },
  titleMedium: { fontFamily: fonts.bold },
  titleSmall: { fontFamily: fonts.regular },
  labelLarge: { fontFamily: fonts.bold },
  labelMedium: { fontFamily: fonts.bold },
  labelSmall: { fontFamily: fonts.regular },
  bodyLarge: { fontFamily: fonts.regular },
  bodyMedium: { fontFamily: fonts.regular },
  bodySmall: { fontFamily: fonts.regular },
};

// Create the light theme with a modern purple and teal palette
export const lightTheme = {
  ...MD3LightTheme,
  roundness: 8,
  fonts: fontConfig,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5E35B1', // Deep Purple
    accent: '#00BFA5',   // Teal Accent
    background: '#F7F9FC',
    surface: '#FFFFFF',
    onSurface: '#1C1B1F',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
    success: '#4CAF50', // Green for success
    onSuccess: '#FFFFFF',
    successContainer: '#B9F6CA',
    onSuccessContainer: '#1B5E20',
  },
  shadows: {
    // Define custom shadows if needed, or rely on Paper's elevation
    // This is more for direct boxShadow usage on web
    small: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0px 10px 15px rgba(0, 0, 0, 0.1)',
  },
};

// Create the dark theme with a modern purple and teal palette
export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 8,
  fonts: fontConfig,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF', // Light Purple for dark mode
    accent: '#A0F0E0',   // Light Teal for dark mode
    background: '#1C1B1F',
    surface: '#2C2C2E',
    onSurface: '#E6E1E5',
    primaryContainer: '#4A4458',
    onPrimaryContainer: '#EADDFF',
    success: '#66BB6A', // Lighter green for dark mode success
    onSuccess: '#FFFFFF',
    successContainer: '#388E3C',
    onSuccessContainer: '#FFFFFF',
  },
  shadows: {
    small: '0px 1px 3px rgba(0, 0, 0, 0.2)',
    medium: '0px 4px 6px rgba(0, 0, 0, 0.2)',
    large: '0px 10px 15px rgba(0, 0, 0, 0.2)',
  },
};
