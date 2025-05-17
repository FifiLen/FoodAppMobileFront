// frontend/components/BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Home, Store, ShoppingBag, Heart, User as UserIcon } from "lucide-react-native"; // Assuming Store is your chosen icon
import { COLORS } from './home-page/constants'; // Ensure this path is correct
import { useRouter, usePathname } from 'expo-router';

export function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { id: 'glowna', label: 'Główna', icon: Home, path: '/(tabs)/' },
        // ***** MODIFIED LINE *****
        { id: 'restauracje', label: 'Restauracje', icon: Store, path: '/(tabs)/restaurants' },
        { id: 'koszyk', label: 'Koszyk', icon: ShoppingBag, path: '/(tabs)/cart', isCentral: true },
        { id: 'ulubione', label: 'Ulubione', icon: Heart, path: '/(tabs)/favorites' },
        { id: 'konto', label: 'Konto', icon: UserIcon, path: '/(tabs)/profile' },
    ];

    const isActive = (itemPath: string) => {
        if (itemPath === '/(tabs)/' && (pathname === '/(tabs)/' || pathname === '/')) {
            return true;
        }
        if (itemPath !== '/(tabs)/' && itemPath !== '/' && pathname.startsWith(itemPath)) {
            return true;
        }
        return false;
    };

    return (
        <View style={styles.container}>
            {navItems.map((item) => {
                const active = isActive(item.path);
                const IconComponent = item.icon;
                const iconColor = active ? COLORS.accent : COLORS.textSecondary;
                const textColor = active ? COLORS.accent : COLORS.textSecondary;

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
                        <IconComponent size={24} color={iconColor} />
                        <Text style={[styles.navText, { color: textColor, fontWeight: active ? "600" : "normal" }]}>
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
