"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator, SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/components/home-page/constants';

interface FakeOrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
}

interface FakeOrder {
    id: string;
    orderNumber: string;
    orderDate: Date;
    customerName: string;
    deliveryAddress: string;
    status: 'Nowe' | 'W trakcie realizacji' | 'Wysłane' | 'Dostarczone' | 'Anulowane';
    items: FakeOrderItem[];
    totalAmount?: number;
}


if (!(global as any).fakeOrders) {
    (global as any).fakeOrders = [];
}
const fakeOrdersDb: FakeOrder[] = (global as any).fakeOrders;


export default function EditFakeOrderScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const orderId = params.id;

    const [order, setOrder] = useState<FakeOrder | null>(null);
    const [originalStatus, setOriginalStatus] = useState<FakeOrder['status'] | undefined>(undefined);
    const [currentStatus, setCurrentStatus] = useState<FakeOrder['status'] | undefined>(undefined);

    const [loadingData, setLoadingData] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrderDetails = useCallback((id: string) => {
        setLoadingData(true);
        setError(null);
        const foundOrder = fakeOrdersDb.find(o => o.id === id);
        if (foundOrder) {
            setOrder(foundOrder);
            setOriginalStatus(foundOrder.status);
            setCurrentStatus(foundOrder.status);
        } else {
            setError("Nie znaleziono zamówienia o podanym ID.");
            Alert.alert("Błąd", "Nie znaleziono zamówienia.");
        }
        setLoadingData(false);
    }, []);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails(orderId);
        } else {
            Alert.alert("Błąd", "Brak ID zamówienia do wyświetlenia/edycji.");
            setError("Brak ID zamówienia.");
            setLoadingData(false);
        }
    }, [orderId, fetchOrderDetails]);

    const handleUpdateStatus = () => {
        if (!order || !currentStatus || currentStatus === originalStatus) {
            Alert.alert("Informacja", "Nie wybrano nowego statusu lub status nie został zmieniony.");
            return;
        }

        setLoadingUpdate(true);
        const orderIndex = fakeOrdersDb.findIndex(o => o.id === order.id);
        if (orderIndex > -1 && currentStatus) {
            fakeOrdersDb[orderIndex].status = currentStatus;
            console.log("Fake order status updated:", fakeOrdersDb[orderIndex]);

            setTimeout(() => {
                setLoadingUpdate(false);
                setOriginalStatus(currentStatus);
                Alert.alert("Sukces", `Status zamówienia "${order.orderNumber}" został zmieniony na "${currentStatus}".`);
            }, 500);
        } else {
            setLoadingUpdate(false);
            Alert.alert("Błąd", "Nie udało się zaktualizować statusu zamówienia.");
        }
    };

    const availableStatuses: FakeOrder['status'][] = ['Nowe', 'W trakcie realizacji', 'Wysłane', 'Dostarczone', 'Anulowane'];

    if (loadingData) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /><Text>Ładowanie...</Text></View>;
    }

    if (error || !order) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error || "Nie można załadować danych zamówienia."}</Text>
                <TouchableOpacity onPress={() => router.back()} style={[styles.button, styles.buttonSecondary]}>
                    <Text style={styles.buttonText}>Wróć do Listy</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.title}>Szczegóły Zamówienia (Fake)</Text>
                    <Text style={styles.orderInfo}>Numer: <Text style={styles.bold}>{order.orderNumber}</Text></Text>
                    <Text style={styles.orderInfo}>Klient: <Text style={styles.bold}>{order.customerName}</Text></Text>
                    <Text style={styles.orderInfo}>Adres: <Text style={styles.bold}>{order.deliveryAddress}</Text></Text>
                    <Text style={styles.orderInfo}>Data: <Text style={styles.bold}>{order.orderDate.toLocaleDateString('pl-PL')}</Text></Text>

                    <Text style={styles.sectionTitle}>Pozycje Zamówienia</Text>
                    {order.items.map(item => (
                        <View key={item.id} style={styles.itemCard}>
                            <Text style={styles.itemName}>{item.productName}</Text>
                            <Text>Ilość: {item.quantity}</Text>
                            <Text>Cena/szt: {item.unitPrice.toFixed(2)} zł</Text>
                            <Text style={styles.itemTotal}>Suma: {item.totalPrice?.toFixed(2)} zł</Text>
                        </View>
                    ))}
                    <Text style={styles.overallTotal}>Suma Całkowita: {order.totalAmount?.toFixed(2)} zł</Text>

                    <Text style={styles.sectionTitle}>Zmień Status Zamówienia</Text>
                    <View style={styles.statusContainer}>
                        {availableStatuses.map(s => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.statusButton, currentStatus === s && styles.statusButtonActive]}
                                onPress={() => setCurrentStatus(s)}
                            >
                                <Text style={currentStatus === s ? styles.statusTextActive : styles.statusText}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, (loadingUpdate || currentStatus === originalStatus) && styles.buttonDisabled]}
                        onPress={handleUpdateStatus}
                        disabled={loadingUpdate || currentStatus === originalStatus}
                    >
                        {loadingUpdate ? (<ActivityIndicator color={COLORS.white} />) : (<Text style={styles.buttonText}>Zapisz Zmianę Statusu</Text>)}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 20 },
    orderInfo: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 5 },
    bold: { fontWeight: '600', color: COLORS.textPrimary },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginTop: 25, marginBottom: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 15 },
    itemCard: { backgroundColor: COLORS.cardBackground, padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
    itemName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
    itemTotal: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginTop: 5 },
    overallTotal: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, textAlign: 'right', marginTop: 10, marginBottom: 20 },
    statusContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, justifyContent: 'center' },
    statusButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, margin: 5, backgroundColor: COLORS.cardBackground },
    statusButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    statusText: { color: COLORS.textPrimary, textAlign: 'center' },
    statusTextActive: { color: COLORS.white, textAlign: 'center' },
    button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50, marginTop: 10 },
    buttonSecondary: { backgroundColor: COLORS.textLight, marginTop: 10 },
    buttonDisabled: { backgroundColor: COLORS.textLight },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    errorText: { color: COLORS.danger, marginBottom: 15, textAlign: 'center', fontSize: 14 },
});
