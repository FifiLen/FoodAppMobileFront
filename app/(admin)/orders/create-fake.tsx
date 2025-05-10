"use client";

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
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


export default function CreateFakeOrderScreen() {
    const router = useRouter();

    const [customerName, setCustomerName] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [status, setStatus] = useState<'Nowe' | 'W trakcie realizacji' | 'Wysłane' | 'Dostarczone' | 'Anulowane'>('Nowe');
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');

    const [loading, setLoading] = useState(false);

    const handleAddOrderItemAndSaveOrder = () => {
        if (!customerName.trim() || !deliveryAddress.trim() || !productName.trim() || !quantity.trim() || !unitPrice.trim()) {
            Alert.alert("Walidacja", "Wszystkie pola (oprócz statusu) są wymagane.");
            return;
        }

        const qty = parseInt(quantity, 10);
        const price = parseFloat(unitPrice);

        if (isNaN(qty) || qty <= 0) {
            Alert.alert("Walidacja", "Ilość musi być poprawną liczbą dodatnią.");
            return;
        }
        if (isNaN(price) || price <= 0) {
            Alert.alert("Walidacja", "Cena jednostkowa musi być poprawną liczbą dodatnią.");
            return;
        }

        setLoading(true);

        const newOrderItem: FakeOrderItem = {
            id: `item_${Date.now()}_${Math.random()}`,
            productId: `prod_${Date.now()}`,
            productName: productName.trim(),
            quantity: qty,
            unitPrice: price,
            totalPrice: qty * price,
        };

        const newOrder: FakeOrder = {
            id: `order_${Date.now()}`,
            orderNumber: `ZAM_${Math.floor(Math.random() * 10000)}`,
            orderDate: new Date(),
            customerName: customerName.trim(),
            deliveryAddress: deliveryAddress.trim(),
            status: status,
            items: [newOrderItem],
            totalAmount: newOrderItem.totalPrice,
        };

        fakeOrdersDb.push(newOrder);
        console.log("New fake order added:", newOrder);
        console.log("Current fakeOrdersDb:", fakeOrdersDb);


        setTimeout(() => {
            setLoading(false);
            Alert.alert("Sukces", `Zamówienie "${newOrder.orderNumber}" zostało dodane (symulacja).`);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(admin)/orders' as any);
            }
        }, 500);
    };
    const availableStatuses: FakeOrder['status'][] = ['Nowe', 'W trakcie realizacji', 'Wysłane', 'Dostarczone', 'Anulowane'];


    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Dodaj Nowe Zamówienie (Fake)</Text>

                    <Text style={styles.label}>Nazwa Klienta *</Text>
                    <TextInput style={styles.input} value={customerName} onChangeText={setCustomerName} placeholder="Imię i nazwisko klienta" />

                    <Text style={styles.label}>Adres Dostawy *</Text>
                    <TextInput style={styles.input} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Pełny adres dostawy" />

                    <Text style={styles.label}>Status Zamówienia *</Text>
                    <View style={styles.statusContainer}>
                        {availableStatuses.map(s => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.statusButton, status === s && styles.statusButtonActive]}
                                onPress={() => setStatus(s)}
                            >
                                <Text style={status === s ? styles.statusTextActive : styles.statusText}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Pozycja Zamówienia (Uproszczona)</Text>
                    <Text style={styles.label}>Nazwa Produktu *</Text>
                    <TextInput style={styles.input} value={productName} onChangeText={setProductName} placeholder="Np. Pizza Margherita" />

                    <Text style={styles.label}>Ilość *</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="Np. 1" keyboardType="number-pad" />

                    <Text style={styles.label}>Cena Jednostkowa (zł) *</Text>
                    <TextInput style={styles.input} value={unitPrice} onChangeText={setUnitPrice} placeholder="Np. 25.99" keyboardType="numeric" />


                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleAddOrderItemAndSaveOrder}
                        disabled={loading}
                    >
                        {loading ? (<ActivityIndicator color={COLORS.white} />) : (<Text style={styles.buttonText}>Dodaj Zamówienie</Text>)}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center' },
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginTop: 20, marginBottom: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 15 },
    label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500' },
    input: { backgroundColor: COLORS.cardBackground, color: COLORS.textPrimary, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
    statusContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, justifyContent: 'space-around' },
    statusButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, margin: 4 },
    statusButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    statusText: { color: COLORS.textPrimary },
    statusTextActive: { color: COLORS.white },
    button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50, marginTop: 20 },
    buttonDisabled: { backgroundColor: COLORS.textLight },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
