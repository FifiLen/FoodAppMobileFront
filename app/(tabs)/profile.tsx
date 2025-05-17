/* app/(tabs)/profile.tsx */
"use client";

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import {
    MapPin,
    Clock,
    Settings,
    ChevronDown,
    ChevronUp,
    LogOut,
    User,
    Mail,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { ConfirmLogoutModal } from "@/components/ConfirmLogoutModal";
import { COLORS } from "@/components/home-page/constants";
import { API_URL } from "@/app/constants";

/* ---------- typy ---------- */
type SectionID = "addresses" | "orders" | "settings";

interface SectionState {
    loading: boolean;
    data: any;
}

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);

    /* ---------- akordeon ---------- */
    const [expanded, setExpanded] = useState<Record<SectionID, boolean>>({
        addresses: false,
        orders: false,
        settings: false,
    });
    const [sections, setSections] = useState<Record<SectionID, SectionState>>({
        addresses: { loading: false, data: null },
        orders: { loading: false, data: null },
        settings: { loading: false, data: null },
    });

    const toggleSection = (id: SectionID) => {
        setExpanded((p) => ({ ...p, [id]: !p[id] }));
        if (!sections[id].data && !sections[id].loading) loadSection(id);
    };

    /* ---------- pobieranie danych ---------- */
    const loadSection = async (id: SectionID) => {
        setSections((p) => ({ ...p, [id]: { ...p[id], loading: true } }));
        try {
            let endpoint = "";
            switch (id) {
                case "addresses":
                    endpoint = `${API_URL}/api/address`; // GET Adresy
                    break;
                case "orders":
                    endpoint = `${API_URL}/api/orders`; // GET Historia zamówień
                    break;
                case "settings":
                    endpoint = `${API_URL}/api/users/me`; // GET Dane profilu
                    break;
            }
            const res = await fetch(endpoint, { headers: { /* Authorization */ } });
            const json = await res.json();
            setSections((p) => ({ ...p, [id]: { loading: false, data: json } }));
        } catch (e) {
            console.error("Profile accordion fetch error:", e);
            setSections((p) => ({ ...p, [id]: { loading: false, data: [] } }));
        }
    };

    /* ---------- wylogowanie ---------- */
    const promptLogout = () => setIsModalVisible(true);
    const handleConfirmLogout = async () => {
        setIsModalVisible(false);
        await signOut();
    };

    /* ---------- tymczasowe dane użytkownika ---------- */
    const user = {
        name: "Jan Kowalski",
        email: "jan.kowalski@example.com",
        avatar: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
    };

    /* ---------- renderery sekcji ---------- */
    const renderAddresses = () => {
        const { loading, data } = sections.addresses;
        if (loading) return <ActivityIndicator color={COLORS.primary} />;
        return (data ?? []).map((a: any) => (
            <Text key={a.id} style={styles.sectionTxt}>
                {a.street}, {a.postalCode} {a.city}
            </Text>
        ));
    };

    const renderOrders = () => {
        const { loading, data } = sections.orders;
        if (loading) return <ActivityIndicator color={COLORS.primary} />;
        return (data ?? []).map((o: any) => (
            <Text key={o.id} style={styles.sectionTxt}>
                #{o.id} • {new Date(o.orderDate).toLocaleDateString()} • {o.status}
            </Text>
        ));
    };

    const renderSettings = () => {
        const { loading, data } = sections.settings;
        if (loading) return <ActivityIndicator color={COLORS.primary} />;
        return (
            <Text style={styles.sectionTxt}>
                Tutaj ustawienia konta (imię, email, zmiana hasła…)
            </Text>
        );
    };

    /* ---------- JSX ---------- */
    return (
        <View style={styles.safe}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* header */}
                <View style={styles.headerBox}>
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    <View>
                        <Text style={styles.name}>{user.name}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Mail size={16} color={COLORS.textSecondary} />
                            <Text style={styles.email}>{user.email}</Text>
                        </View>
                    </View>
                </View>

                {/* accordion */}
                {[
                    { id: "addresses", label: "Moje adresy", icon: MapPin },
                    { id: "orders", label: "Historia zamówień", icon: Clock },
                    { id: "settings", label: "Ustawienia konta", icon: Settings },
                ].map(({ id, label, icon: Icon }) => {
                    const open = expanded[id as SectionID];
                    return (
                        <View key={id} style={styles.accordionBox}>
                            <TouchableOpacity
                                style={styles.accordionHeader}
                                onPress={() => toggleSection(id as SectionID)}
                            >
                                <Icon size={20} color={COLORS.primary} />
                                <Text style={styles.accordionLabel}>{label}</Text>
                                {open ? (
                                    <ChevronUp size={18} color={COLORS.textSecondary} />
                                ) : (
                                    <ChevronDown size={18} color={COLORS.textSecondary} />
                                )}
                            </TouchableOpacity>

                            {open && (
                                <View style={styles.accordionBody}>
                                    {id === "addresses"
                                        ? renderAddresses()
                                        : id === "orders"
                                            ? renderOrders()
                                            : renderSettings()}
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* banner */}
                <View style={{ marginHorizontal: 20, marginTop: 20 }}>
                    <LinearGradient
                        colors={[COLORS.primary, "#ff7e5f"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.banner}
                    >
                        <User size={20} color="#fff" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerTitle}>Kupon powitalny</Text>
                            <Text style={styles.bannerSubtitle}>WELCOME30</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={promptLogout}>
                    <LogOut size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutTxt}>Wyloguj się</Text>
                </TouchableOpacity>
            </ScrollView>

            <ConfirmLogoutModal
                visible={isModalVisible}
                onConfirm={handleConfirmLogout}
                onCancel={() => setIsModalVisible(false)}
            />
        </View>
    );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    headerBox: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 25,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 14 },
    name: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary },
    email: { marginLeft: 6, color: COLORS.textSecondary, fontSize: 13 },

    accordionBox: {
        backgroundColor: COLORS.cardBackground,
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
        elevation: 1,
    },
    accordionHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    accordionLabel: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: "600",
    },
    accordionBody: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        padding: 14,
        gap: 6,
    },
    sectionTxt: { color: COLORS.textSecondary, fontSize: 14 },

    banner: {
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    bannerTitle: { color: "#fff", fontWeight: "600", fontSize: 14 },
    bannerSubtitle: { color: "#fff", fontWeight: "800", fontSize: 20 },

    logoutBtn: {
        marginTop: 30,
        marginHorizontal: 70,
        backgroundColor: COLORS.danger,
        height: 46,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    logoutTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
