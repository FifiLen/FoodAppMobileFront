"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    ImageSourcePropType,
    Alert, // Ensure this is imported
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, ChevronDown, Package, AlertCircle } from 'lucide-react-native';

import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/components/home-page/constants';
import { API_URL } from '@/app/constants';

// Import your ProductService and its types
import { productService, ProductDto } from '@/src/api/services'; // Adjusted path

// ***** IMPORT YOUR CompactProductItem and ProductItemData *****
import { CompactProductItem } from '@/components/home-page/CompactProductItem'; // Adjust path as needed
import { type ProductItemData } from '@/components/home-page/ProductItem'; // Adjust path as needed

// --- Interfaces for this screen ---
interface Category {
    id: string;
    name: string;
    icon: string;
}

const iconMap: Record<string, string> = {
    All: "🍽️",
    Pizza: "🍕",
    Burgery: "🍔",
    Sushi: "🍣",
    Healthy: "🥗",
    Desserts: "🍰",
    Pasta: "🍝",
    Tacos: "🌮",
    Kanapki: "🥪", // Added Kanapki
    Przystawki: "🍤", // Added Przystawki (using shrimp, you can choose another)
    Europejskie: "🇪🇺", // Added Europejskie (using the European flag, you can choose another)
    Śniadania: "🍳", // Added Śniadania (using fried egg, you can choose another)
    Tortilla: "🌯", // Added Tortille
    // Dodaj więcej mapowań, jeśli backend zwraca inne nazwy kategorii
}; 

