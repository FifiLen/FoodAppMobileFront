"use client";

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { PlusCircle, Edit3, Trash2, ShoppingCart, ListFilter } from 'lucide-react-native';
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

const generateMockOrders = (): FakeOrder[] => [
    {
        id: '1', orderNumber: 'ZAM_001', orderDate: new Date(2025, 4, 10), customerName: 'Jan Kowalski',
        deliveryAddress: 'ul. Słoneczna 1, Warszawa', status: 'Nowe',
        items: [
            { id: 'i1', productId: 'p1', productName: 'Pizza Margherita', quantity: 1, unitPrice: 25.99 },
            { id: 'i2', productId: 'p2', productName: 'Cola', quantity: 2, unitPrice: 5.00 },
        ],
    },
    {
        id: '2', orderNumber: 'ZAM_002', orderDate: new Date(2025, 4, 9), customerName: 'Anna Nowak',
        deliveryAddress: 'ul. Leśna 5, Kraków', status: 'Dostarczone',
        items: [ { id: 'i3', productId: 'p3', productName: 'Sushi Set', quantity: 1, unitPrice: 55.50 } ],
    },
];

export default function ManageFakeOrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<FakeOrder[]>(() => {
        const initialOrders = generateMockOrders();
        initialOrders.forEach(order => {
            order.totalAmount = order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            order.items.forEach(item => item.totalPrice = item.quantity * item.unitPrice);
        });
        return initialOrders;
    });
    const [loading, setLoading] = useState(false);


    const handleAddOrder = () => {
        Alert.alert("Info", "Dodawanie nowego zamówienia (TODO - Fake CRUD)");
    };

    const handleViewOrEditOrder = (orderId: string) => {
        Alert.alert("Info", `Szczegóły/Edycja zamówienia ${orderId} (TODO - Fake CRUD)`);
    };

    const handleDeleteOrder = (orderId: string) => {
        Alert.alert(
            "Potwierdź usunięcie",
            `Czy na pewno chcesz usunąć zamówienie ID: ${orderId}? (Operacja lokalna)`,
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: () => {
                        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                        Alert.alert("Sukces", `Zamówienie ID: ${orderId} zostało usunięte z listy.`);
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: FakeOrder['status']) => {
        switch (status) {
            case 'Nowe': return COLORS.accent;
            case 'W trakcie realizacji': return COLORS.secondary;
            case 'Wysłane': return COLORS.primary;
            case 'Dostarczone': return COLORS.textLight;
            case 'Anulowane': return COLORS.danger;
            default: return COLORS.textSecondary;
        }
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Zarządzanie Zamówieniami (Fake)</Text>
                    <TouchableOpacity onPress={() => Alert.alert("Filtrowanie", "Filtrowanie TODO")} style={styles.filterButton}>
                        <ListFilter size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleViewOrEditOrder(item.id)} style={styles.listItem}>
                            <View style={styles.itemIconContainer}>
                                <ShoppingCart size={28} color={getStatusColor(item.status)} />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.orderNumberText}>{item.orderNumber} - {item.customerName}</Text>
                                <Text style={styles.dateText}>Data: {item.orderDate.toLocaleDateString('pl-PL')}</Text>
                                <Text style={[styles.statusText, { color: getStatusColor(item.status), backgroundColor: `${getStatusColor(item.status)}20` }]}>
                                    {item.status}
                                </Text>
                                <Text style={styles.totalText}>Suma: {item.totalAmount?.toFixed(2)} zł</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteOrder(item.id)} style={styles.actionButton}>
                                <Trash2 size={22} color={COLORS.danger} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyText}>Brak zamówień. Kliknij + aby dodać (symulacja).</Text>
                        </View>
                    }
                    contentContainerStyle={orders.length === 0 ? styles.emptyListInnerContainer : styles.listContentContainer}
                />
                <TouchableOpacity style={styles.fab} onPress={handleAddOrder}>
                    <PlusCircle size={32} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, paddingTop: Platform.OS === 'android' ? 10 : 0 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
    filterButton: { padding: 5 },
    listItem: { backgroundColor: COLORS.cardBackground, padding: 15, marginVertical: 8, marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
    itemIconContainer: { marginRight: 15, padding: 5, backgroundColor: `${COLORS.primary}20`, borderRadius: 25 },
    itemTextContainer: { flex: 1 },
    orderNumberText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
    dateText: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
    statusText: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', alignSelf: 'flex-start', marginBottom: 4 },
    totalText: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginTop: 2 },
    actionButton: { marginLeft: 10, padding: 8 },
    emptyText: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center' },
    emptyListContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    emptyListInnerContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
    listContentContainer: { paddingBottom: 80 },
    fab: { position: 'absolute', right: 25, bottom: 25, backgroundColor: COLORS.accent, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 6, zIndex: 10 },
    loadingText: { marginTop: 10, color: COLORS.textSecondary },
    buttonText: { color: COLORS.white, fontWeight: 'bold' },
});
