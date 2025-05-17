import React, { useEffect, useRef } from "react";
import { Slot, useRouter, usePathname, useSegments } from "expo-router";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BottomNavigation } from "@/components/bottom-nav";

function AppContent() {
    const { isLoading, isAuthenticated, isAdmin } = useAuth();
    const router      = useRouter();
    const pathname    = usePathname();
    const segments    = useSegments();
    const instanceId  = useRef(Math.random().toString(36).slice(2)).current;

    useEffect(() => {
        if (isLoading) return;

        const rootSeg        = segments[0] || "";
        const inAuthGroup    = rootSeg === "(auth)";
        const inAdminGroup   = rootSeg === "(admin)";
        const inTabsGroup    = rootSeg === "(tabs)";

        /* ------ blokada admina ------ */
        if (isAuthenticated && inAdminGroup && !isAdmin) {
            router.replace("/(tabs)");
            return;
        }

        /* ------ redirecty zależne od auth ------ */
        if (!isAuthenticated && !inAuthGroup) {
            router.replace("/(auth)");
        } else if (isAuthenticated && inAuthGroup) {
            router.replace("/(tabs)");
        } else if (isAuthenticated && pathname === "/" && !inTabsGroup && !inAdminGroup) {
            router.replace("/(tabs)");
        }
    }, [isLoading, isAuthenticated, isAdmin, segments, pathname, router]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#A3D69D" />
                <Text>Ładowanie…</Text>
            </View>
        );
    }

    /* dolna nawigacja tylko dla zalogowanych, poza (auth) i (admin) */
    const rootSeg = segments[0] || "";
    const showBottomNav =
        isAuthenticated && rootSeg !== "(auth)" && rootSeg !== "(admin)";

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
                <AppContent />
            </CartProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
