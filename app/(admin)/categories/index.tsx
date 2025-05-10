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
import { PlusCircle, Edit, Trash2, ListChecks } from 'lucide-react-native';
import { ApiCategory, CategoryApi } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

interface CategoryForList {
    id: string;
    name: string;
}

export default function ManageCategoriesListScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState<CategoryForList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiCategories = await CategoryApi.list();
            const mappedCategories: CategoryForList[] = apiCategories.map(cat => ({
                id: cat.id.toString(),
                name: cat.name,
            }));
            setCategories(mappedCategories);
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać kategorii.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [fetchCategories])
    );

    const handleAddCategory = () => {
        router.push('/(admin)/categories/create');
    };

    const handleEditCategory = (categoryId: string) => {
        router.push({
            pathname: '/(admin)/categories/[id]',
            params: { id: categoryId },
        });
    };

    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        Alert.alert(
            "Potwierdź usunięcie",
            `Czy na pewno chcesz usunąć kategorię "${categoryName}"?`,
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await CategoryApi.delete(categoryId);
                            Alert.alert("Sukces", `Kategoria "${categoryName}" została usunięta.`);
                            fetchCategories();
                        } catch (delErr: any) {
                            Alert.alert("Błąd", `Nie udało się usunąć kategorii: ${delErr.message}`);
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
                <Text style={styles.loadingText}>Ładowanie kategorii...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
                <TouchableOpacity onPress={fetchCategories} style={styles.button}>
                    <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <ListChecks size={24} color={COLORS.accent} style={styles.itemIcon}/>
                            <Text style={styles.listItemText}>{item.name}</Text>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => handleEditCategory(item.id)} style={styles.actionButton}>
                                    <Edit size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteCategory(item.id, item.name)} style={styles.actionButton}>
                                    <Trash2 size={20} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyText}>Brak kategorii. Kliknij + aby dodać.</Text>
                        </View>
                    }
                    contentContainerStyle={categories.length === 0 ? styles.emptyListInnerContainer : styles.listContentContainer}
                    ListHeaderComponent={categories.length > 0 ? <View style={{ height: 10 }} /> : null}
                />
                <TouchableOpacity style={styles.fab} onPress={handleAddCategory}>
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
        backgroundColor: COLORS.cardBackground, paddingVertical: 18, paddingHorizontal: 20, marginVertical: 6, marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
    },
    itemIcon: {
        marginRight: 15,
    },
    listItemText: {
        fontSize: 17,
        color: COLORS.textPrimary,
        flex: 1,
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
