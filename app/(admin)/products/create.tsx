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
import { useRouter } from 'expo-router';
import { DishApi, DishPayload, CategoryApi, ApiCategory, RestaurantApi, ApiRestaurant } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

export default function CreateProductScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | undefined>(undefined);

    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
    const [loadingFormData, setLoadingFormData] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDropdownData = useCallback(async () => {
        setLoadingFormData(true);
        try {
            const [cats, rests] = await Promise.all([
                CategoryApi.list(),
                RestaurantApi.list()
            ]);
            setCategories(cats);
            setRestaurants(rests);
        } catch (err) {
            console.error("Error fetching dropdown data for product form:", err);
            Alert.alert("Błąd", "Nie udało się pobrać danych potrzebnych do formularza.");
        } finally {
            setLoadingFormData(false);
        }
    }, []);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    const handleSaveProduct = async () => {
        if (!name.trim() || !price.trim() || !selectedCategoryId || !selectedRestaurantId) {
            Alert.alert("Walidacja", "Nazwa, cena, kategoria i restauracja są wymagane.");
            return;
        }
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue <= 0) {
            Alert.alert("Walidacja", "Cena musi być poprawną liczbą dodatnią.");
            return;
        }

        setLoading(true);
        setError(null);

        const payload: DishPayload = {
            name: name.trim(),
            description: description.trim() || undefined,
            price: priceValue,
            categoryId: selectedCategoryId,
            restaurantId: selectedRestaurantId,
            imageUrl: imageUrl.trim() || undefined,
        };

        try {
            const newProduct = await DishApi.create(payload);
            Alert.alert("Sukces", `Produkt "${newProduct.name}" został dodany!`);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace({ pathname: '/(admin)/products' } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Nie udało się dodać produktu. Spróbuj ponownie.";
            setError(errorMessage);
            Alert.alert("Błąd", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loadingFormData) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Ładowanie danych formularza...</Text>
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
                    <Text style={styles.title}>Dodaj Nowy Produkt</Text>

                    <Text style={styles.label}>Nazwa Produktu *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Wpisz nazwę produktu" placeholderTextColor={COLORS.textLight} autoCapitalize="sentences"/>

                    <Text style={styles.label}>Opis:</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Krótki opis produktu" placeholderTextColor={COLORS.textLight} multiline numberOfLines={3}/>

                    <Text style={styles.label}>Cena (zł) *</Text>
                    <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Np. 19.99" placeholderTextColor={COLORS.textLight} keyboardType="numeric"/>

                    <Text style={styles.label}>Kategoria *</Text>
                    <TextInput style={styles.input} value={selectedCategoryId?.toString() || ''} onChangeText={(text) => setSelectedCategoryId(text ? parseInt(text) : undefined)} placeholder="ID Kategorii" placeholderTextColor={COLORS.textLight} keyboardType="number-pad"/>


                    <Text style={styles.label}>Restauracja *</Text>
                    <TextInput style={styles.input} value={selectedRestaurantId?.toString() || ''} onChangeText={(text) => setSelectedRestaurantId(text ? parseInt(text) : undefined)} placeholder="ID Restauracji" placeholderTextColor={COLORS.textLight} keyboardType="number-pad"/>



                    <Text style={styles.label}>URL Obrazka:</Text>
                    <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="Np. http://example.com/image.png" placeholderTextColor={COLORS.textLight} keyboardType="url"/>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSaveProduct}
                        disabled={loading || loadingFormData}
                    >
                        {loading ? (<ActivityIndicator color={COLORS.white} />) : (<Text style={styles.buttonText}>Dodaj Produkt</Text>)}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: { flex: 1, },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', },
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background, },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background, },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 25, },
    label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500', },
    input: { backgroundColor: COLORS.cardBackground, color: COLORS.textPrimary, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 16, marginBottom: 18, borderWidth: 1, borderColor: COLORS.border, },
    textArea: { minHeight: 80, textAlignVertical: 'top', },
    picker: { height: 50, width: '100%', backgroundColor: COLORS.cardBackground, color: COLORS.textPrimary, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 18, },
    button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50, marginTop: 10, },
    buttonDisabled: { backgroundColor: COLORS.textLight, },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', },
    errorText: { color: COLORS.danger, marginBottom: 15, textAlign: 'center', fontSize: 14, },
});
