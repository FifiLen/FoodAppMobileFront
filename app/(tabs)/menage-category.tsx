"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { PlusCircle, Edit, Trash2 } from 'lucide-react-native';
import { ApiCategory, CategoryApi } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

interface CategoryForList {
    id: string;
    name: string;
}

export default function ManageCategoriesScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState<CategoryForList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        console.log("Fetching categories for management...");
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
            console.error("Error fetching categories:", err);
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
        Alert.alert("Info", "Nawigacja do dodawania kategorii (TODO)");
    };

    const handleEditCategory = (categoryId: string) => {
        Alert.alert("Info", `Edycja kategorii ${categoryId} (TODO)`);
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
                        console.log(`Usuwanie kategorii ${categoryId}`);
                        Alert.alert("Info", `Usuwanie kategorii ${categoryId} (TODO)`);
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Ładowanie kategorii...</Text>
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
        <View style={styles.container}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
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
                ListEmptyComponent={<Text style={styles.emptyText}>Brak kategorii do wyświetlenia.</Text>}
            />
            <TouchableOpacity style={styles.fab} onPress={handleAddCategory}>
                <PlusCircle size={32} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: COLORS.danger,
        marginBottom: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    listItem: {
        backgroundColor: COLORS.cardBackground,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    listItemText: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 15,
        padding: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: COLORS.textSecondary,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: COLORS.accent,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});
