/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client";

import React, { useEffect, useState, ReactNode } from "react";
import {
    SafeAreaView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, ArrowLeft, CreditCard } from "lucide-react-native";

import { API_URL } from "@/app/constants";
import { COLORS }   from "@/components/home-page/constants";
import { useAuth }  from "@/context/AuthContext";

/* ---------- typy uproszczone ---------- */
interface OrderItemDto {
    productId: number;
    quantity: number;
    expectedUnitPrice: number;
    product?: { name: string };
}

interface OrderDtoRaw {
    id: number;
    orderDate: string;
    totalAmount: number;
    status: string;
    orderItems: OrderItemDto[] | { $values: OrderItemDto[] };
    deliveryAddress?: {
        street: string;
        apartment?: string;
        city: string;
        postalCode: string;
        country?: string;
    } | string | { $values: any };
}

/* ---------- widok ---------- */
export default function OrderSummaryScreen() {
    const router = useRouter();
    const { userToken }       = useAuth();
    const { id, pm, sum, restId } = useLocalSearchParams<{
        id: string; pm?: string; sum?: string; restId?: string;
    }>();

    const [loading, setLoading] = useState(true);
    const [order, setOrder]     = useState<OrderDtoRaw | null>(null);
    const [paymentName, setPaymentName] = useState<string | null>(pm ?? null);

    /* --- fetch order & optional payment --- */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${userToken}` },
                });
                const raw: OrderDtoRaw = await res.json();
                setOrder(raw);

                /* jeśli nie dostaliśmy pm w param, spróbuj API */
                if (!pm) {
                    const payRes = await fetch(`${API_URL}/api/payments/order/${id}`, {
                        headers: { Authorization: `Bearer ${userToken}` },
                    });
                    if (payRes.ok) {
                        const payRaw = await payRes.json();
                        setPaymentName(payRaw?.paymentMethod ?? null);
                    }
                }
            } catch (e) {
                console.error("OrderSummary: fetch error", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, pm, userToken]);

    /* --- helpery renderujące --- */
    const renderAddress = () => {
        if (!order?.deliveryAddress) return null;
        if (typeof order.deliveryAddress === "string") return order.deliveryAddress;

        const addrObj =
            Array.isArray((order.deliveryAddress as any)?.$values)
                ? (order.deliveryAddress as any).$values[0]
                : order.deliveryAddress;

        return `${addrObj.street}${
            addrObj.apartment ? `/${addrObj.apartment}` : ""
        }, ${addrObj.postalCode} ${addrObj.city}`;
    };

    const renderItems = () => {
        if (!order) return null;

        const arr: OrderItemDto[] = Array.isArray(order.orderItems)
            ? order.orderItems
            : Array.isArray((order.orderItems as any)?.$values)
                ? (order.orderItems as any).$values
                : [];

        return arr.map((it: OrderItemDto, idx: number) => (     // ★ tu
            <View key={idx} style={styles.row}>
                <Text style={styles.rowLeft}>
                    {it.product?.name ?? `#${it.productId}`} x{it.quantity}
                </Text>
                <Text style={styles.rowRight}>
                    {(it.expectedUnitPrice * it.quantity).toFixed(2)} zł
                </Text>
            </View>
        ));
    };


    /* --- render główny --- */
    if (loading || !order) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Zamówienie #{order.id}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* STATUS */}
                <Card>
                    <Text style={styles.cardTitle}>Status</Text>
                    <Text
                        style={[
                            styles.statusTxt,
                            order.status === "Completed" && { color: "#54B34B" },
                            order.status === "Cancelled" && { color: COLORS.danger },
                        ]}
                    >
                        {order.status}
                    </Text>
                    <Text style={styles.subtleTxt}>Suma: {sum ?? order.totalAmount.toFixed(2)} zł</Text>
                </Card>

                {/* ADRES */}
                {renderAddress() && (
                    <Card>
                        <Text style={styles.cardTitle}>Adres dostawy</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                            <MapPin size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                            <Text style={styles.normalTxt}>{renderAddress()}</Text>
                        </View>
                    </Card>
                )}

                {/* PŁATNOŚĆ */}
                {paymentName && (
                    <Card>
                        <Text style={styles.cardTitle}>Płatność</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                            <CreditCard size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                            <Text style={styles.normalTxt}>{paymentName}</Text>
                        </View>
                    </Card>
                )}

                {/* POZYCJE */}
                <Card>
                    <Text style={styles.cardTitle}>Pozycje</Text>
                    {renderItems()}
                </Card>

                {/* powrót */}
                <TouchableOpacity
                    style={styles.mainBtn}
                    onPress={() => router.replace("/")}
                >
                    <Text style={styles.mainBtnTxt}>Powrót na stronę główną</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ---------- pomocniczy Card ---------- */
const Card = ({ children }: { children: ReactNode }) => (
    <View style={styles.card}>{children}</View>
);

/* ---------- style ---------- */
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
        borderBottomColor: COLORS.border, backgroundColor: COLORS.cardBackground,
    },
    headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.textPrimary },

    scroll: { padding: 16, paddingBottom: 60 },

    card: {
        backgroundColor: COLORS.cardBackground, borderRadius: 12, padding: 16,
        marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 3,
    },
    cardTitle: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 6 },
    statusTxt: { fontSize: 16, fontWeight: "600", color: "#9ACD6B" },
    subtleTxt: { color: COLORS.textSecondary, marginTop: 4 },
    normalTxt: { color: COLORS.textPrimary },

    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
    rowLeft: { color: COLORS.textSecondary },
    rowRight: { color: COLORS.textPrimary, fontWeight: "500" },

    mainBtn: {
        backgroundColor: COLORS.accent, height: 50, borderRadius: 12, alignItems: "center",
        justifyContent: "center", marginTop: 10,
    },
    mainBtnTxt: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
});
