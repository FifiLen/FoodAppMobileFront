// frontend/app/restaurant/[restaurantId].tsx
"use client"

import React, { useEffect, useState } from 'react';
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
    SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/components/home-page/constants'; // Dostosuj ścieżkę
import { ArrowLeft, Star, MapPin, Clock } from 'lucide-react-native';
// Zaimportujemy ProductItem do wyświetlania produktów restauracji
import { ProductItem } from '@/components/home-page/ProductItem'; // Dostosuj ścieżkę

const API_BASE_URL = "http://192.168.0.13:8081";

// Interfejs dla danych pojedynczej restauracji (rozszerzony)
interface RestaurantDetails {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    address?: string; // Pełny adres lub ulica
    city?: string;
    cuisineType?: string;
    averageRating?: number;
    // Możesz dodać więcej pól, np. godziny otwarcia, telefon itp.
    // reviews?: Review[]; // Jeśli chcesz wyświetlać recenzje restauracji
}

// Interfejs dla produktu (podobny do tego z ProductsSection)
interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    restaurantName?: string; // Może być przydatne, choć jesteśmy na stronie restauracji
    categoryName?: string;
    image: ImageSourcePropType;
    rating: number;
    apiOriginalProductData?: any;
}

const DEFAULT_RESTAURANT_IMAGE_DETAIL = require('../../assets/images/placeholder-restaurant-large.png'); // Stwórz większy placeholder
const LOCAL_PLACEHOLDER_IMAGE_PRODUCT = require('../../assets/images/placeholder-restaurant.png');

const getProductImageSource = (apiProductData?: any): ImageSourcePropType => {
    if (apiProductData && apiProductData.imageUrl && apiProductData.imageUrl.startsWith("http")) {
        return { uri: apiProductData.imageUrl };
    }
    return LOCAL_PLACEHOLDER_IMAGE_PRODUCT;
};

