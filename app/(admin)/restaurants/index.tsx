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
import { PlusCircle, Edit, Trash2, Store } from 'lucide-react-native';
import { ApiRestaurant, RestaurantApi } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

interface RestaurantForList {
    id: string;
    name: string;
    address?: string;
}

export default function ManageRestaurantsListScreen() {
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<RestaurantForList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRestaurants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiRestaurants = await RestaurantApi.list();
            const mappedRestaurants: RestaurantForList[] = apiRestaurants.map(r => ({
                id: r.id.toString(),
                name: r.name,
                address: r.address || undefined,
            }));
            setRestaurants(mappedRestaurants);
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać restauracji.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchRestaurants();
        }, [fetchRestaurants])
    );

    const handleAddRestaurant = () => {
        router.push('/(admin)/restaurants/create');
    };

    const handleEditRestaurant = (restaurantId: string) => {
        router.push({
            pathname: '/(admin)/restaurants/[id]' as any,
            params: { id: restaurantId },
        });
        console.log(`Attempting to navigate to edit restaurant with ID: ${restaurantId}`);
    };

    const handleDeleteRestaurant = (restaurantId: string, restaurantName: string) => {
        Alert.alert(
            "Potwierdź usunięcie",
            `Czy na pewno chcesz usunąć restaurację "${restaurantName}"?`,
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await RestaurantApi.delete(restaurantId);
                            Alert.alert("Sukces", `Restauracja "${restaurantName}" została usunięta.`);
                            fetchRestaurants();
                        } catch (delErr: any) {
                            Alert.alert("Błąd", `Nie udało się usunąć restauracji: ${delErr.message}`);
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
                <Text style={styles.loadingText}>Ładowanie restauracji...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
                <TouchableOpacity onPress={fetchRestaurants} style={styles.button}>
                    <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Store size={24} color={COLORS.accent} style={styles.itemIcon}/>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.listItemText}>{item.name}</Text>
                                {item.address && <Text style={styles.listItemSubtitle}>{item.address}</Text>}
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => handleEditRestaurant(item.id)} style={styles.actionButton}>
                                    <Edit size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteRestaurant(item.id, item.name)} style={styles.actionButton}>
                                    <Trash2 size={20} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyText}>Brak restauracji. Kliknij + aby dodać.</Text>
                        </View>
                    }
                    contentContainerStyle={restaurants.length === 0 ? styles.emptyListInnerContainer : styles.listContentContainer}
                    ListHeaderComponent={restaurants.length > 0 ? <View style={{ height: 10 }} /> : null}
                />
                <TouchableOpacity style={styles.fab} onPress={handleAddRestaurant}>
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
