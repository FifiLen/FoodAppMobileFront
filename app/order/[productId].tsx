// app/order/[productId].tsx
"use client"

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    ScrollView,
    TouchableOpacity,
    ImageSourcePropType,
    SafeAreaView,
    Alert,
    Button
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/components/home-page/constants'; // Dostosuj ścieżkę
import { ArrowLeft, ShoppingCart } from 'lucide-react-native'; // Ikony
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'; // Dla lepszej obsługi
import { API_URL } from '../constants';


// Interfejs dla pełnych danych produktu (może być bardziej szczegółowy niż w ProductItem)
interface OrderProductDetails {
    id: string;
    name: string;
    description?: string;
    price: string; // Już sformatowana cena
    imageUrl?: string; // URL obrazka z API
    imageSource: ImageSourcePropType; // Obrazek dla UI
    restaurantName?: string;
    categoryName?: string;
    // Możesz dodać więcej pól, jeśli API je zwraca dla pojedynczego produktu
}

const LOCAL_PLACEHOLDER_IMAGE_ORDER = require('../../assets/images/placeholder-restaurant.png'); // Dostosuj ścieżkę

const getOrderProductImageSource = (apiProductData?: any): ImageSourcePropType => {
    if (apiProductData && apiProductData.imageUrl && apiProductData.imageUrl.startsWith("http")) {
        return { uri: apiProductData.imageUrl };
    }
    return LOCAL_PLACEHOLDER_IMAGE_ORDER;
};


