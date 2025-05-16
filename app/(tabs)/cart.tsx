// frontend/app/(tabs)/cart.tsx lub frontend/app/cart.tsx
"use client"

import React from 'react'; // Usunięto useState, bo nie jest tu już potrzebny do isSubmittingOrder
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    // ActivityIndicator nie jest już tu potrzebny
} from 'react-native';
import { useCart, CartItem as CartItemType } from '@/context/CartContext';
import { COLORS } from '@/components/home-page/constants';
import { Trash2, PlusCircle, MinusCircle, ShoppingBag, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
// useAuth nie jest tu już bezpośrednio potrzebny, bo logikę zamówienia przenosimy

// Komponent CartListItem pozostaje bez zmian
const CartListItem = ({ item, onUpdateQuantity, onRemove }: {
    item: CartItemType;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}) => {
    return (
        <View style={styles.cartItemContainer}>
            {item.image && (
                <Image source={item.image} style={styles.cartItemImage} />
            )}
            <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>Cena: {item.price.toFixed(2)} zł</Text>
            </View>
            <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                    <MinusCircle size={26} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                    <PlusCircle size={26} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeButton}>
                <Trash2 size={22} color={COLORS.danger} />
            </TouchableOpacity>
        </View>
    );
};

export default function CartScreen() {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalPrice,
        // getCartRestaurantId nie jest już tu potrzebne
    } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert("Pusty koszyk", "Dodaj produkty do koszyka przed złożeniem zamówienia.");
            return;
        }
        // ***** ZMIANA: Tylko nawigacja *****
        console.log("CartScreen: Przechodzenie do /checkout");
        router.push('/checkout');
        // ***** KONIEC ZMIANY *****
    };

    const handleClearCart = () => {
        Alert.alert(
            "Wyczyść koszyk",
            "Czy na pewno chcesz usunąć wszystkie produkty z koszyka?",
            [
                { text: "Anuluj", style: "cancel" },
                { text: "Wyczyść", onPress: () => clearCart(), style: "destructive" }
            ]
        );
    };

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/')} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mój Koszyk</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyCartContainer}>
                    <ShoppingBag size={80} color={COLORS.textSecondary} style={{ marginBottom: 20 }} />
                    <Text style={styles.emptyCartText}>Twój koszyk jest pusty.</Text>
                    <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
                        <Text style={styles.shopButtonText}>Przeglądaj produkty</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/')} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mój Koszyk ({itemCount})</Text>
                <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
                    <Trash2 size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={cartItems}
                renderItem={({ item }) => (
                    <CartListItem
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
            />

            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Liczba produktów:</Text>
                    <Text style={styles.summaryValue}>{itemCount}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryTextBold}>Do zapłaty:</Text>
                    <Text style={styles.summaryValueBold}>{totalPrice.toFixed(2)} zł</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutButton} // Usunięto logikę disabled i ActivityIndicator
                    onPress={handleCheckout}
                >
                    <Text style={styles.checkoutButtonText}>Przejdź do kasy</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Style pozostają takie same, ale checkoutButtonDisabled nie jest już potrzebny w tym pliku
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.cardBackground,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    clearButton: {
        padding: 5,
    },
    listContentContainer: {
        paddingBottom: 20,
    },
    cartItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cartItemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 15,
    },
    cartItemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    cartItemPrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    removeButton: {
        padding: 8,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCartText: {
        fontSize: 18,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    shopButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    summaryContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.cardBackground,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    summaryTextBold: {
        fontSize: 18,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    summaryValueBold: {
        fontSize: 18,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    checkoutButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        height: 50,
        justifyContent: 'center',
    },
    // checkoutButtonDisabled nie jest już potrzebny tutaj
    checkoutButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
});
