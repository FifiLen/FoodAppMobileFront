// Paleta kolorów dla aplikacji FoodApp
// Zoptymalizowana dla lepszej czytelności i spójności wizualnej

export const COLORS = {
    // Kolory podstawowe
    primary: "#A3D69D", // Główny zielony kolor marki
    primaryLight: "#C5E8C1", // Jaśniejsza wersja koloru primary
    primaryDark: "#82B47C", // Ciemniejsza wersja koloru primary

    // Kolory akcentujące
    secondary: "#FFE566", // Żółty akcent
    secondaryLight: "#FFF0A3", // Jaśniejsza wersja koloru secondary
    accent: "#5F7161", // Ciemniejszy zielony/szary dla akcentów

    // Tła i karty
    background: "#F8F8F8", // Jasne tło aplikacji
    cardBackground: "#FFFFFF", // Białe tło kart i elementów
    surfaceVariant: "#F2F7F2", // Alternatywne tło dla sekcji

    // Typografia
    textPrimary: "#333333", // Główny kolor tekstu
    textSecondary: "#666666", // Drugorzędny kolor tekstu
    textLight: "#999999", // Jasnoszary tekst dla mniej ważnych informacji
    textOnPrimary: "#FFFFFF", // Tekst na tle primary

    // Granice i cienie
    border: "#EEEEEE", // Kolor granic i separatorów
    shadow: "rgba(0, 0, 0, 0.1)", // Kolor cieni

    // Stany i informacje
    success: "#4CAF50", // Zielony dla powodzeń (zbliżony do primary, ale bardziej standardowy)
    danger: "#E74C3C", // Czerwony dla błędów i alertów
    warning: "#F39C12", // Pomarańczowy dla ostrzeżeń
    info: "#3498DB", // Niebieski dla informacji

    // Kolory pomocnicze
    white: "#FFFFFF", // Czysty biały
    black: "#000000", // Czysty czarny
    transparent: "transparent", // Przezroczysty

    // Kolory dla kategorii jedzenia (opcjonalnie)
    categoryPizza: "#FF9F43", // Pomarańczowy dla pizzy
    categoryBurger: "#FC5C65", // Czerwonawy dla burgerów
    categorySushi: "#2C3E50", // Ciemny dla sushi
    categoryVegan: "#26de81", // Zielony dla wegańskich
    categoryDessert: "#D980FA", // Fioletowy dla deserów
}

// Stałe dla spójnego odstępu
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
}

// Stałe dla spójnych rozmiarów czcionek
export const FONT_SIZE = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
}

// Stałe dla zaokrągleń
export const BORDER_RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999, // Dla okrągłych elementów
}

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
}
