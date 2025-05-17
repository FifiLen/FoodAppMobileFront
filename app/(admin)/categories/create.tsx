"use client";

import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { CategoryApi, CategoryPayload } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';


export default function CreateCategoryScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSaveCategory = async () => {
        if (!name.trim()) {
            Alert.alert("Walidacja", "Nazwa kategorii nie może być pusta.");
            return;
        }

        setLoading(true);
        setError(null);
        const payload: CategoryPayload = { name: name.trim() };

        try {
            console.log("Attempting to create category with payload:", payload);
            const newCategory = await CategoryApi.create(payload);
            console.log("Category created successfully:", newCategory);
            Alert.alert("Sukces", `Kategoria "${newCategory.name}" została dodana!`);

            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(admin)/categories');
            }
        } catch (err: any) {
            console.error("Error creating category:", err);
            const errorMessage = err.message || "Nie udało się dodać kategorii. Spróbuj ponownie.";
            setError(errorMessage);
            Alert.alert("Błąd", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Dodaj Nową Kategorię</Text>

                    <Text style={styles.label}>Nazwa Kategorii:</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Np. Napoje, Przystawki"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="sentences"
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSaveCategory}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>Dodaj Kategorię</Text>
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
