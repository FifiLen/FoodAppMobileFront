"use client";

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { PlusCircle, Edit, Trash2, Utensils } from 'lucide-react-native';
import { ApiDish, DishApi } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

interface ProductForList {
    id: string;
    name: string;
    price?: string;
    restaurantName?: string;
    categoryName?: string;
}

export default function ManageProductsListScreen() {
    const router = useRouter();
    const [products, setProducts] = useState<ProductForList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiDishes = await DishApi.list();
            const mappedProducts: ProductForList[] = apiDishes.map(d => ({
                id: d.id.toString(),
                name: d.name,
                price: d.price ? `${d.price.toFixed(2)} zł` : undefined,
                restaurantName: d.restaurant?.name || (d.restaurantId ? `Rest. ID: ${d.restaurantId}`: undefined),
                categoryName: d.category?.name || (d.categoryId ? `Kat. ID: ${d.categoryId}` : undefined),
            }));
            setProducts(mappedProducts);
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać produktów.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [fetchProducts])
    );

    const handleAddProduct = () => {
        router.push('/(admin)/products/create');
    };

    const handleEditProduct = (productId: string) => {
        router.push({
            pathname: '/(admin)/products/[id]',
            params: { id: productId },
        });
    };

    const handleDeleteProduct = (productId: string, productName: string) => {
        Alert.alert(
            "Potwierdź usunięcie",
            `Czy na pewno chcesz usunąć produkt "${productName}"?`,
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await DishApi.delete(productId);
                            Alert.alert("Sukces", `Produkt "${productName}" został usunięty.`);
                            fetchProducts();
                        } catch (delErr: any) {
                            Alert.alert("Błąd", `Nie udało się usunąć produktu: ${delErr.message}`);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Ładowanie produktów...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
                <TouchableOpacity onPress={fetchProducts} style={styles.button}>
                    <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Utensils size={24} color={COLORS.accent} style={styles.itemIcon}/>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.listItemText}>{item.name}</Text>
                                {item.price && <Text style={styles.listItemSubtitle}>Cena: {item.price}</Text>}
                                {item.restaurantName && <Text style={styles.listItemSubtitle}>Restauracja: {item.restaurantName}</Text>}
                                {item.categoryName && <Text style={styles.listItemSubtitle}>Kategoria: {item.categoryName}</Text>}
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => handleEditProduct(item.id)} style={styles.actionButton}>
                                    <Edit size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteProduct(item.id, item.name)} style={styles.actionButton}>
                                    <Trash2 size={20} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyText}>Brak produktów. Kliknij + aby dodać.</Text>
                        </View>
                    }
                    contentContainerStyle={products.length === 0 ? styles.emptyListInnerContainer : styles.listContentContainer}
                    ListHeaderComponent={products.length > 0 ? <View style={{ height: 10 }} /> : null}
                />
                <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
                    <PlusCircle size={32} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
    centered: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 10, color: COLORS.textSecondary,
    },
    errorText: {
        color: COLORS.danger, marginBottom: 10, textAlign: 'center', fontSize: 16,
    },
    button: {
        backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10,
    },
    buttonText: {
        color: COLORS.white, fontWeight: 'bold',
    },
    listItem: {
        backgroundColor: COLORS.cardBackground, paddingVertical: 15, paddingHorizontal: 20, marginVertical: 6, marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
    },
    itemIcon: {
        marginRight: 15,
    },
    itemTextContainer: {
        flex: 1,
    },
    listItemText: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    listItemSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 15, padding: 8,
    },
    emptyText: {
        fontSize: 16, color: COLORS.textSecondary,
    },
    emptyListContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
    },
    emptyListInnerContainer: {
        flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    },
    listContentContainer: {
        paddingBottom: 80,
    },
    fab: {
        position: 'absolute', right: 25, bottom: 25, backgroundColor: COLORS.accent, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, zIndex: 10,
    },
});
