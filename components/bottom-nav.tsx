// frontend/components/BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Home, Search, ShoppingBag, Heart, User, Shield } from "lucide-react-native";
import { COLORS } from './home-page/constants';
import { useRouter, usePathname } from 'expo-router';

export function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/(tabs)/' },
        { id: 'search', label: 'Search', icon: Search, path: '/(tabs)/search' },
        { id: 'bag', label: 'Bag', icon: ShoppingBag, path: '/(tabs)/bag', isCentral: true },
        { id: 'favorites', label: 'Favorites', icon: Heart, path: '/(tabs)/favorites' },
        { id: 'admin', label: 'Admin', icon: Shield, path: '/(admin)/' }, // <<< TUTAJ JEST WPIS DLA ADMINA
    ];

    const isActive = (itemPath: string) => {
        if (itemPath === '/(tabs)/') {
            return pathname === itemPath || pathname === '/';
        }
        // Dla ścieżek admina, isActive może nie być potrzebne w ten sam sposób,
        // ale zostawmy ogólną logikę na razie.
        return pathname.startsWith(itemPath);
    };

    return (
        <View style={styles.container}>
            {navItems.map((item) => {
                const active = isActive(item.path);
                // Jeśli item.path to '/(admin)/', active będzie true tylko gdy jesteś w sekcji admina.
                // Na stronie głównej (np. '/(tabs)/'), dla przycisku Admin, 'active' będzie false.
                const iconColor = active && item.path !== '/(admin)/' ? COLORS.accent : COLORS.textSecondary;
                const textColor = active && item.path !== '/(admin)/' ? COLORS.accent : COLORS.textSecondary;

                if (item.isCentral) {
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.centralNavItem}
                            onPress={() => router.push(item.path as any)}
                        >
                            <ShoppingBag size={28} color={COLORS.white} />
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.navItem}
                        onPress={() => router.push(item.path as any)}
                    >
                        <item.icon size={24} color={iconColor} />
                        <Text style={[styles.navText, { color: textColor, fontWeight: active && item.path !== '/(admin)/' ? "600" : "normal" }]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: COLORS.cardBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: Platform.OS === "ios" ? 15 : 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
    },
    navItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
    },
    centralNavItem: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        bottom: 25,
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    navText: {
        fontSize: 11,
        marginTop: 4,
    },
});
