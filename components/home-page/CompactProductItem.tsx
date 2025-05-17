// components/home-page/CompactProductItem.tsx
"use client";

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
// Removed PlusCircle as we are removing the add button for this version
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from './constants';
import { ProductItemData } from './ProductItem'; // Reuse the data interface

// Props for CompactProductItem
interface CompactProductItemProps {
    item: ProductItemData;
    // onPress will now be called with the restaurantId (if available)
    onPress: (restaurantId: string | undefined, productId: string) => void;
}

export function CompactProductItem({ item, onPress }: CompactProductItemProps) {
    // Extract restaurantId from apiOriginalProductData
    // Your ProductDto should ideally have restaurantId directly, or ensure apiOriginalProductData has it.
    const restaurantId = item.apiOriginalProductData?.restaurantId?.toString();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(restaurantId, item.id)} // Pass restaurantId and productId
            activeOpacity={0.7}
        >
            <Image source={item.image} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
                {/* Optionally, show restaurant name if space and data allow */}
                {item.restaurantName && (
                    <Text style={styles.restaurantNameText} numberOfLines={1}>
                        {item.restaurantName}
                    </Text>
                )}
            </View>
            {/* Add to cart button removed for this version */}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        // width: '100%', // It will take the width from its wrapper in FlatList
        ...SHADOWS.small,
        // marginBottom: SPACING.sm, // Handled by wrapper or FlatList contentContainerStyle
    },
    image: {
        width: 50, // Slightly smaller image for more compact row
        height: 50,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.md, // Increased margin between image and text
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs / 2,
    },
    price: {
        fontSize: FONT_SIZE.sm,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SPACING.xs / 2,
    },
    restaurantNameText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs / 2,
    }
    // addButton style removed
});
