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
    Switch
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserApi, UserUpdatePayload, ApiUser } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

type InitialUserDataType = {
    name?: string;
    email?: string;
    role?: string | null;
    isActive?: boolean;
};

export default function EditUserScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const userId = params.id;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [initialData, setInitialData] = useState<InitialUserDataType>({});

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserDetails = useCallback(async (id: string) => {
        setLoadingData(true);
        setError(null);
        try {
            const user = await UserApi.getById(id);
            if (user) {
                setName(user.name || '');
                setEmail(user.email || '');
                setRole(user.role || '');
                setIsActive(user.isActive === undefined ? true : user.isActive);

                setInitialData({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                });
            } else {
                throw new Error("Nie znaleziono użytkownika.");
            }
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać danych użytkownika.");
            Alert.alert("Błąd", err.message || "Nie udało się pobrać danych użytkownika.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchUserDetails(userId);
        } else {
            Alert.alert("Błąd", "Brak ID użytkownika do edycji.");
            setError("Brak ID użytkownika.");
            setLoadingData(false);
        }
    }, [userId, fetchUserDetails]);

    const handleUpdateUser = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert("Walidacja", "Nazwa i email są wymagane.");
            return;
        }
        if (!email.includes('@')) {
            Alert.alert("Walidacja", "Wprowadź poprawny adres email.");
            return;
        }
        if (!userId) {
            Alert.alert("Błąd", "Brak ID użytkownika do zaktualizowania.");
            return;
        }

        const currentData = {
            name: name.trim(),
            email: email.trim(),
            role: role.trim() || null, // Wyślij null jeśli puste, backend może to zinterpretować
            isActive: isActive,
        };

        let changed = false;
        if (currentData.name !== (initialData.name || '')) changed = true;
        if (currentData.email !== (initialData.email || '')) changed = true;
        if (currentData.role !== (initialData.role || null)) changed = true;
        if (currentData.isActive !== initialData.isActive) changed = true;

        if (!changed) {
            Alert.alert("Informacja", "Nie wprowadzono żadnych zmian.");
            return;
        }

        setLoading(true);
        setError(null);
        const payload: UserUpdatePayload = {
            name: currentData.name,
            email: currentData.email,
            role: currentData.role || undefined, // undefined jeśli null, aby API mogło zignorować
            isActive: currentData.isActive,
        };

        try {
            await UserApi.update(userId, payload);
            Alert.alert("Sukces", `Dane użytkownika "${currentData.name}" zostały zaktualizowane!`);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace({ pathname: '/(admin)/users/index' } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Nie udało się zaktualizować użytkownika.";
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
                <Text>Ładowanie danych użytkownika...</Text>
            </View>
        );
    }

    if (error && !initialData.name) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => userId && fetchUserDetails(userId)} style={styles.button}>
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
                    <Text style={styles.title}>Edytuj Użytkownika</Text>

                    <Text style={styles.label}>Nazwa Użytkownika *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Imię i nazwisko" placeholderTextColor={COLORS.textLight} autoCapitalize="words"/>

                    <Text style={styles.label}>Adres Email *</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor={COLORS.textLight} keyboardType="email-address" autoCapitalize="none"/>

                    <Text style={styles.label}>Rola (np. Admin, Client):</Text>
                    <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder="Wpisz rolę" placeholderTextColor={COLORS.textLight} autoCapitalize="words"/>

                    <View style={styles.switchContainer}>
                        <Text style={styles.label}>Aktywny:</Text>
                        <Switch
                            trackColor={{ false: COLORS.textLight, true: COLORS.primary }}
                            thumbColor={isActive ? COLORS.accent : COLORS.cardBackground}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setIsActive}
                            value={isActive}
                        />
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleUpdateUser}
                        disabled={loading || !name.trim() || !email.trim()}
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
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingVertical: 10, },
    button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50, marginTop: 10, },
    buttonSecondary: { backgroundColor: COLORS.textLight, marginTop: 10, },
    buttonDisabled: { backgroundColor: COLORS.textLight, },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', },
    errorText: { color: COLORS.danger, marginBottom: 15, textAlign: 'center', fontSize: 14, },
});