// CategoryApi (can be imported from a shared services file later)
const CategoryApi = {
    list: async (): Promise<any> => { // Keep 'any' if backend structure is $values
        try {
            const response = await fetch(`${API_URL}/api/categories`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("CategoryApi.list (AllCategoriesScreen): Błąd odpowiedzi serwera:", response.status, errorText);
                throw new Error(`Błąd serwera: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("CategoryApi.list (AllCategoriesScreen): Błąd fetch:", error);
            throw error;
        }
    }
};

// --- Component ---
export default function AllCategoriesScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
    const [productsForCategory, setProductsForCategory] = useState<ProductItemData[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            setErrorCategories(null);
            try {
                const apiResponse = await CategoryApi.list();
                if (apiResponse && apiResponse.$values && Array.isArray(apiResponse.$values)) {
                    const mappedCats: Category[] = apiResponse.$values.map((c: any) => ({
                        id: c.id.toString(),
                        name: c.name || "Nieznana Kategoria",
                        icon: iconMap[c.name] || "🍽️",
                    }));
                    setCategories(mappedCats);
                } else {
                    console.error("AllCategoriesScreen: Nieoczekiwany format danych dla kategorii.", apiResponse);
                    setErrorCategories("Nie udało się wczytać kategorii (nieprawidłowy format).");
                }
            } catch (err: any) {
                console.error("AllCategoriesScreen: Błąd podczas pobierania kategorii:", err);
                setErrorCategories(err.message || "Nie udało się wczytać kategorii.");
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const fetchProductsForCategory = useCallback(async (categoryId: string) => {
        setIsLoadingProducts(true);
        setErrorProducts(null);
        setProductsForCategory([]);
        try {
            const productDtos: ProductDto[] = await productService.getAll({ categoryId: categoryId });

            const mappedProducts: ProductItemData[] = productDtos.map((p: ProductDto) => ({
                id: p.id.toString(),
                name: p.name || "Brak nazwy",
                description: p.description || undefined,
                price: `${p.price?.toFixed(2) ?? '0.00'} zł`,
                restaurantName: p.restaurantName || undefined,
                categoryName: p.categoryName || undefined,
                image: p.imageUrl ? { uri: p.imageUrl } : require('../../assets/images/placeholder-restaurant.png'), // Ensure placeholder path is correct
                rating: 0, // Defaulting as ProductDto doesn't have direct rating.
                apiOriginalProductData: p,
                isFavorite: false, // Defaulting. ProductDto doesn't have user-specific favorite status for this listing.
            }));
            setProductsForCategory(mappedProducts.slice(0, 5)); // Show e.g., first 5 products
            if (mappedProducts.length === 0) {
                console.log(`AllCategoriesScreen: Brak produktów dla kategorii ID: ${categoryId}`);
            }
        } catch (error: any) {
            console.error(`AllCategoriesScreen: Błąd pobierania produktów dla kategorii ID ${categoryId}:`, error);
            setErrorProducts(error.message || "Nie udało się wczytać produktów.");
            setProductsForCategory([]);
        } finally {
            setIsLoadingProducts(false);
        }
    }, []);

    const handleToggleCategory = (categoryId: string) => {
        if (expandedCategoryId === categoryId) {
            setExpandedCategoryId(null);
            setProductsForCategory([]);
            setErrorProducts(null);
        } else {
            setExpandedCategoryId(categoryId);
            fetchProductsForCategory(categoryId);
        }
    };

    const handleCompactProductPress = (restaurantId: string | undefined, productId: string) => {
        if (restaurantId) {
            console.log(`Navigating to restaurant with ID: ${restaurantId} (from product ${productId})`);
            router.push(`/restaurant/${restaurantId}`);
        } else {
            console.warn(`No restaurantId available for product ${productId}. Cannot navigate to restaurant.`);
            // Optionally, navigate to product detail page as a fallback or show an alert
            Alert.alert("Brak informacji", "Nie można przejść do restauracji dla tego produktu.");
            // router.push(`/product/${productId}`); // Fallback to product detail
        }
    };

    const renderProductSubList = () => {
        if (isLoadingProducts) {
            return (
                <View style={styles.productsLoadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.productsMessageText}>Ładowanie dań...</Text>
                </View>
            );
        }
        if (errorProducts) {
            return (
                <View style={styles.productsErrorContainer}>
                    <AlertCircle size={18} color={COLORS.danger} />
                    <Text style={styles.productsMessageTextError} numberOfLines={2}>{errorProducts}</Text>
                </View>
            );
        }
        if (productsForCategory.length === 0 && !isLoadingProducts) {
            return (
                <View style={styles.productsLoadingContainer}>
                    <Text style={styles.productsMessageText}>Brak dań w tej kategorii.</Text>
                </View>
            );
        }
        return (
            <FlatList
                data={productsForCategory}
                renderItem={({ item }) => (
                    <View style={styles.compactProductItemWrapper}>
                        <CompactProductItem
                            item={item}
                            onPress={handleCompactProductPress}
                        />
                    </View>
                )}
                keyExtractor={(item) => `product-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsSubListContainer}
            />
        );
    };

    const renderCategoryItem = ({ item }: { item: Category }) => {
        const isExpanded = expandedCategoryId === item.id;
        return (
            <View style={styles.categoryWrapper}>
                <TouchableOpacity
                    style={styles.categoryItemContainer}
                    onPress={() => handleToggleCategory(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>{item.icon}</Text>
                    </View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    {isExpanded ?
                        <ChevronDown size={22} color={COLORS.primary} /> :
                        <ChevronRight size={22} color={COLORS.textSecondary} />
                    }
                </TouchableOpacity>
                {isExpanded && (
                    <View style={styles.productsSection}>
                        {renderProductSubList()}
                    </View>
                )}
            </View>
        );
    };

    if (isLoadingCategories) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Ładowanie kategorii...</Text>
            </View>
        );
    }

    if (errorCategories) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{errorCategories}</Text>
            </View>
        );
    }

    if (categories.length === 0) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.infoText}>Nie znaleziono żadnych kategorii.</Text>
            </View>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <Stack.Screen
                options={{
                    title: "Wszystkie Kategorie",
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTitleStyle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '600' },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: SPACING.md, padding: SPACING.xs }}>
                            <ArrowLeft size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContentContainer: {
        paddingBottom: SPACING.lg,
    },
    categoryWrapper: {
        backgroundColor: COLORS.cardBackground,
    },
    categoryItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md + 4,
        paddingHorizontal: SPACING.lg,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.secondaryBackground, // Ensure this is in constants
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconText: {
        fontSize: FONT_SIZE.xl,
    },
    categoryName: {
        flex: 1,
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    separator: {
        height: SPACING.xs,
        backgroundColor: COLORS.background,
    },
    productsSection: {
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.backgroundSlightlyDarker, // Ensure this is in constants
    },
    productsSubListContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
    },
    compactProductItemWrapper: {
        width: 220, // Adjust width for how many items you want visible or how wide they should be
        marginRight: SPACING.md,
    },
    productsLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        minHeight: 80,
    },
    productsErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.dangerLight, // Ensure this is in constants
        marginHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.sm,
    },
    productsMessageText: {
        marginLeft: SPACING.sm,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
    },
    productsMessageTextError: {
        marginLeft: SPACING.sm,
        color: COLORS.danger,
        fontSize: FONT_SIZE.sm,
        flexShrink: 1,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
    },
    errorText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.danger,
        textAlign: 'center',
    },
    infoText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
