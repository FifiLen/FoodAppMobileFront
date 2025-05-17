// frontend/components/home-page/ProductsSection.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ListRenderItem, ActivityIndicator, ImageSourcePropType, StyleSheet } from 'react-native';
import { SectionHeader } from './section-header';
import { ProductItem } from './ProductItem';
import { COLORS } from './constants';
import { API_URL } from '@/app/constants';

const ProductApi = {
    listAll: async (): Promise<any> => {
        try {
            const response = await fetch(`${API_URL}/api/products`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("ProductApi.listAll: Błąd odpowiedzi serwera:", response.status, errorText);
                throw new Error(`Błąd serwera: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("ProductApi.listAll: Błąd fetch:", error);
            throw error;
        }
    }
};

const RestaurantApi = {
    listAll: async (): Promise<any> => {
        try {
            const response = await fetch(`${API_URL}/api/restaurants`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("RestaurantApi.listAll: Błąd odpowiedzi serwera restauracji:", response.status, errorText);
                throw new Error(`Błąd serwera restauracji: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("RestaurantApi.listAll: Błąd fetch:", error);
            throw error;
        }
    }
};

interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    restaurantName?: string;
    categoryName?: string;
    categoryId?: string; // Kluczowe dla filtrowania
    image: ImageSourcePropType;
    rating: number;
    apiOriginalProductData?: any;
}

interface SimpleRestaurant {
    id: string;
    name: string;
}

const LOCAL_PLACEHOLDER_IMAGE_PRODUCT = require('../../assets/images/placeholder-restaurant.png');

const getProductImageSource = (apiProductData?: any): ImageSourcePropType => {
    if (apiProductData && apiProductData.imageUrl && apiProductData.imageUrl.startsWith("http")) {
        return { uri: apiProductData.imageUrl };
    }
    return LOCAL_PLACEHOLDER_IMAGE_PRODUCT;
};

interface ProductsSectionProps {
    selectedCategoryId: string | null;
}

export function ProductsSection({ selectedCategoryId }: ProductsSectionProps) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [restaurants, setRestaurants] = useState<SimpleRestaurant[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);

    // Efekt do pobierania danych początkowych (produkty i restauracje)
    useEffect(() => {
        const fetchInitialData = async () => {
            console.log("ProductsSection: Rozpoczynam pobieranie danych początkowych...");
            setLoadingProducts(true);
            setLoadingRestaurants(true);
            try {
                const restaurantApiResponse = await RestaurantApi.listAll();
                let mappedRestaurants: SimpleRestaurant[] = [];
                if (restaurantApiResponse && restaurantApiResponse.$values && Array.isArray(restaurantApiResponse.$values)) {
                    mappedRestaurants = restaurantApiResponse.$values.map((r: any) => ({
                        id: r.id.toString(),
                        name: r.name || "Nieznana Restauracja",
                    }));
                    setRestaurants(mappedRestaurants);
                    console.log("ProductsSection: Restauracje pomyślnie zmapowane:", mappedRestaurants.length);
                } else {
                    console.error("ProductsSection: Nieoczekiwany format danych dla restauracji.", restaurantApiResponse);
                }

                const productApiResponse = await ProductApi.listAll();
                if (productApiResponse && productApiResponse.$values && Array.isArray(productApiResponse.$values)) {
                    const productsArrayFromApi = productApiResponse.$values;
                    const mappedProductsResult: Product[] = productsArrayFromApi.map((p: any) => {
                        let calculatedRating = 0;
                        if (p.reviews && p.reviews.$values && Array.isArray(p.reviews.$values) && p.reviews.$values.length > 0) {
                            const ratingsOnly = p.reviews.$values.map((review: any) => review.rating || 0);
                            const sum = ratingsOnly.reduce((acc: number, rating: number) => acc + rating, 0);
                            calculatedRating = sum / p.reviews.$values.length;
                        } else if (p.reviews && Array.isArray(p.reviews) && p.reviews.length > 0) { // Alternatywna struktura
                            const ratingsOnly = p.reviews.map((review: any) => review.rating || 0);
                            const sum = ratingsOnly.reduce((acc: number, rating: number) => acc + rating, 0);
                            calculatedRating = sum / p.reviews.length;
                        }

                        const restaurant = mappedRestaurants.find(r => r.id === p.restaurantId?.toString());

                        // Upewnij się, że 'categoryId' jest poprawnie pobierane z 'p'
                        // API może zwracać 'categoryId' lub 'CategoryId'
                        const categoryIdFromApi = p.categoryId?.toString() || p.CategoryId?.toString();

                        return {
                            id: p.id.toString(),
                            name: p.name || "Brak nazwy",
                            description: p.description,
                            price: `${p.price?.toFixed(2) ?? '0.00'} zł`,
                            restaurantName: restaurant?.name || "Nieznana restauracja",
                            categoryName: p.category?.name || "Nieznana kategoria",
                            categoryId: categoryIdFromApi, // Używamy pobranego ID kategorii
                            image: getProductImageSource(p),
                            rating: parseFloat(calculatedRating.toFixed(1)) || 0,
                            apiOriginalProductData: p,
                        };
                    });
                    setAllProducts(mappedProductsResult);
                    if (mappedProductsResult.length > 0) {
                        console.log("ProductsSection: Produkty zmapowane. Pierwszy produkt categoryId:", mappedProductsResult[0].categoryId, "(typ:", typeof mappedProductsResult[0].categoryId, ")");
                    }
                } else {
                    console.error("ProductsSection: Nieoczekiwany format danych dla produktów.", productApiResponse);
                    setAllProducts([]);
                }
            } catch (err) {
                console.error("ProductsSection: Błąd podczas pobierania danych początkowych:", err);
                setAllProducts([]);
                setRestaurants([]);
            } finally {
                setLoadingProducts(false);
                setLoadingRestaurants(false);
                console.log("ProductsSection: Zakończono pobieranie danych początkowych.");
            }
        };

        fetchInitialData();
    }, []); // Pusta tablica zależności - uruchom tylko raz

    // Efekt do filtrowania produktów, gdy zmieni się selectedCategoryId lub allProducts
    useEffect(() => {
        // Nie filtruj, jeśli dane wciąż się ładują
        if (loadingProducts || loadingRestaurants) {
            console.log("ProductsSection (Filtrowanie): Wstrzymano, dane wciąż się ładują.");
            return;
        }

        console.log("ProductsSection (Filtrowanie): Uruchomiono. selectedCategoryId:", selectedCategoryId, "(typ:", typeof selectedCategoryId, ")");
        if (allProducts.length > 0) {
            console.log("ProductsSection (Filtrowanie): Przykładowe categoryId z allProducts:", allProducts.slice(0,3).map(p=>p.categoryId));
        }


        if (!selectedCategoryId) {
            setFilteredProducts([]); // Jeśli nie ma wybranej kategorii, pokaż pustą listę
            console.log("ProductsSection (Filtrowanie): Brak wybranej kategorii, filteredProducts ustawione na [].");
        } else {
            const filtered = allProducts.filter(product => {
                // Upewnij się, że porównujesz stringi lub że typy są zgodne
                return product.categoryId === selectedCategoryId;
            });
            setFilteredProducts(filtered);
            console.log(`ProductsSection (Filtrowanie): Dla kategorii ID '${selectedCategoryId}', znaleziono ${filtered.length} produktów.`);
            if (filtered.length === 0 && allProducts.some(p => p.categoryId === selectedCategoryId)) {
                console.warn("ProductsSection (Filtrowanie): UWAGA! Są produkty z tą kategorią w allProducts, ale filtr zwrócił 0. Sprawdź dokładnie porównanie typów i wartości ID.");
            }
        }
    }, [selectedCategoryId, allProducts, loadingProducts, loadingRestaurants]);

    const renderProductItem: ListRenderItem<Product> = ({ item }) => (
        <ProductItem item={item} />
    );

    const renderListStatus = () => {
        if (loadingProducts || loadingRestaurants) {
            return (
                <View style={styles.centeredMessage}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.messageText}>Ładowanie produktów…</Text>
                </View>
            );
        }
        if (selectedCategoryId && filteredProducts.length === 0 && !loadingProducts && !loadingRestaurants) {
            return (
                <Text style={styles.centeredMessageText}>
                    Brak produktów w tej kategorii.
                </Text>
            );
        }
        if (!selectedCategoryId && !loadingProducts && !loadingRestaurants) {
            return (
                <Text style={styles.centeredMessageText}>
                    Wybierz kategorię, aby zobaczyć produkty.
                </Text>
            );
        }
        return null;
    };

    return (
        <View style={{ marginBottom: 32 }}>
            <SectionHeader title={selectedCategoryId ? "Produkty" : "Wybierz kategorię"} />
            {renderListStatus()}
            {/* Renderuj listę tylko jeśli nie ładujemy, wybrano kategorię i są jakieś przefiltrowane produkty */}
            {!loadingProducts && !loadingRestaurants && selectedCategoryId && filteredProducts.length > 0 && (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    centeredMessage: { padding: 24, alignItems: "center", justifyContent: "center", minHeight: 100 },
    messageText: { marginTop: 8, color: COLORS.textSecondary },
    centeredMessageText: { paddingHorizontal: 24, paddingVertical: 16, textAlign: "center", color: COLORS.textSecondary, minHeight: 50 },
    row: { /* Możesz tu dodać style, jeśli potrzebujesz np. justifyContent: 'space-between' */ },
});
