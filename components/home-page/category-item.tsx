// frontend/components/home-page/category-item.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from './constants'; // Upewnij się, że ścieżka jest poprawna

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface CategoryItemProps { // Ten interfejs jest używany przez ten komponent
    item: Category;
    isActive: boolean; // Oczekujemy tego propsa
    onPress: () => void;
}

export function CategoryItem({ item, isActive, onPress }: CategoryItemProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
        >
            <View
                style={[
                    styles.iconContainer,
                    isActive ? styles.iconContainerActive : styles.iconContainerInactive
                ]}
            >
                <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <Text
                style={[
                    styles.nameText,
                    isActive ? styles.nameTextActive : styles.nameTextInactive
                ]}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: 12,
        alignItems: "center",
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainerActive: {
        backgroundColor: COLORS.primary,
    },
    iconContainerInactive: {
        backgroundColor: COLORS.cardBackground,
    },
    iconText: {
        fontSize: 24,
    },
    nameText: {
        fontSize: 12,
    },
    nameTextActive: {
        fontWeight: "600",
        color: COLORS.accent,
    },
    nameTextInactive: {
        fontWeight: "400",
        color: COLORS.textSecondary,
    }
});
