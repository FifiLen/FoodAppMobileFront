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
import { PlusCircle, Trash2, Heart as FavoriteIcon, UserCircle, ShoppingBag as ProductIcon, Store } from 'lucide-react-native';
import { ApiFavorite, FavoriteApi } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

interface FavoriteForList {
    id: string;
    userId: number;
    targetType: 'Produkt' | 'Restauracja' | 'Nieznany';
    targetId: number | null;
}

export default function ManageFavoritesListScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteForList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiFavorites = await FavoriteApi.list();
            const mappedFavorites: FavoriteForList[] = apiFavorites.map(fav => {
                let targetType: FavoriteForList['targetType'] = 'Nieznany';
                let targetId: number | null = null;
                if (fav.productId !== null) {
                    targetType = 'Produkt';
                    targetId = fav.productId;
                } else if (fav.restaurantId !== null) {
                    targetType = 'Restauracja';
                    targetId = fav.restaurantId;
                }
                return {
                    id: fav.id.toString(),
                    userId: fav.userId,
                    targetType: targetType,
                    targetId: targetId,
                };
            });
            setFavorites(mappedFavorites);
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać ulubionych.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [fetchFavorites])
    );

    const handleAddFavorite = () => {
        router.push('/(admin)/favorites/create');
    };

    const handleDeleteFavorite = (favoriteId: string) => {
        Alert.alert(
            "Potwierdź usunięcie",
            `Czy na pewno chcesz usunąć ten wpis ulubionych (ID: ${favoriteId})?`,
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await FavoriteApi.delete(favoriteId);
                            Alert.alert("Sukces", `Wpis ulubionych (ID: ${favoriteId}) został usunięty.`);
                            fetchFavorites();
                        } catch (delErr: any) {
                            Alert.alert("Błąd", `Nie udało się usunąć wpisu ulubionych: ${delErr.message}`);
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
                <Text style={styles.loadingText}>Ładowanie ulubionych...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
                <TouchableOpacity onPress={fetchFavorites} style={styles.button}>
                    <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <FavoriteIcon size={24} color={COLORS.accent} style={styles.itemIcon}/>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.listItemText}>Ulubione ID: {item.id}</Text>
                                <Text style={styles.listItemSubtitle}>Użytkownik ID: {item.userId}</Text>
                                <Text style={styles.listItemSubtitle}>Typ: {item.targetType}</Text>
                                {item.targetId !== null && <Text style={styles.listItemSubtitle}>ID Celu: {item.targetId}</Text>}
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteFavorite(item.id)} style={styles.actionButton}>
                                <Trash2 size={22} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyText}>Brak wpisów ulubionych. Kliknij + aby dodać.</Text>
                        </View>
                    }
                    contentContainerStyle={favorites.length === 0 ? styles.emptyListInnerContainer : styles.listContentContainer}
                    ListHeaderComponent={favorites.length > 0 ? <View style={{ height: 10 }} /> : null}
                />
                <TouchableOpacity style={styles.fab} onPress={handleAddFavorite}>
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
        backgroundColor: COLORS.cardBackground, padding: 15, marginVertical: 8, marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
    },
    itemIcon: {
        marginRight: 15,
    },
    itemTextContainer: {
        flex: 1,
    },
    listItemText: {
        fontSize: 16,
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
        marginLeft: 10,
        padding: 8,
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
