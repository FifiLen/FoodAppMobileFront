// frontend/components/home-page/constants.ts (or wherever your constants are)

export const COLORS = {
    // Kolory podstawowe
    primary: "#A3D69D",
    primaryLight: "#C5E8C1",
    primaryDark: "#82B47C",

    // Kolory akcentujące
    secondary: "#FFE566",
    secondaryLight: "#FFF0A3",
    accent: "#5F7161",

    // Tła i karty
    background: "#F8F8F8",
    cardBackground: "#FFFFFF",
    surfaceVariant: "#F2F7F2",
    // NOWE: Dodane brakujące kolory tła
    secondaryBackground: "#E8F5E9", // Jaśniejszy, stonowany zielony, pasujący do primary
    backgroundSlightlyDarker: "#F0F0F0", // Trochę ciemniejszy niż główny background

    // Typografia
    textPrimary: "#333333",
    textSecondary: "#666666",
    textLight: "#999999",
    textOnPrimary: "#FFFFFF",

    // Granice i cienie
    border: "#EEEEEE",
    shadow: "rgba(0, 0, 0, 0.1)",

    // Stany i informacje
    success: "#4CAF50",
    danger: "#E74C3C",
    // NOWE: Dodany brakujący kolor dangerLight
    dangerLight: "#FDECEA", // Jasnoczerwony dla tła błędów
    warning: "#F39C12",
    info: "#3498DB",

    // Kolory pomocnicze
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",

    // Kolory dla kategorii jedzenia (opcjonalnie)
    categoryPizza: "#FF9F43",
    categoryBurger: "#FC5C65",
    categorySushi: "#2C3E50",
    categoryVegan: "#26de81",
    categoryDessert: "#D980FA",
};

// Stałe dla spójnego odstępu
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Stałe dla spójnych rozmiarów czcionek
export const FONT_SIZE = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Stałe dla zaokrągleń
export const BORDER_RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
};

// Stałe dla cieni
export const SHADOWS = {
    small: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};