export default function OrderScreen() {
    const router = useRouter();
    const { productId } = useLocalSearchParams<{ productId?: string }>(); // Pobierz productId z parametrów trasy
    const [product, setProduct] = useState<OrderProductDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (productId) {
            console.log(`OrderScreen: Ładowanie produktu o ID: ${productId}`);
            setIsLoading(true);
            setError(null);
            fetch(`${API_URL}/api/ProductsControler/${productId}`) // Użyj endpointu GET by ID
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Błąd serwera: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data: any) => { // Załóżmy, że API zwraca pojedynczy obiekt produktu (nie w $values)
                    console.log(`OrderScreen: Otrzymano dane produktu:`, JSON.stringify(data, null, 2));
                    if (data && data.id) { // Sprawdź, czy dane są poprawne
                        setProduct({
                            id: data.id.toString(),
                            name: data.name || "Brak nazwy",
                            description: data.description,
                            price: `${data.price?.toFixed(2) ?? '0.00'} zł`,
                            imageUrl: data.imageUrl,
                            imageSource: getOrderProductImageSource(data),
                            restaurantName: data.restaurant?.name || "Nieznana restauracja", // Zakłada, że API dołącza obiekt restaurant
                            categoryName: data.category?.name || "Nieznana kategoria",   // Zakłada, że API dołącza obiekt category
                        });
                    } else {
                        throw new Error("Otrzymano niekompletne dane produktu z API.");
                    }
                })
                .catch(err => {
                    console.error(`OrderScreen: Błąd pobierania produktu ${productId}:`, err);
                    setError(err.message || "Nie udało się załadować danych produktu.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setError("Nie podano ID produktu.");
            setIsLoading(false);
            console.log("OrderScreen: Brak productId w parametrach trasy.");
        }
    }, [productId]);

    const handlePlaceOrder = async () => {
        if (!product) return;

        setIsSubmitting(true);
        console.log(`OrderScreen: Składanie zamówienia dla: ${product.name}, ilość: ${quantity}`);

        try {
            // Wyciągamy wartość liczbową ceny z sformatowanego stringa (np. "10.99 zł" -> 10.99)
            const priceValue = parseFloat(product.price.replace(' zł', ''));
            const totalAmount = priceValue * quantity;

            // KROK 1: Utwórz podstawowe zamówienie (bez elementów zamówienia)
            const orderData = {
                OrderDate: new Date().toISOString(),
                TotalAmount: totalAmount,
                Status: "Pending",
                UserId: 1,
                RestaurantId: 1,
                DeliveryAddressId: 1
            };

            console.log("Krok 1: Tworzenie podstawowego zamówienia:", JSON.stringify(orderData, null, 2));

            const orderResponse = await fetch(`${API_URL}/api/OrderControler`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!orderResponse.ok) {
                const errorText = await orderResponse.text();
                console.error("Błąd tworzenia podstawowego zamówienia:", errorText);
                throw new Error(`Błąd serwera podczas tworzenia zamówienia: ${orderResponse.status}`);
            }

            // Pobierz utworzone zamówienie z identyfikatorem
            const createdOrder = await orderResponse.json();
            console.log("Zamówienie utworzone pomyślnie:", createdOrder);
            const orderId = createdOrder.id;

            if (!orderId) {
                throw new Error("Utworzone zamówienie nie zawiera ID");
            }

            // KROK 2: Dodaj element zamówienia przez osobny endpoint
            const orderItemData = {
                OrderId: orderId,
                ProductId: parseInt(product.id),
                Quantity: quantity,
                UnitPrice: priceValue
            };

            console.log("Krok 2: Dodawanie elementu zamówienia:", JSON.stringify(orderItemData, null, 2));

            const itemResponse = await fetch(`${API_URL}/api/OrderItemControler`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderItemData),
            });

            if (!itemResponse.ok) {
                const errorText = await itemResponse.text();
                console.error("Błąd dodawania elementu zamówienia:", errorText);

                // Możemy spróbować anulować zamówienie lub oznaczyć je jako problem
                console.warn("Element zamówienia nie został dodany. Zamówienie może być niekompletne.");

                // Opcjonalnie można dodać kod, który aktualizuje zamówienie w celu oznaczenia problemu
                // np. próba aktualizacji statusu zamówienia na "Problem" przez PUT na OrderControler/{orderId}
            } else {
                const createdItem = await itemResponse.json();
                console.log("Element zamówienia dodany pomyślnie:", createdItem);
            }

            // KROK 3: Informacja o sukcesie i nawigacja
            Alert.alert(
                "Zamówienie złożone!",
                `Twoje zamówienie "${product.name}" (${quantity} szt.) zostało przyjęte do realizacji.`,
                [
                    {
                        text: "OK",
                        onPress: () => router.push('/(tabs)')
                    }
                ]
            );
        } catch (error) {
            console.error("Błąd procesu zamawiania:", error);
            Alert.alert(
                "Błąd zamówienia",
                "Nie udało się złożyć zamówienia. Spróbuj ponownie później."
            );
        } finally {
            setIsSubmitting(false);
        }
    };





    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Ładowanie danych produktu...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Wróć" onPress={() => router.back()} color={COLORS.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Nie znaleziono produktu.</Text>
                <Button title="Wróć" onPress={() => router.back()} color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Szczegóły zamówienia</Text>
                <View style={{width: 40}} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Image source={product.imageSource} style={styles.productImage} />
                <Text style={styles.productName}>{product.name}</Text>
                {product.description && <Text style={styles.productDescription}>{product.description}</Text>}
                <Text style={styles.productPrice}>{product.price}</Text>

                <View style={styles.detailsContainer}>
                    {product.restaurantName && <Text style={styles.detailText}>Restauracja: {product.restaurantName}</Text>}
                    {product.categoryName && <Text style={styles.detailText}>Kategoria: {product.categoryName}</Text>}
                </View>

                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Ilość:</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                            onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                            disabled={quantity <= 1}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.quantityValue}>{quantity}</Text>

                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(prev => prev + 1)}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.orderButton, isSubmitting && styles.orderButtonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <>
                            <ShoppingCart size={20} color={COLORS.white} style={{marginRight: 10}} />
                            <Text style={styles.orderButtonText}>
                                Złóż zamówienie ({(parseFloat(product.price.replace(' zł', '')) * quantity).toFixed(2)} zł)
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

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
        paddingVertical: 10,
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.textSecondary,
    },
    errorText: {
        color: COLORS.danger,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
    },
    scrollContainer: {
        padding: 20,
    },
    productImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    productName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    productDescription: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 15,
        lineHeight: 22,
    },
    productPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
    },
    detailsContainer: {
        marginBottom: 30,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    detailText: {
        fontSize: 15,
        color: COLORS.textPrimary,
        marginBottom: 5,
    },
    orderButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 20,
    },
    orderButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonDisabled: {
        backgroundColor: COLORS.border,
    },
    quantityButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityValue: {
        fontSize: 18,
        fontWeight: '500',
        marginHorizontal: 15,
        minWidth: 30,
        textAlign: 'center',
    },
    orderButtonDisabled: {
        backgroundColor: COLORS.border,
    },
});
