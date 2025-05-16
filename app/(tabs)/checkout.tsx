// frontend/app/checkout.tsx
"use client"

import React, {useState, useEffect, ReactNode} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
    ActivityIndicator,
    TextInput // Do prostego wprowadzania danych
} from 'react-native';
import { useCart } from '@/context/CartContext';
import { COLORS } from '@/components/home-page/constants';
import { ArrowLeft, CreditCard, MapPin, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

// Przykładowe typy dla adresów i metod płatności (do rozbudowy)
interface Address {
    id: number;
    street: string;
    city: string;
    postalCode: string;
    fullAddress: string; // np. "Uliczna 1, 00-000 Miasto"
}

interface PaymentMethod {
    id: string;
    name: string; // np. "Karta online", "BLIK", "Płatność przy odbiorze"
}

export default function CheckoutScreen() {
    const { cartItems, totalPrice, itemCount, getCartRestaurantId, clearCart } = useCart();
    const { userId, userToken, isAuthenticated } = useAuth();
    const router = useRouter();

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null); // np. "Karta Online"
    const [isSubmitting, setIsSubmitting] = useState(false);

    // TODO: W przyszłości te dane powinny być pobierane z API lub profilu użytkownika
    const [availableAddresses, setAvailableAddresses] = useState<Address[]>([
        { id: 1, street: "Kwiatowa 15", city: "Warszawa", postalCode: "01-234", fullAddress: "Kwiatowa 15, 01-234 Warszawa" },
        { id: 2, street: "Słoneczna 1A/3", city: "Kraków", postalCode: "30-001", fullAddress: "Słoneczna 1A/3, 30-001 Kraków" },
    ]);
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([
        { id: "card", name: "Karta Online" },
        { id: "blik", name: "BLIK" },
        { id: "cash_on_delivery", name: "Płatność przy odbiorze" },
    ]);

    const API_BASE_URL = "http://192.168.0.13:8081";

    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert("Brak autoryzacji", "Zaloguj się, aby kontynuować.", [{ text: "OK", onPress: () => router.replace('/login') }]);
        }
        if (itemCount === 0 && !isSubmitting) { // Nie przekierowuj jeśli właśnie składamy zamówienie
            Alert.alert("Pusty koszyk", "Twój koszyk jest pusty. Wróć do sklepu.", [{ text: "OK", onPress: () => router.replace('/cart') }]);
        }
    }, [isAuthenticated, itemCount, router, isSubmitting]);


    const handlePlaceOrder = async () => {
        if (!selectedAddressId && getCartRestaurantId() !== null) { // DeliveryAddressId jest opcjonalne, ale jeśli jest restauracja, to może być potrzebne
            // W DTO DeliveryAddressId jest nullable, więc technicznie możemy wysłać null.
            // Ale biznesowo, dla dostawy jedzenia, adres jest zwykle wymagany.
            // Na razie pozwalamy na null, zgodnie z DTO.
            // Alert.alert("Błąd", "Wybierz adres dostawy.");
            // return;
        }
        if (!selectedPaymentMethod) {
            Alert.alert("Błąd", "Wybierz metodę płatności.");
            return;
        }

        setIsSubmitting(true);

        const currentRestaurantId = getCartRestaurantId();
        if (currentRestaurantId === null) {
            Alert.alert("Błąd krytyczny", "Nie można ustalić restauracji dla zamówienia.");
            setIsSubmitting(false);
            return;
        }

        const orderPayload = {
            RestaurantId: currentRestaurantId,
            DeliveryAddressId: selectedAddressId, // Może być null
            OrderItems: cartItems.map(item => ({
                ProductId: parseInt(item.id),
                Quantity: item.quantity,
                ExpectedUnitPrice: item.price,
            })),
        };

        console.log("CheckoutScreen: Wysyłanie CreateOrderDto:", JSON.stringify(orderPayload, null, 2));

        try {
            if (!userToken) throw new Error("Brak tokenu autoryzacyjnego.");

            const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify(orderPayload),
            });

            if (!orderResponse.ok) {
                const errorText = await orderResponse.text();
                // ... (logika parsowania błędu jak wcześniej)
                throw new Error(`Błąd tworzenia zamówienia: ${orderResponse.status} - ${errorText.substring(0,100)}`);
            }
            const createdOrder = await orderResponse.json();
            console.log("Zamówienie utworzone:", createdOrder);

            // KROK: Tworzenie płatności
            if (createdOrder && createdOrder.id && selectedPaymentMethod) {
                const paymentPayload = {
                    OrderId: createdOrder.id,
                    PaymentMethod: selectedPaymentMethod, // Użyj wybranej metody
                };
                console.log("CheckoutScreen: Tworzenie płatności:", paymentPayload);
                const paymentResponse = await fetch(`${API_BASE_URL}/api/payments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                    body: JSON.stringify(paymentPayload),
                });

                if (!paymentResponse.ok) {
                    const paymentErrorText = await paymentResponse.text();
                    console.error("Błąd tworzenia płatności:", paymentErrorText);
                    // Informuj użytkownika, ale zamówienie już istnieje
                    Alert.alert("Problem z płatnością", "Zamówienie zostało złożone, ale wystąpił problem z przetworzeniem płatności. Skontaktuj się z obsługą.");
                } else {
                    const createdPayment = await paymentResponse.json();
                    console.log("Płatność utworzona:", createdPayment);
                }
            }

            Alert.alert("Sukces!", `Twoje zamówienie (ID: ${createdOrder.id}) zostało złożone.`, [
                { text: "OK", onPress: () => { clearCart(); router.replace('/'); }}
            ]);

        } catch (error: any) {
            console.error("CheckoutScreen: Błąd podczas składania zamówienia:", error);
            Alert.alert("Błąd", error.message || "Nie udało się złożyć zamówienia.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Podsumowanie i Płatność</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Section title="Adres Dostawy">
                    {availableAddresses.map(address => (
                        <TouchableOpacity
                            key={address.id}
                            style={[styles.selectableItem, selectedAddressId === address.id && styles.selectedItem]}
                            onPress={() => setSelectedAddressId(address.id)}
                        >
                            <MapPin size={20} color={selectedAddressId === address.id ? COLORS.primary : COLORS.textSecondary} style={styles.itemIcon} />
                            <Text style={styles.selectableItemText}>{address.fullAddress}</Text>
                            {selectedAddressId === address.id && <CheckCircle size={20} color={COLORS.primary} />}
                        </TouchableOpacity>
                    ))}
                    {/* TODO: Dodaj opcję "Dodaj nowy adres" */}
                </Section>

                <Section title="Metoda Płatności">
                    {availablePaymentMethods.map(method => (
                        <TouchableOpacity
                            key={method.id}
                            style={[styles.selectableItem, selectedPaymentMethod === method.name && styles.selectedItem]}
                            onPress={() => setSelectedPaymentMethod(method.name)}
                        >
                            <CreditCard size={20} color={selectedPaymentMethod === method.name ? COLORS.primary : COLORS.textSecondary} style={styles.itemIcon} />
                            <Text style={styles.selectableItemText}>{method.name}</Text>
                            {selectedPaymentMethod === method.name && <CheckCircle size={20} color={COLORS.primary} />}
                        </TouchableOpacity>
                    ))}
                </Section>

                <Section title="Podsumowanie Koszyka">
                    {cartItems.map(item => (
                        <View key={item.id} style={styles.summaryItem}>
                            <Text style={styles.summaryItemName}>{item.name} (x{item.quantity})</Text>
                            <Text style={styles.summaryItemPrice}>{(item.price * item.quantity).toFixed(2)} zł</Text>
                        </View>
                    ))}
                    <View style={styles.summaryTotal}>
                        <Text style={styles.summaryTotalText}>Łącznie:</Text>
                        <Text style={styles.summaryTotalPrice}>{totalPrice.toFixed(2)} zł</Text>
                    </View>
                </Section>

                <TouchableOpacity
                    style={[styles.placeOrderButton, isSubmitting && styles.placeOrderButtonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={isSubmitting || itemCount === 0}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.placeOrderButtonText}>Złóż zamówienie i zapłać</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const Section = ({ title, children }: { title: string, children: ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: { /* ... (style nagłówka jak w CartScreen) ... */
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1,
        borderBottomColor: COLORS.border, backgroundColor: COLORS.cardBackground,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
    scrollContainer: { paddingBottom: 30, paddingHorizontal: 16 },
    section: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    selectableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 8,
    },
    selectedItem: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary, // Lekko podświetlone tło
    },
    itemIcon: {
        marginRight: 10,
    },
    selectableItemText: {
        fontSize: 15,
        color: COLORS.textPrimary,
        flex: 1,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summaryItemName: { fontSize: 15, color: COLORS.textSecondary },
    summaryItemPrice: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
    summaryTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    summaryTotalText: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary },
    summaryTotalPrice: { fontSize: 17, fontWeight: 'bold', color: COLORS.primary },
    placeOrderButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        height: 50,
        justifyContent: 'center',
    },
    placeOrderButtonDisabled: {
        backgroundColor: COLORS.border,
    },
    placeOrderButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
});
