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
import { RestaurantApi, RestaurantPayload, ApiRestaurant } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

type InitialRestaurantDataType = {
    name?: string;
    address?: string | null;
    phoneNumber?: string | null;
    description?: string | null;
    imageUrl?: string | null;
};

export default function EditRestaurantScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const restaurantId = params.id;
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [initialData, setInitialData] = useState<InitialRestaurantDataType>({});

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRestaurantDetails = useCallback(async (id: string) => {
        setLoadingData(true);
        setError(null);
        try {
            const restaurant = await RestaurantApi.getById(id);
            if (restaurant) {
                setName(restaurant.name || '');
                setAddress(restaurant.address || '');
                setPhoneNumber(restaurant.phoneNumber || '');
                setDescription(restaurant.description || '');
                setImageUrl(restaurant.imageUrl || '');
                setInitialData({
                    name: restaurant.name,
                    address: restaurant.address,
                    phoneNumber: restaurant.phoneNumber,
                    description: restaurant.description,
                    imageUrl: restaurant.imageUrl,
                });
            } else {
                throw new Error("Nie znaleziono restauracji.");
            }
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać danych restauracji.");
            Alert.alert("Błąd", err.message || "Nie udało się pobrać danych restauracji.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (restaurantId) {
            fetchRestaurantDetails(restaurantId);
        } else {
            Alert.alert("Błąd", "Brak ID restauracji do edycji.");
            setError("Brak ID restauracji.");
            setLoadingData(false);
        }
    }, [restaurantId, fetchRestaurantDetails]);

    const handleUpdateRestaurant = async () => {
        if (!name.trim()) {
            Alert.alert("Walidacja", "Nazwa restauracji nie może być pusta.");
            return;
        }
        if (!restaurantId) {
            Alert.alert("Błąd", "Brak ID restauracji do zaktualizowania.");
            return;
        }

        const currentFormData = {
            name: name.trim(),
            address: address.trim(),
            phoneNumber: phoneNumber.trim(),
            description: description.trim(),
            imageUrl: imageUrl.trim(),
        };

        let changed = false;
        if (currentFormData.name !== (initialData.name || '')) changed = true;
        if (currentFormData.address !== (initialData.address || '')) changed = true;
        if (currentFormData.phoneNumber !== (initialData.phoneNumber || '')) changed = true;
        if (currentFormData.description !== (initialData.description || '')) changed = true;
        if (currentFormData.imageUrl !== (initialData.imageUrl || '')) changed = true;


        if (!changed) {
            Alert.alert("Informacja", "Nie wprowadzono żadnych zmian.");
            return;
        }

        setLoading(true);
        setError(null);
        const payload: RestaurantPayload = {
            name: currentFormData.name,
            address: currentFormData.address || undefined,
            phoneNumber: currentFormData.phoneNumber || undefined,
            description: currentFormData.description || undefined,
            imageUrl: currentFormData.imageUrl || undefined,
        };

        try {
            await RestaurantApi.update(restaurantId, payload);
            Alert.alert("Sukces", `Restauracja "${currentFormData.name}" została zaktualizowana!`);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace({ pathname: '/(admin)/restaurants/index' } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Nie udało się zaktualizować restauracji.";
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
                <Text>Ładowanie danych restauracji...</Text>
            </View>
        );
    }

    if (error && !initialData.name) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => restaurantId && fetchRestaurantDetails(restaurantId)} style={styles.button}>
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
                    <Text style={styles.title}>Edytuj Restaurację</Text>

                    <Text style={styles.label}>Nazwa Restauracji *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Wpisz nazwę restauracji" placeholderTextColor={COLORS.textLight} autoCapitalize="words"/>
                    <Text style={styles.label}>Adres:</Text>
                    <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Np. ul. Słoneczna 5, 00-001 Warszawa" placeholderTextColor={COLORS.textLight}/>
                    <Text style={styles.label}>Numer Telefonu:</Text>
                    <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Np. 123-456-789" placeholderTextColor={COLORS.textLight} keyboardType="phone-pad"/>
                    <Text style={styles.label}>Opis:</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Krótki opis restauracji, typ kuchni itp." placeholderTextColor={COLORS.textLight} multiline numberOfLines={3}/>
                    <Text style={styles.label}>URL Obrazka:</Text>
                    <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="Np. http://example.com/image.png" placeholderTextColor={COLORS.textLight} keyboardType="url"/>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.button, (loading || !name.trim()) && styles.buttonDisabled]}
                        onPress={handleUpdateRestaurant}
                        disabled={loading || !name.trim()}
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
    keyboardAvoidingContainer: { flex: 1, },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', },
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background, },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background, },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 25, },
    label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500', },
    input: { backgroundColor: COLORS.cardBackground, color: COLORS.textPrimary, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 16, marginBottom: 18, borderWidth: 1, borderColor: COLORS.border, },
    textArea: { minHeight: 80, textAlignVertical: 'top', },
    button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50, marginTop: 10, },
    buttonSecondary: { backgroundColor: COLORS.textLight, marginTop: 10, },
    buttonDisabled: { backgroundColor: COLORS.textLight, },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', },
    errorText: { color: COLORS.danger, marginBottom: 15, textAlign: 'center', fontSize: 14, },
});
