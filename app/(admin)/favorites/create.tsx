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
import {
    FavoriteApi,
    FavoriteCreatePayload,
} from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

export default function CreateFavoriteScreen() {
    const router = useRouter();

    const [userId, setUserId] = useState<string>('');
    const [productId, setProductId] = useState<string>('');
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [favoriteType, setFavoriteType] = useState<'product' | 'restaurant'>('product');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSaveFavorite = async () => {
        const userIdValue = parseInt(userId, 10);
        const productIdValue = favoriteType === 'product' && productId ? parseInt(productId, 10) : null;
        const restaurantIdValue = favoriteType === 'restaurant' && restaurantId ? parseInt(restaurantId, 10) : null;

        if (isNaN(userIdValue)) {
            Alert.alert("Walidacja", "ID Użytkownika jest wymagane i musi być liczbą.");
            return;
        }
        if (favoriteType === 'product' && (productIdValue === null || isNaN(productIdValue))) {
            Alert.alert("Walidacja", "ID Produktu jest wymagane dla ulubionego produktu i musi być liczbą.");
            return;
        }
        if (favoriteType === 'restaurant' && (restaurantIdValue === null || isNaN(restaurantIdValue))) {
            Alert.alert("Walidacja", "ID Restauracji jest wymagane dla ulubionej restauracji i musi być liczbą.");
            return;
        }

        setLoading(true);
        setError(null);

        const payload: FavoriteCreatePayload = {
            userId: userIdValue,
            productId: productIdValue,
            restaurantId: restaurantIdValue,
            id: 0,
            product: null,
            restaurant: restaurantIdValue ? { id: restaurantIdValue, name: null, favorites: [], orders: [], products: [], reviews: [] } : null,
            user: { id: userIdValue, name: null, email: null, addresses: [], favorites: [], orders: [], reviews: [] },
        };

        try {
            const newFavorite = await FavoriteApi.create(payload);
            Alert.alert("Sukces", `Wpis ulubionych (ID: ${newFavorite.id}) został dodany!`);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace({ pathname: '/(admin)/favorites/index' } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Nie udało się dodać wpisu ulubionych.";
            setError(errorMessage);
            Alert.alert("Błąd", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Dodaj Nowy Wpis Ulubionych</Text>

                    <Text style={styles.label}>ID Użytkownika *</Text>
                    <TextInput style={styles.input} value={userId} onChangeText={setUserId} placeholder="Wpisz ID użytkownika" placeholderTextColor={COLORS.textLight} keyboardType="number-pad"/>

                    <Text style={styles.label}>Typ Ulubionego *</Text>
                    <View style={styles.radioContainer}>
                        <TouchableOpacity style={[styles.radioButton, favoriteType === 'product' && styles.radioButtonActive]} onPress={() => setFavoriteType('product')}>
                            <Text style={favoriteType === 'product' ? styles.radioTextActive : styles.radioText}>Produkt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.radioButton, favoriteType === 'restaurant' && styles.radioButtonActive]} onPress={() => setFavoriteType('restaurant')}>
                            <Text style={favoriteType === 'restaurant' ? styles.radioTextActive : styles.radioText}>Restauracja</Text>
                        </TouchableOpacity>
                    </View>

                    {favoriteType === 'product' && (
                        <>
                            <Text style={styles.label}>ID Produktu *</Text>
                            <TextInput style={styles.input} value={productId} onChangeText={setProductId} placeholder="Wpisz ID produktu" placeholderTextColor={COLORS.textLight} keyboardType="number-pad"/>
                        </>
                    )}

                    {favoriteType === 'restaurant' && (
                        <>
                            <Text style={styles.label}>ID Restauracji *</Text>
                            <TextInput style={styles.input} value={restaurantId} onChangeText={setRestaurantId} placeholder="Wpisz ID restauracji" placeholderTextColor={COLORS.textLight} keyboardType="number-pad"/>
                        </>
                    )}

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSaveFavorite} disabled={loading}>
                        {loading ? (<ActivityIndicator color={COLORS.white} />) : (<Text style={styles.buttonText}>Dodaj do Ulubionych</Text>)}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center' },
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 25 },
    label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500', marginTop: 10 },
    input: { backgroundColor: COLORS.cardBackground, color: COLORS.textPrimary, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 16, marginBottom: 5, borderWidth: 1, borderColor: COLORS.border },
    radioContainer: { flexDirection: 'row', marginBottom: 18, justifyContent: 'space-around' },
    radioButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
    radioButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    radioText: { color: COLORS.textPrimary },
    radioTextActive: { color: COLORS.white },
    button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50, marginTop: 20 },
    buttonDisabled: { backgroundColor: COLORS.textLight },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    errorText: { color: COLORS.danger, marginVertical: 10, textAlign: 'center', fontSize: 14 },
});
