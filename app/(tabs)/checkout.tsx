// app/(tabs)/checkout.tsx
/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client";

import React, {
    useEffect,
    useState,
    ReactNode,
    useCallback,
    Fragment,
} from "react";
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    CreditCard,
    MapPin,
    CheckCircle,
    PlusCircle,
    X,
    Percent,
} from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { COLORS } from "@/components/home-page/constants";
import { API_URL } from "../constants";

/* ------------ typy ------------ */
interface Address {
    id: number;
    street: string;
    apartment?: string;
    city: string;
    postalCode: string;
    country?: string;
}

interface PaymentMethod {
    id: string;
    name: string;
}

/* ------------ komponent ------------ */
export default function CheckoutScreen() {
    const router = useRouter();
    const { userToken, isAuthenticated } = useAuth();

    const {
        cartItems,
        itemCount,
        clearCart,
        totalPrice: cartTotalPrice,
        getCartRestaurantId,
    } = useCart();

    /* --- state --- */
    const [availableAddresses, setAvailableAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
        null,
    );
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddr, setNewAddr] = useState<
        Omit<Address, "id"> & { [K in keyof Address]?: string }
    >({
        street: "",
        apartment: "",
        city: "",
        postalCode: "",
        country: "",
    });

    const [paymentMethod] = useState<PaymentMethod[]>([
        { id: "card", name: "Karta online" },
        { id: "blik", name: "BLIK" },
        { id: "cash_on_delivery", name: "Płatność przy odbiorze" },
    ]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        string | null
    >(null);

    /* --- KOD PROMO ------------- */
    const [promoInput, setPromoInput] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);
    const discountPercent = promoApplied ? 0.3 : 0; // 30 %
    const discountValue = cartTotalPrice * discountPercent;
    const finalTotal = cartTotalPrice - discountValue;

    const applyPromo = () => {
        if (promoApplied) {
            Alert.alert("Kod już zastosowany");
            return;
        }
        if (promoInput.trim().toUpperCase() === "WELCOME30") {
            setPromoApplied(true);
            Alert.alert("Sukces", "Kod WELCOME30 został zastosowany (-30 %)");
        } else {
            Alert.alert("Nieprawidłowy kod", "Spróbuj ponownie");
        }
    };

    const removePromo = () => {
        setPromoApplied(false);
        setPromoInput("");
    };

    /* --- SUBMIT ----------------- */
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* --- pobranie adresów --- */
    const fetchAddresses = useCallback(async () => {
        if (!userToken) return;
        setLoadingAddresses(true);
        try {
            const res = await fetch(`${API_URL}/api/address`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            const raw = await res.json();
            const list: Address[] = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.$values)
                    ? raw.$values
                    : raw
                        ? [raw]
                        : [];
            setAvailableAddresses(list);
        } catch (e) {
            console.error("Nie udało się pobrać adresów:", e);
            Alert.alert("Błąd", "Nie udało się pobrać Twoich adresów.");
        } finally {
            setLoadingAddresses(false);
        }
    }, [userToken]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    /* --- weryfikacje auth / pusty koszyk --- */
    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert("Logowanie wymagane", "Zaloguj się, aby kontynuować.", [
                { text: "OK", onPress: () => router.replace("/login") },
            ]);
        }
        if (itemCount === 0 && !isSubmitting) {
            Alert.alert("Pusty koszyk", "Twój koszyk jest pusty.", [
                { text: "OK", onPress: () => router.replace("/cart") },
            ]);
        }
    }, [isAuthenticated, itemCount, isSubmitting, router]);

    /* --- zapisz nowy adres --- */
    const handleSaveAddress = async () => {
        if (!newAddr.street || !newAddr.city || !newAddr.postalCode) {
            Alert.alert("Walidacja", "Uzupełnij: ulica, miasto i kod pocztowy.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/address`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    street: newAddr.street,
                    apartment: newAddr.apartment,
                    city: newAddr.city,
                    postalCode: newAddr.postalCode,
                    country: newAddr.country,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(`${res.status} ${msg}`);
            }

            const created: Address = await res.json();
            setAvailableAddresses((prev) => [...prev, created]);
            setSelectedAddressId(created.id);
            setIsAddingAddress(false);
            setNewAddr({
                street: "",
                apartment: "",
                city: "",
                postalCode: "",
                country: "",
            });
        } catch (e: any) {
            console.error("Nie udało się utworzyć adresu:", e);
            Alert.alert("Błąd", e.message || "Nie udało się zapisać adresu.");
        }
    };

    /* --- złożenie zamówienia --- */
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            Alert.alert("Błąd", "Wybierz adres dostawy.");
            return;
        }
        if (!selectedPaymentMethod) {
            Alert.alert("Błąd", "Wybierz metodę płatności.");
            return;
        }
        const restaurantId = getCartRestaurantId();
        if (restaurantId === null) {
            Alert.alert("Błąd", "Nie można ustalić restauracji.");
            return;
        }

        const orderPayload = {
            restaurantId,
            deliveryAddressId: selectedAddressId,
            orderItems: cartItems.map((it) => ({
                productId: parseInt(it.id, 10),
                quantity: it.quantity,
                expectedUnitPrice: Number(
                    (
                        it.price *
                        (1 - discountPercent) // jeżeli kod promo
                    ).toFixed(2),
                ),
            })),
        };

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify(orderPayload),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`${res.status} ${txt}`);
            }
            const order = await res.json();
            console.log("[CHECKOUT] zamówienie UTWORZONE →", order);
            clearCart();
            router.replace({
                pathname: "/order/[id]/summary",
                params: { id: order.id.toString() },
            });
        } catch (e: any) {
            console.error("Błąd zamówienia:", e);
            Alert.alert("Błąd", e.message || "Nie udało się złożyć zamówienia.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ------------ widok ------------ */
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={router.back} style={styles.backBtn}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Podsumowanie i płatność</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* ADRESY */}
                <Section title="Adres dostawy">
                    {loadingAddresses ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : (
                        <Fragment>
                            {availableAddresses.map((addr) => {
                                const selected = selectedAddressId === addr.id;
                                const fullAddress = `${addr.street}${
                                    addr.apartment ? `/${addr.apartment}` : ""
                                }, ${addr.postalCode} ${addr.city}`;
                                return (
                                    <TouchableOpacity
                                        key={addr.id}
                                        style={[
                                            styles.selectable,
                                            selected && styles.selectableSelected,
                                        ]}
                                        onPress={() => setSelectedAddressId(addr.id)}
                                    >
                                        <MapPin
                                            size={20}
                                            color={selected ? COLORS.primary : COLORS.textSecondary}
                                            style={styles.leftIcon}
                                        />
                                        <Text style={styles.selectableText}>{fullAddress}</Text>
                                        {selected && <CheckCircle size={20} color={COLORS.primary} />}
                                    </TouchableOpacity>
                                );
                            })}

                            {/* --- formularz dodawania --- */}
                            {isAddingAddress ? (
                                <View style={styles.addForm}>
                                    {(
                                        [
                                            { key: "street", ph: "Ulica i numer" },
                                            { key: "apartment", ph: "Mieszkanie (opcjonalnie)" },
                                            { key: "city", ph: "Miasto" },
                                            { key: "postalCode", ph: "Kod pocztowy" },
                                            { key: "country", ph: "Kraj (opcjonalnie)" },
                                        ] as const
                                    ).map(({ key, ph }) => (
                                        <TextInput
                                            key={key}
                                            placeholder={ph}
                                            placeholderTextColor={COLORS.textLight}
                                            value={(newAddr as any)[key]}
                                            style={styles.input}
                                            onChangeText={(t) =>
                                                setNewAddr((prev) => ({ ...prev, [key]: t }))
                                            }
                                        />
                                    ))}

                                    <View style={styles.formButtons}>
                                        <TouchableOpacity
                                            style={[styles.smallBtn, styles.cancelBtn]}
                                            onPress={() => setIsAddingAddress(false)}
                                        >
                                            <X size={18} color={COLORS.white} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.smallBtn, styles.saveBtn]}
                                            onPress={handleSaveAddress}
                                        >
                                            <CheckCircle size={18} color={COLORS.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addAddressBtn}
                                    onPress={() => setIsAddingAddress(true)}
                                >
                                    <PlusCircle size={20} color={COLORS.primary} />
                                    <Text style={styles.addAddressTxt}>Dodaj adres</Text>
                                </TouchableOpacity>
                            )}
                        </Fragment>
                    )}
                </Section>

                {/* PŁATNOŚĆ */}
                <Section title="Metoda płatności">
                    {paymentMethod.map((pm) => {
                        const selected = selectedPaymentMethod === pm.id;
                        return (
                            <TouchableOpacity
                                key={pm.id}
                                style={[styles.selectable, selected && styles.selectableSelected]}
                                onPress={() => setSelectedPaymentMethod(pm.id)}
                            >
                                <CreditCard
                                    size={20}
                                    color={selected ? COLORS.primary : COLORS.textSecondary}
                                    style={styles.leftIcon}
                                />
                                <Text style={styles.selectableText}>{pm.name}</Text>
                                {selected && <CheckCircle size={20} color={COLORS.primary} />}
                            </TouchableOpacity>
                        );
                    })}
                </Section>

                {/* KOD PROMO */}
                <Section title="Kod promocyjny">
                    {promoApplied ? (
                        <View style={[styles.selectable, styles.selectableSelected]}>
                            <Percent
                                size={20}
                                color={COLORS.primary}
                                style={styles.leftIcon}
                            />
                            <Text style={styles.selectableText}>
                                WELCOME30 (-30 %) zastosowany
                            </Text>
                            <TouchableOpacity onPress={removePromo}>
                                <X size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.promoRow}>
                            <TextInput
                                value={promoInput}
                                onChangeText={setPromoInput}
                                placeholder="Wpisz kod"
                                placeholderTextColor={COLORS.textLight}
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                            />
                            <TouchableOpacity
                                style={[styles.smallBtn, styles.saveBtn, { marginLeft: 8 }]}
                                onPress={applyPromo}
                            >
                                <CheckCircle size={18} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                </Section>

                {/* KOSZYK */}
                <Section title="Twój koszyk">
                    {cartItems.map((it) => (
                        <View key={it.id} style={styles.row}>
                            <Text style={styles.rowLeft}>
                                {it.name} x{it.quantity}
                            </Text>
                            <Text style={styles.rowRight}>
                                {(it.price * it.quantity).toFixed(2)} zł
                            </Text>
                        </View>
                    ))}

                    {promoApplied && (
                        <View style={styles.row}>
                            <Text style={[styles.rowLeft, { color: COLORS.danger }]}>
                                Zniżka -30 %
                            </Text>
                            <Text style={[styles.rowRight, { color: COLORS.danger }]}>
                                -{discountValue.toFixed(2)} zł
                            </Text>
                        </View>
                    )}

                    <View style={[styles.row, styles.totalRow]}>
                        <Text style={styles.totalTxt}>Do zapłaty:</Text>
                        <Text style={styles.totalPrice}>{finalTotal.toFixed(2)} zł</Text>
                    </View>
                </Section>

                {/* PRZYCISK */}
                <TouchableOpacity
                    style={[
                        styles.orderBtn,
                        (isSubmitting || !itemCount) && styles.orderBtnDisabled,
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={isSubmitting || !itemCount}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.orderBtnTxt}>Złóż zamówienie</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ------------ pomocniczy section ------------ */
const Section = ({
                     title,
                     children,
                 }: {
    title: string;
    children: ReactNode;
}) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

/* ------------ style ------------ */
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.cardBackground,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.textPrimary },

    scroll: { padding: 16, paddingBottom: 40 },

    section: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 18,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 12,
        color: COLORS.textPrimary,
    },

    selectable: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    selectableSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + "15",
    },
    leftIcon: { marginRight: 10 },
    selectableText: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },

    addAddressBtn: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    addAddressTxt: {
        marginLeft: 6,
        color: COLORS.primary,
        fontWeight: "600",
    },

    addForm: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 8,
        color: COLORS.textPrimary,
    },
    formButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },
    smallBtn: {
        padding: 8,
        borderRadius: 8,
    },
    cancelBtn: { backgroundColor: COLORS.danger },
    saveBtn: { backgroundColor: COLORS.primary },

    promoRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    rowLeft: { color: COLORS.textSecondary },
    rowRight: { color: COLORS.textPrimary, fontWeight: "500" },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 8,
        marginTop: 6,
    },
    totalTxt: { fontWeight: "bold", color: COLORS.textPrimary },
    totalPrice: { fontWeight: "bold", color: COLORS.primary },

    orderBtn: {
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    orderBtnDisabled: { backgroundColor: COLORS.border },
    orderBtnTxt: { color: COLORS.white, fontSize: 17, fontWeight: "600" },
});
