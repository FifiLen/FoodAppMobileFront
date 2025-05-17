"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    FlatList,
    ImageSourcePropType,
    SafeAreaView,
    Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/components/home-page/constants';
import { ArrowLeft, Star, MapPin, Clock, Heart } from 'lucide-react-native';
import { ProductItem, type ProductItemData } from '@/components/home-page/ProductItem';
import { API_URL } from '../constants'; // Assuming this is correct for API_URL
import { useAuth } from '@/context/AuthContext';
// Import services and types directly
import {
    restaurantService,
    productService,
    favoriteService,
    type RestaurantDetailDto as ApiRestaurantDetail,
    type ProductDto as ApiProductDto,
    type FavoriteItemDto
} from '@/src/api/services'; // Assuming barrel export from services

const DEFAULT_RESTAURANT_IMAGE_DETAIL = require('../../assets/images/placeholder-restaurant-large.png');
const LOCAL_PLACEHOLDER_IMAGE_PRODUCT = require('../../assets/images/placeholder-restaurant.png');

const getProductImageSource = (apiProductData?: ApiProductDto): ImageSourcePropType => {
    if (apiProductData?.imageUrl && apiProductData.imageUrl.startsWith("http")) {
        return { uri: apiProductData.imageUrl };
    }
    return LOCAL_PLACEHOLDER_IMAGE_PRODUCT;
};

