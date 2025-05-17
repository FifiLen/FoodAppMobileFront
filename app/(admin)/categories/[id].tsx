"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CategoryApi, CategoryPayload, ApiCategory } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

export default function EditCategoryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const categoryId = params.id;

    const [name, setName] = useState('');
    const [initialName, setInitialName] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategoryDetails = useCallback(async (id: string) => {
        console.log(`Fetching details for category ID: ${id}`);
        setLoadingData(true);
        setError(null);
        try {
            const category = await CategoryApi.getById(id);
            if (category) {
                setName(category.name);
                setInitialName(category.name);
            } else {
                throw new Error("Nie znaleziono kategorii.");
            }
        } catch (err: any) {
            console.error("Error fetching category details:", err);
            setError(err.message || "Nie udało się pobrać danych kategorii.");
            Alert.alert("Błąd", err.message || "Nie udało się pobrać danych kategorii.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (categoryId) {
            fetchCategoryDetails(categoryId);
        } else {

            Alert.alert("Błąd", "Brak ID kategorii do edycji.");
            setError("Brak ID kategorii.");
            setLoadingData(false);

        }
    }, [categoryId, fetchCategoryDetails]);

    const handleUpdateCategory = async () => {
        if (!name.trim()) {
            Alert.alert('Walidacja', 'Nazwa kategorii nie może być pusta.');
            return;
        }
        if (name.trim() === initialName) {
            Alert.alert('Informacja', 'Nie wprowadzono żadnych zmian.');
            return;
        }
        if (!categoryId) {
            Alert.alert('Błąd', 'Brak ID kategorii do zaktualizowania.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await CategoryApi.update(categoryId, { name: name.trim() });
            Alert.alert('Sukces', `Kategoria "${name.trim()}" została zaktualizowana!`);
            router.canGoBack() ? router.back() : router.replace('/(admin)/categories');
        } catch (err: any) {
            const msg = err.message ?? 'Nie udało się zaktualizować kategorii.';
            setError(msg);
            Alert.alert('Błąd', msg);
        } finally {
            setLoading(false);
        }
    };


    if (loadingData) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Ładowanie danych kategorii...</Text>
            </View>
        );
    }

    if (error && !name) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => categoryId && fetchCategoryDetails(categoryId)} style={styles.button}>
                    <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={[styles.button, styles.buttonSecondary]}>
                    <Text style={styles.buttonText}>Wróć</Text>
                </TouchableOpacity>
            </View>
        );
    }


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Edytuj Kategorię</Text>

                    <Text style={styles.label}>Nazwa Kategorii:</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Wpisz nową nazwę kategorii"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="sentences"
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleUpdateCategory}
                        disabled={loading || name.trim() === initialName}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>Zapisz Zmiany</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: COLORS.cardBackground,
        color: COLORS.textPrimary,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonSecondary: {
        backgroundColor: COLORS.textLight,
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: COLORS.textLight,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: COLORS.danger,
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 14,
    },
});
