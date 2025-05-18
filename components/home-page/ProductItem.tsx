// frontend/components/home-page/ProductItem.tsx
"use client"

import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ImageSourcePropType,
    Alert,
    ActivityIndicator,
    StyleProp, // Import StyleProp
    ViewStyle,  // Import ViewStyle
} from 'react-native';
import { ShoppingCart, Star, Heart } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from './constants';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// Interface for the item data passed to ProductItem
export interface ProductItemData {
    id: string;
    name: string;
    description?: string;
    price: string;
    restaurantId: string;
    restaurantName?: string;
    categoryName?: string;
    image: ImageSourcePropType;
    rating: number;
    apiOriginalProductData?: any;
    isFavorite?: boolean;
}

// Props for the ProductItem COMPONENT
interface ProductItemComponentProps {
    item: ProductItemData;
    onToggleFavorite?: (productId: string, newStatus: boolean) => Promise<void>;
    style?: StyleProp<ViewStyle>; // <<< MODIFICATION: ADDED THIS PROP
    // onPress?: (productId: string) => void; // Optional: If you want to override default navigation from parent
}

export function ProductItem({ item, onToggleFavorite, style }: ProductItemComponentProps) { // <<< MODIFICATION: ADDED style HERE
    const router = useRouter();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

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
            image: item.image, // Assuming item.image is already ImageSourcePropType
            restaurantId: parseInt(productRestaurantId.toString()),
        };
        addToCart(productToAdd);
        Alert.alert("Dodano do koszyka", `${item.name} został dodany do Twojego koszyka!`);
    };

    const handleItemPress = () => {
        const restaurantId = item.restaurantId || item.apiOriginalProductData?.restaurantId;

        if (restaurantId) {
            console.log(`Nawigacja do restauracji ID: ${restaurantId}`);
            router.push(`/restaurant/${restaurantId}`); // Zauważ zmianę: /restaurant/ zamiast /restaurants/
        } else {
            console.error("Brak restaurantId dla produktu:", item.name);
            Alert.alert("Błąd", "Nie można otworzyć strony restauracji - brak informacji o restauracji.");
        }
    };
    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            Alert.alert("Logowanie", "Zaloguj się, aby dodać do ulubionych.");
            return;
        }
        if (!onToggleFavorite) {
            console.warn("ProductItem: onToggleFavorite prop not provided.");
            return;
        }
        if (isTogglingFavorite) return;
        setIsTogglingFavorite(true);
        try {
            await onToggleFavorite(item.id, !item.isFavorite);
        } catch (error) {
            console.error("ProductItem: Error calling onToggleFavorite prop", error);
            Alert.alert("Błąd", "Nie udało się zaktualizować ulubionych.");
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    return (
        // MODIFICATION: Apply the passed 'style' prop here
        <TouchableOpacity style={[styles.container, style]} onPress={handleItemPress} activeOpacity={0.8}>
            <Image source={item.image} style={styles.image} />
            {isAuthenticated && onToggleFavorite && (
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavoriteToggle}
                    disabled={isTogglingFavorite}
                    activeOpacity={0.7}
                >
                    {isTogglingFavorite ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Heart
                            size={22}
                            fill={item.isFavorite ? COLORS.primary : "none"}
                            color={item.isFavorite ? COLORS.primary : COLORS.textSecondary}
                        />
                    )}
                </TouchableOpacity>
            )}
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                {item.description && (
                    // For very compact views, you might reduce numberOfLines or hide description
                    <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                )}
                {item.restaurantName && (
                     // For very compact views, you might hide this
                    <Text style={styles.detailText} numberOfLines={1}>Restauracja: {item.restaurantName}</Text>
                )}
                {/* {item.categoryName && ( // Often hidden in compact views
                    <Text style={styles.detailTextItalic} numberOfLines={1}>Kategoria: {item.categoryName}</Text>
                )} */}
                <View style={styles.ratingContainer}>
                    <Star size={14} color={COLORS.secondary} fill={COLORS.secondary} /> {/* Smaller star */}
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.price}>{item.price}</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddToCartPress}>
                    <ShoppingCart size={20} color={COLORS.white} /> {/* Smaller cart icon */}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { // This is the DEFAULT style, e.g., for the 2-column grid
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS.lg,
        width: '47%',
        margin: '1.5%',
        shadowColor: SHADOWS.medium.shadowColor,
        shadowOffset: SHADOWS.medium.shadowOffset,
        shadowOpacity: SHADOWS.medium.shadowOpacity,
        shadowRadius: SHADOWS.medium.shadowRadius,
        elevation: SHADOWS.medium.elevation,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120, // Consider making this adaptable if width changes significantly
    },
    favoriteButton: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Brighter for better contrast
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.round, // Fully round
        zIndex: 1,
    },
    infoContainer: {
        paddingHorizontal: SPACING.sm,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.xs,
    },
    name: {
        fontSize: FONT_SIZE.md, // Or FONT_SIZE.sm for very compact
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs / 2,
    },
    description: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        minHeight: 16, // For one line of text
    },
    detailText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight || COLORS.textSecondary,
        marginBottom: SPACING.xs / 2,
    },
    detailTextItalic: { // Kept for completeness if you re-enable it
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight || COLORS.textSecondary,
        fontStyle: 'italic',
        marginBottom: SPACING.xs,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs / 2,
    },
    ratingText: {
        marginLeft: SPACING.xs / 2,
        fontSize: FONT_SIZE.xs, // Can be smaller
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingBottom: SPACING.sm,
        paddingTop: SPACING.xs,
        // borderTopWidth: 1, // Optional: remove for a cleaner look in compact items
        // borderTopColor: COLORS.border
    },
    price: {
        fontSize: FONT_SIZE.md, // Or FONT_SIZE.sm for compact
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    addButton: {
        backgroundColor: COLORS.accent || COLORS.primary,
        borderRadius: 16, // Make it a bit more squarish-round
        width: 32,  // Smaller
        height: 32, // Smaller
        justifyContent: 'center',
        alignItems: 'center',
    },
});

