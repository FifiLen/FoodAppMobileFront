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
import { RestaurantApi, RestaurantPayload } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

export default function CreateRestaurantScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSaveRestaurant = async () => {
        if (!name.trim()) {
            Alert.alert("Walidacja", "Nazwa restauracji nie może być pusta.");
            return;
        }

        setLoading(true);
        setError(null);

        const payload: RestaurantPayload = {
            name: name.trim(),
            address: address.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined,
            description: description.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
        };

        try {
            const newRestaurant = await RestaurantApi.create(payload);
            Alert.alert("Sukces", `Restauracja "${newRestaurant.name}" została dodana!`);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace({ pathname: '/(admin)/restaurants/index' } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Nie udało się dodać restauracji. Spróbuj ponownie.";
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
                    <Text style={styles.title}>Dodaj Nową Restaurację</Text>

                    <Text style={styles.label}>Nazwa Restauracji *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Wpisz nazwę restauracji"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Adres:</Text>
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Np. ul. Słoneczna 5, 00-001 Warszawa"
                        placeholderTextColor={COLORS.textLight}
                    />

                    <Text style={styles.label}>Numer Telefonu:</Text>
                    <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Np. 123-456-789"
                        placeholderTextColor={COLORS.textLight}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Opis:</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Krótki opis restauracji, typ kuchni itp."
                        placeholderTextColor={COLORS.textLight}
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>URL Obrazka:</Text>
                    <TextInput
                        style={styles.input}
                        value={imageUrl}
                        onChangeText={setImageUrl}
                        placeholder="Np. http://example.com/image.png"
                        placeholderTextColor={COLORS.textLight}
                        keyboardType="url"
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSaveRestaurant}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>Dodaj Restaurację</Text>
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        backgroundColor: COLORS.cardBackground,
        color: COLORS.textPrimary,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
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
