"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FavoriteApi, ApiFavorite } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

export default function EditFavoriteScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const favoriteId = params.id;

    const [favorite, setFavorite] = useState<ApiFavorite | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFavoriteDetails = useCallback(async (id: string) => {
        setLoadingData(true);
        setError(null);
        try {
            const fetchedFavorite = await FavoriteApi.getById(id);
            if (fetchedFavorite) {
                setFavorite(fetchedFavorite);
            } else {
                throw new Error("Nie znaleziono wpisu ulubionych.");
            }
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać danych wpisu ulubionych.");
            Alert.alert("Błąd", err.message || "Nie udało się pobrać danych.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (favoriteId) {
            fetchFavoriteDetails(favoriteId);
        } else {
            Alert.alert("Błąd", "Brak ID wpisu ulubionych do wyświetlenia/edycji.");
            setError("Brak ID wpisu.");
            setLoadingData(false);
        }
    }, [favoriteId, fetchFavoriteDetails]);

    if (loadingData) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Ładowanie danych...</Text>
            </View>
        );
    }

    if (error || !favorite) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error || "Nie można załadować danych."}</Text>
                <TouchableOpacity onPress={() => favoriteId && fetchFavoriteDetails(favoriteId)} style={styles.button}>
                    <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={[styles.button, styles.buttonSecondary]}>
                    <Text style={styles.buttonText}>Wróć</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Szczegóły Ulubionego Wpisu</Text>
                    <Text style={styles.detailText}>ID Wpisu: {favorite.id}</Text>
                    <Text style={styles.detailText}>ID Użytkownika: {favorite.userId}</Text>
                    {favorite.productId && <Text style={styles.detailText}>ID Produktu: {favorite.productId}</Text>}
                    {favorite.restaurantId && <Text style={styles.detailText}>ID Restauracji: {favorite.restaurantId}</Text>}

                    <Text style={styles.infoText}>
                        Edycja wpisów "Ulubione" przez panel admina jest zazwyczaj ograniczona do usuwania.
                        Jeśli potrzebna jest bardziej zaawansowana edycja, należy ją zaimplementować.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    scrollContainer: { flexGrow: 1, justifyContent: 'center' },
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background, justifyContent: 'center' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 25 },
    detailText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 10, textAlign: 'center' },
    infoText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 20, marginBottom: 20, fontStyle: 'italic' },
    button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50, marginTop: 10, width: '80%', alignSelf: 'center' },
    buttonSecondary: { backgroundColor: COLORS.textLight, marginTop: 10 },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    errorText: { color: COLORS.danger, marginBottom: 15, textAlign: 'center', fontSize: 14 },
});
