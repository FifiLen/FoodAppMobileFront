// frontend/components/home-page/ProductItem.tsx
"use client"

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType, Alert } from 'react-native';
import { ShoppingCart, Star } from 'lucide-react-native';
import { COLORS } from './constants';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext'; // Upewnij się, że ścieżka jest poprawna

interface ProductItemProps {
    item: {
        id: string;
        name: string;
        description?: string;
        price: string; // Cena jako string np. "12.99 zł"
        restaurantName?: string;
        categoryName?: string;
        image: ImageSourcePropType; // To może być { uri: '...' } lub require('...')
        rating: number;
        apiOriginalProductData?: any;
    };
}

export function ProductItem({ item }: ProductItemProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const handleAddToCartPress = () => {
        console.log(`ProductItem: Dodawanie do koszyka - ID: ${item.id}, Nazwa: ${item.name}`);

        let priceNumber: number;
        try {
            priceNumber = parseFloat(item.price.replace(/\s*zł/i, '').replace(',', '.'));
            if (isNaN(priceNumber)) throw new Error("Nie udało się sparsować ceny.");
        } catch (error) {
            console.error("Błąd konwersji ceny produktu:", item.price, error);
            Alert.alert("Błąd", "Nie udało się przetworzyć ceny produktu.");
            return;
        }

        const productRestaurantId = item.apiOriginalProductData?.restaurantId;

        if (productRestaurantId === undefined || productRestaurantId === null) {
            console.error("Błąd: Brak restaurantId dla produktu:", item.name, item.apiOriginalProductData);
            Alert.alert("Błąd", "Nie można dodać produktu do koszyka - brak informacji o restauracji.");
            return;
        }

        const productToAdd = {
            id: item.id,
            name: item.name,
            price: priceNumber,
            image: item.image,
            restaurantId: parseInt(productRestaurantId.toString()),
        };

        addToCart(productToAdd);
        Alert.alert("Dodano do koszyka", `${item.name} został dodany do Twojego koszyka!`);
    };

    const handleItemPress = () => {
        router.push(`/order/${item.id}`);
    };

    // ***** POCZĄTEK POPRAWKI: Dodano return *****
    return (
        <TouchableOpacity style={styles.container} onPress={handleItemPress} activeOpacity={0.8}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                )}
                {item.restaurantName && (
                    <Text style={styles.detailText} numberOfLines={1}>Restauracja: {item.restaurantName}</Text>
                )}
                {item.categoryName && (
                    <Text style={styles.detailTextItalic} numberOfLines={1}>Kategoria: {item.categoryName}</Text>
                )}
                <View style={styles.ratingContainer}>
                    <Star size={16} color={COLORS.secondary} fill={COLORS.secondary} />
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.price}>{item.price}</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddToCartPress}>
                    <ShoppingCart size={22} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
    // ***** KONIEC POPRAWKI *****
} // Ta klamra zamykała funkcję ProductItem, ale definicja stylów była wewnątrz.

// Definicja stylów powinna być POZA funkcją komponentu
const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        width: '47%',
        margin: '1.5%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
    },
    infoContainer: {
        padding: 10,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 3,
    },
    description: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginBottom: 4,
        minHeight: 28,
    },
    detailText: {
        fontSize: 11,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    detailTextItalic: {
        fontSize: 11,
        color: COLORS.textLight,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 10,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    addButton: {
        backgroundColor: COLORS.accent,
        borderRadius: 18,
        padding: 6,
    },
});
