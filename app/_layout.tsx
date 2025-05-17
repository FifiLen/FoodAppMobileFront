// frontend/app/_layout.tsx
import React, { useEffect, useRef } from "react";
import { Slot, useRouter, usePathname, useSegments, Stack } from "expo-router";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BottomNavigation } from "@/components/bottom-nav";

function AppContentWithNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const segments = useSegments();
    const { isLoading, isAuthenticated } = useAuth();
    const layoutInstanceId = useRef(
        Math.random().toString(36).substring(7),
    ).current;

    useEffect(() => {
        console.log(
            `AppNavigationLogic [${layoutInstanceId}]: Efekt nawigacji START. isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, Ścieżka: ${pathname}, Segmenty: ${segments.join("/")}`,
        );

        if (isLoading) {
            console.log(
                `AppNavigationLogic [${layoutInstanceId}]: isLoading true, return.`,
            );
            return;
        }

        const currentFirstSegment = segments[0] || "";
        const isInAuthGroup = currentFirstSegment === "(auth)";
        const isInAdminGroup = currentFirstSegment === "(admin)";

        console.log(
            `AppNavigationLogic [${layoutInstanceId}]: Sprawdzanie warunków. isAuthenticated: ${isAuthenticated}, isInAuthGroup: ${isInAuthGroup}, isInAdminGroup: ${isInAdminGroup}`
        );

        if (!isAuthenticated) {
            if (!isInAuthGroup) {
                console.log(
                    `AppNavigationLogic [${layoutInstanceId}]: DECYZJA: Niezalogowany i nie w grupie auth/admin. Przekierowuję do / (auth)`,
                );
                router.replace("/(auth)");
            } else {
                console.log(
                    `AppNavigationLogic [${layoutInstanceId}]: DECYZJA: Niezalogowany, ale już w grupie auth. Brak przekierowania.`,
                );
            }
        } else { // isAuthenticated === true
            if (isInAuthGroup) {
                console.log(
                    `AppNavigationLogic [${layoutInstanceId}]: DECYZJA: Zalogowany i był w grupie auth. Przekierowuję do / (tabs)/`,
                );
                router.replace("/(tabs)");
            } else if (pathname === "/" && !isInAdminGroup && currentFirstSegment !== "(tabs)") {
                console.log(
                    `AppNavigationLogic [${layoutInstanceId}]: DECYZJA: Zalogowany na "/" i nie w admin/tabs. Przekierowuję do / (tabs)/`
                );
                router.replace("/(tabs)");
            }
        }
        console.log(`AppNavigationLogic [${layoutInstanceId}]: Efekt nawigacji KONIEC.`);

    }, [isLoading, isAuthenticated, segments, router, pathname, layoutInstanceId]);

    console.log(
        `AppNavigationLogic [${layoutInstanceId}]: Renderowanie. isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`,
    );

    if (isLoading) {
        console.log(
            `AppNavigationLogic [${layoutInstanceId}]: Renderuję wskaźnik ładowania.`,
        );
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#A3D69D" />
                <Text>Ładowanie aplikacji...</Text>
            </View>
        );
    }

    const firstSegmentForNav = segments[0] || "";
    const showBottomNav = isAuthenticated && firstSegmentForNav !== "(auth)" && firstSegmentForNav !== "(admin)";

    console.log(`AppNavigationLogic [${layoutInstanceId}]: Renderuję Slot. showBottomNav: ${showBottomNav}`);

    return (
        <View style={{ flex: 1 }}>
            <Slot />
            {showBottomNav && <BottomNavigation />}
        </View>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <CartProvider>
                <AppContentWithNavigation />
            </CartProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
