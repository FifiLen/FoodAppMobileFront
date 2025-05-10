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
import { DishApi, DishPayload, ApiDish, CategoryApi, ApiCategory, RestaurantApi, ApiRestaurant } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

export default function EditProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const productId = params.id;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | undefined>(undefined);

    const [initialData, setInitialData] = useState<Partial<DishPayload>>({});
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFormData = useCallback(async (id: string) => {
        setLoadingData(true);
        setError(null);
        try {
            const [productDetails, fetchedCategories, fetchedRestaurants] = await Promise.all([
                DishApi.getById(id),
                CategoryApi.list(),
                RestaurantApi.list()
            ]);

            setCategories(fetchedCategories);
            setRestaurants(fetchedRestaurants);

            if (productDetails) {
                setName(productDetails.name || '');
                setDescription(productDetails.description || '');
                setPrice(productDetails.price?.toString() || '');
                setImageUrl(productDetails.imageUrl || '');
                setSelectedCategoryId(productDetails.categoryId);
                setSelectedRestaurantId(productDetails.restaurantId);

                setInitialData({
                    name: productDetails.name,
                    description: productDetails.description,
                    price: productDetails.price,
                    imageUrl: productDetails.imageUrl,
                    categoryId: productDetails.categoryId,
                    restaurantId: productDetails.restaurantId,
                });
            } else {
                throw new Error("Nie znaleziono produktu.");
            }
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać danych produktu lub formularza.");
            Alert.alert("Błąd", err.message || "Nie udało się pobrać danych.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (productId) {
            fetchFormData(productId);
        } else {
            Alert.alert("Błąd", "Brak ID produktu do edycji.");
            setError("Brak ID produktu.");
            setLoadingData(false);
        }
    }, [productId, fetchFormData]);

    const handleUpdateProduct = async () => {
        if (!name.trim() || !price.trim() || !selectedCategoryId || !selectedRestaurantId) {
            Alert.alert("Walidacja", "Nazwa, cena, kategoria i restauracja są wymagane.");
            return;
        }
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue <= 0) {
            Alert.alert("Walidacja", "Cena musi być poprawną liczbą dodatnią.");
            return;
        }
        if (!productId) {
            Alert.alert("Błąd", "Brak ID produktu do zaktualizowania.");
            return;
        }

        const currentData: DishPayload = {
            name: name.trim(),
            description: description.trim() || undefined,
            price: priceValue,
            categoryId: selectedCategoryId,
            restaurantId: selectedRestaurantId,
            imageUrl: imageUrl.trim() || undefined,
        };

        let changed = false;
        if (currentData.name !== initialData.name) changed = true;
        if (currentData.description !== (initialData.description || undefined )) changed = true;
        if (currentData.price !== initialData.price) changed = true;
        if (currentData.imageUrl !== (initialData.imageUrl || undefined)) changed = true;
        if (currentData.categoryId !== initialData.categoryId) changed = true;
        if (currentData.restaurantId !== initialData.restaurantId) changed = true;


        if (!changed) {
            Alert.alert("Informacja", "Nie wprowadzono żadnych zmian.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await DishApi.update(productId, currentData);
            Alert.alert("Sukces", `Produkt "${currentData.name}" został zaktualizowany!`);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace({ pathname: '/(admin)/products/index' } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Nie udało się zaktualizować produktu.";
            setError(errorMessage);
            Alert.alert("Błąd", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Ładowanie danych produktu...</Text>
            </View>
        );
    }

    if (error && !initialData.name) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => productId && fetchFormData(productId)} style={styles.button}>
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
                    <Text style={styles.title}>Edytuj Produkt</Text>

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
                        onPress={handleUpdateProduct}
                        disabled={loading || !name.trim()}
                    >
                        {loading ? (<ActivityIndicator color={COLORS.white} />) : (<Text style={styles.buttonText}>Zapisz Zmiany</Text>)}
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
    buttonSecondary: { backgroundColor: COLORS.textLight, marginTop: 10, },
    buttonDisabled: { backgroundColor: COLORS.textLight, },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', },
    errorText: { color: COLORS.danger, marginBottom: 15, textAlign: 'center', fontSize: 14, },
});