export default function RestaurantDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ restaurantId?: string }>();
    const restaurantId = params.restaurantId;

    const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!restaurantId) {
            setError("Nie podano ID restauracji.");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 1. Pobierz szczegóły restauracji
                const restaurantResponse = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`);
                if (!restaurantResponse.ok) {
                    throw new Error(`Nie udało się pobrać danych restauracji (status: ${restaurantResponse.status})`);
                }
                const restaurantData = await restaurantResponse.json();
                // Zakładamy, że API zwraca pojedynczy obiekt restauracji, a nie w $values
                setRestaurant({
                    id: restaurantData.id.toString(),
                    name: restaurantData.name || "Nazwa restauracji",
                    description: restaurantData.description,
                    imageUrl: restaurantData.imageUrl,
                    address: restaurantData.address, // Dostosuj do pól z Twojego API
                    city: restaurantData.city,
                    cuisineType: restaurantData.cuisineType || restaurantData.category?.name,
                    averageRating: restaurantData.averageRating,
                });

                // 2. Pobierz produkty dla tej restauracji
                const productsResponse = await fetch(`${API_BASE_URL}/api/products?restaurantId=${restaurantId}`);
                if (!productsResponse.ok) {
                    throw new Error(`Nie udało się pobrać produktów restauracji (status: ${productsResponse.status})`);
                }
                const productsData = await productsResponse.json();
                if (productsData && productsData.$values && Array.isArray(productsData.$values)) {
                    const mappedProducts: Product[] = productsData.$values.map((p: any) => {
                        let calculatedRating = 0;
                        if (p.reviews && p.reviews.$values && Array.isArray(p.reviews.$values) && p.reviews.$values.length > 0) {
                            const sum = p.reviews.$values.reduce((acc: number, review: any) => acc + (review.rating || 0), 0);
                            calculatedRating = sum / p.reviews.$values.length;
                        }
                        return {
                            id: p.id.toString(),
                            name: p.name || "Brak nazwy",
                            description: p.description,
                            price: `${p.price?.toFixed(2) ?? '0.00'} zł`,
                            restaurantName: restaurantData.name, // Możemy tu wstawić nazwę restauracji
                            categoryName: p.category?.name || "Nieznana kategoria",
                            image: getProductImageSource(p),
                            rating: parseFloat(calculatedRating.toFixed(1)) || 0,
                            apiOriginalProductData: p,
                        };
                    });
                    setProducts(mappedProducts);
                } else {
                    setProducts([]);
                }

            } catch (err: any) {
                console.error("RestaurantDetailScreen: Błąd pobierania danych:", err);
                setError(err.message || "Wystąpił błąd podczas ładowania danych.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [restaurantId]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Ładowanie danych restauracji...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <ArrowLeft size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitleError}>Błąd</Text>
                    <View style={{width: 24}}/>
                </View>
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Wróć</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!restaurant) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <ArrowLeft size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitleError}>Brak danych</Text>
                    <View style={{width: 24}}/>
                </View>
                <View style={styles.centered}>
                    <Text>Nie znaleziono restauracji.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const restaurantImageSource: ImageSourcePropType = restaurant.imageUrl
        ? { uri: restaurant.imageUrl }
        : DEFAULT_RESTAURANT_IMAGE_DETAIL;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{restaurant.name}</Text>
                {/* Można dodać przycisk ulubionych itp. */}
                <View style={{width: 24}}/>
            </View>

            <ScrollView>
                <Image source={restaurantImageSource} style={styles.restaurantImage} />
                <View style={styles.infoSection}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    {restaurant.cuisineType && (
                        <Text style={styles.cuisineType}>{restaurant.cuisineType}</Text>
                    )}
                    {typeof restaurant.averageRating === 'number' && restaurant.averageRating > 0 && (
                        <View style={styles.ratingRow}>
                            <Star size={18} color={COLORS.secondary} fill={COLORS.secondary} />
                            <Text style={styles.ratingText}>{restaurant.averageRating.toFixed(1)}</Text>
                        </View>
                    )}
                    {restaurant.address && (
                        <View style={styles.detailRow}>
                            <MapPin size={16} color={COLORS.textSecondary} />
                            <Text style={styles.detailText}>{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</Text>
                        </View>
                    )}
                    {/* Można dodać godziny otwarcia, np.
                    <View style={styles.detailRow}>
                        <Clock size={16} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>Otwarte: 10:00 - 22:00</Text>
                    </View>
                    */}
                    {restaurant.description && (
                        <Text style={styles.description}>{restaurant.description}</Text>
                    )}
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    {products.length > 0 ? (
                        <FlatList
                            data={products}
                            renderItem={({ item }) => <ProductItem item={item} />}
                            keyExtractor={(item) => item.id}
                            numColumns={2} // Produkty w dwóch kolumnach
                            columnWrapperStyle={styles.productListRow}
                            contentContainerStyle={styles.productListContainer}
                            scrollEnabled={false} // Wyłącz scroll dla wewnętrznej FlatList, bo jest w ScrollView
                        />
                    ) : (
                        <Text style={styles.emptyMenuText}>Brak produktów w menu tej restauracji.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    headerButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    headerTitleError: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.danger,
        flex: 1,
        textAlign: 'center',
    },
    restaurantImage: {
        width: '100%',
        height: 220, // Wyższy obrazek dla strony szczegółów
    },
    infoSection: {
        padding: 20,
        backgroundColor: COLORS.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    cuisineType: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingText: {
        marginLeft: 6,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        marginLeft: 8,
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    description: {
        fontSize: 15,
        color: COLORS.textPrimary,
        marginTop: 12,
        lineHeight: 22,
    },
    menuSection: {
        paddingVertical: 20,
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    productListRow: {
        // justifyContent: 'space-between', // Jeśli chcesz równe odstępy
    },
    productListContainer: {
        paddingHorizontal: 8, // Dopasuj do marginesów ProductItem
    },
    emptyMenuText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontSize: 16,
        padding: 20,
    },
    errorText: {
        color: COLORS.danger,
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