export default function RestaurantDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ restaurantId?: string }>();
    const restaurantIdParam = params.restaurantId;

    const { isAuthenticated, userToken, isLoading: isLoadingAuth } = useAuth();

    const [restaurant, setRestaurant] = useState<ApiRestaurantDetail | null>(null);
    const [products, setProducts] = useState<ProductItemData[]>([]); // Stores ProductItemData
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Local state for favorite statuses on this screen
    const [isThisRestaurantFavorite, setIsThisRestaurantFavorite] = useState(false);
    const [favoritedProductIds, setFavoritedProductIds] = useState<Set<string>>(new Set());
    const [isTogglingRestaurantFav, setIsTogglingRestaurantFav] = useState(false);

    const mapApiProductToItemData = useCallback((
        p: ApiProductDto,
        currentRestaurantName: string | null | undefined,
        currentFavoritedProductIds: Set<string>
    ): ProductItemData => {
        const calculatedRating = 0; // Placeholder
        return {
            id: p.id.toString(),
            name: p.name || "Brak nazwy",
            description: p.description || undefined,
            price: `${p.price?.toFixed(2) ?? '0.00'} zł`,
            restaurantName: currentRestaurantName || p.restaurantName || "Nieznana restauracja",
            categoryName: p.categoryName || "Nieznana kategoria",
            image: getProductImageSource(p),
            rating: parseFloat(calculatedRating.toFixed(1)) || 0,
            apiOriginalProductData: p,
            isFavorite: isAuthenticated ? currentFavoritedProductIds.has(p.id.toString()) : false,
        };
    }, [isAuthenticated]); // Removed isProductFavorited from context

    const fetchAllScreenData = useCallback(async () => {
        if (!restaurantIdParam || isLoadingAuth) {
            if (!restaurantIdParam && !isLoadingAuth) setError("Nie podano ID restauracji.");
            setIsLoading(true); // Ensure loading is true if we bail early before fetch
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const numericRestaurantId = parseInt(restaurantIdParam, 10);
            if (isNaN(numericRestaurantId)) throw new Error("Nieprawidłowe ID restauracji.");

            // Fetch restaurant details, products, and all user favorites in parallel
            const restaurantPromise = restaurantService.getById(numericRestaurantId);
            const productsPromise = productService.getAll({ restaurantId: numericRestaurantId });
            const userFavoritesPromise =
                isAuthenticated && userToken
                    ? favoriteService.getUserFavorites(userToken)
                    : Promise.resolve([]);

            const [restaurantData, productsApiData, allUserFavDtos] = await Promise.all([
                restaurantPromise,
                productsPromise,
                userFavoritesPromise,
            ]);

            setRestaurant(restaurantData);

            const currentProductFavIds = new Set<string>();
            let isCurrentRestaurantFav = false;
            if (isAuthenticated) {
                allUserFavDtos.forEach(fav => {
                    if (fav.productId) currentProductFavIds.add(fav.productId.toString());
                    if (fav.restaurantId?.toString() === restaurantIdParam) {
                        isCurrentRestaurantFav = true;
                    }
                });
            }
            setFavoritedProductIds(currentProductFavIds);
            setIsThisRestaurantFavorite(isCurrentRestaurantFav);

            const mappedProducts = productsApiData.map(p =>
                mapApiProductToItemData(p, restaurantData.name, currentProductFavIds)
            );
            setProducts(mappedProducts);

        } catch (err: any) {
            console.error("RestaurantDetailScreen: Błąd pobierania danych:", err);
            setError(err.message || "Wystąpił błąd podczas ładowania danych.");
            setRestaurant(null);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [restaurantIdParam, isLoadingAuth, isAuthenticated, userToken, mapApiProductToItemData]);

    // Initial fetch and refetch when restaurantIdParam or auth state changes
    useEffect(() => {
        fetchAllScreenData();
    }, [fetchAllScreenData]);

    // Re-fetch data when the screen comes into focus
    useFocusEffect(
      useCallback(() => {
        if (!isLoadingAuth) { // Fetch only if auth state is resolved
            // console.log("RestaurantDetailScreen focused, fetching all screen data.");
            fetchAllScreenData();
        }
      }, [isLoadingAuth, fetchAllScreenData])
    );

    const handleToggleThisRestaurantFavorite = async () => {
        if (!isAuthenticated || !userToken || !restaurant || isTogglingRestaurantFav) return;
        setIsTogglingRestaurantFav(true);
        const newStatus = !isThisRestaurantFavorite;
        try {
            if (newStatus) {
                await favoriteService.addRestaurantFavorite(restaurant.id, userToken);
            } else {
                await favoriteService.removeRestaurantFavorite(restaurant.id, userToken);
            }
            setIsThisRestaurantFavorite(newStatus); // Update local UI state
        } catch (error: any) {
            console.error("Error toggling THIS restaurant favorite:", error);
            Alert.alert("Błąd", `Nie udało się zaktualizować ulubionej restauracji: ${error.message}`);
            // Re-fetch to ensure consistency after error
            await fetchAllScreenData();
        } finally {
            setIsTogglingRestaurantFav(false);
        }
    };

    const handleToggleProductFavoriteInList = async (productId: string, newStatus: boolean) => {
        if (!isAuthenticated || !userToken) {
            Alert.alert("Logowanie", "Zaloguj się, aby zarządzać ulubionymi produktami.");
            return;
        }
        const numericId = parseInt(productId, 10);

        // Optimistic UI update for the product list
        setFavoritedProductIds(prev => {
            const next = new Set(prev);
            if (newStatus) next.add(productId);
            else next.delete(productId);
            return next;
        });
        // This will trigger re-map via useEffect on favoritedProductIds if it's a dependency of map or product list generation
        // For immediate visual update of the specific item, ProductItem can have its own local isFavorite state
        // or we re-map the products array here.
         setProducts(prevProds => prevProds.map(p =>
            p.id === productId ? { ...p, isFavorite: newStatus } : p
        ));


        try {
            if (newStatus) {
                await favoriteService.addProductFavorite(numericId, userToken);
            } else {
                await favoriteService.removeProductFavorite(numericId, userToken);
            }
            // Re-fetch all data to ensure full consistency after successful toggle
            // This is simpler than trying to merge partial updates perfectly.
            // await fetchAllScreenData(); // Or just re-fetch favorites and update product list
        } catch (error: any) {
            console.error("Error toggling product favorite in list:", error);
            Alert.alert("Błąd", `Nie udało się zaktualizować ulubionego produktu: ${error.message}`);
            // Revert optimistic update by re-fetching all data
            await fetchAllScreenData();
        }
    };


    if (isLoading && !restaurant) {
        return (
            <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /><Text>Ładowanie...</Text></View>
        );
    }
    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}><ArrowLeft size={24} color={COLORS.textPrimary} /></TouchableOpacity>
                    <Text style={styles.headerTitleError}>Błąd</Text><View style={{width: 29}}/>
                </View>
                <View style={styles.centered}><Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchAllScreenData} style={styles.retryButton}><Text style={styles.retryButtonText}>Spróbuj ponownie</Text></TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    if (!restaurant) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}><ArrowLeft size={24} color={COLORS.textPrimary} /></TouchableOpacity>
                    <Text style={styles.headerTitleError}>Brak danych</Text><View style={{width: 29}}/>
                </View>
                <View style={styles.centered}><Text>Nie znaleziono restauracji.</Text></View>
            </SafeAreaView>
        );
    }

    const restaurantImageSource: ImageSourcePropType = restaurant.imageUrl
        ? { uri: restaurant.imageUrl }
        : DEFAULT_RESTAURANT_IMAGE_DETAIL;

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{restaurant.name}</Text>
                {isAuthenticated ? (
                    <TouchableOpacity onPress={handleToggleThisRestaurantFavorite} style={styles.headerButton} disabled={isTogglingRestaurantFav}>
                        {isTogglingRestaurantFav ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <Heart
                                size={24}
                                color={isThisRestaurantFavorite ? COLORS.primary : COLORS.textSecondary}
                                fill={isThisRestaurantFavorite ? COLORS.primary : "none"}
                            />
                        )}
                    </TouchableOpacity>
                ) : <View style={{width: (SPACING.xs || 5) * 2 + 24 }} /> }
            </View>

            <ScrollView>
                <Image source={restaurantImageSource} style={styles.restaurantImage} />
                <View style={styles.infoSection}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    {/* CuisineType is not in RestaurantDetailDto from your Swagger */}
                    {/* If you have it from another source or add it to DTO, you can display it */}
                    {/* {restaurant.cuisineType && (
                        <Text style={styles.cuisineType}>{restaurant.cuisineType}</Text>
                    )} */}
                    {typeof restaurant.averageRating === 'number' && restaurant.averageRating > 0 && (
                        <View style={styles.ratingRow}>
                            <Star size={18} color={COLORS.secondary} fill={COLORS.secondary} />
                            <Text style={styles.ratingText}>{restaurant.averageRating.toFixed(1)}</Text>
                        </View>
                    )}
                    {/* Add address, city etc. if available in restaurantData and needed */}
                    {/* {restaurant.address && (
                        <View style={styles.detailRow}>
                            <MapPin size={16} color={COLORS.textSecondary} />
                            <Text style={styles.detailText}>{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</Text>
                        </View>
                    )} */}
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    {isLoading && products.length === 0 && <ActivityIndicator color={COLORS.primary} style={{marginTop: 20}}/>}
                    {!isLoading && products.length > 0 ? (
                        <FlatList
                            data={products} // This now contains ProductItemData with correct isFavorite
                            renderItem={({ item }) => (
                                <ProductItem
                                    item={item}
                                    onToggleFavorite={isAuthenticated ? handleToggleProductFavoriteInList : undefined}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.productListRow}
                            contentContainerStyle={styles.productListContainer}
                            scrollEnabled={false}
                            extraData={favoritedProductIds} // Re-render list if this set changes
                        />
                    ) : (
                        !isLoading && <Text style={styles.emptyMenuText}>Brak produktów w menu tej restauracji.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles (ensure all constants are defined)
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.cardBackground },
    headerButton: { padding: SPACING.xs },
    headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: SPACING.sm },
    headerTitleError: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.danger, flex: 1, textAlign: 'center' },
    restaurantImage: { width: '100%', height: 220 },
    infoSection: { padding: SPACING.lg, backgroundColor: COLORS.cardBackground, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    restaurantName: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.sm },
    cuisineType: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    ratingText: { marginLeft: SPACING.xs, fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: '500' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
    detailText: { marginLeft: SPACING.sm, fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
    description: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, marginTop: SPACING.md, lineHeight: 22 },
    menuSection: { paddingVertical: SPACING.lg },
    menuTitle: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.md, paddingHorizontal: SPACING.lg },
    productListRow: {},
    productListContainer: { paddingHorizontal: SPACING.md / 2 },
    emptyMenuText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: FONT_SIZE.md, padding: SPACING.lg },
    errorText: { color: COLORS.danger, textAlign: 'center', marginBottom: SPACING.lg, fontSize: FONT_SIZE.md },
    retryButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md },
    retryButtonText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '600' },
});
