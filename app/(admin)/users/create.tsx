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
    Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserApi, UserCreatePayload } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

export default function CreateUserScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(''); // Np. "Admin", "Client" - dostosuj
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSaveUser = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Walidacja", "Nazwa, email i hasło są wymagane.");
            return;
        }
        // Dodaj walidację formatu emaila, jeśli chcesz
        if (!email.includes('@')) {
            Alert.alert("Walidacja", "Wprowadź poprawny adres email.");
            return;
        }

        setLoading(true);
        setError(null);

        const payload: UserCreatePayload = {
            name: name.trim(),
            email: email.trim(),
            password: password, // Hasło nie powinno być trimowane
            role: role.trim() || undefined, // Wyślij undefined, jeśli puste
            isActive: isActive,
        };

        try {
            const newUser = await UserApi.create(payload);
            Alert.alert("Sukces", `Użytkownik "${newUser.name}" został dodany!`);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace({ pathname: '/(admin)/users/index' } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Nie udało się dodać użytkownika. Spróbuj ponownie.";
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
                    <Text style={styles.title}>Dodaj Nowego Użytkownika</Text>

                    <Text style={styles.label}>Nazwa Użytkownika *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Wpisz imię i nazwisko" placeholderTextColor={COLORS.textLight} autoCapitalize="words"/>

                    <Text style={styles.label}>Adres Email *</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="user@example.com" placeholderTextColor={COLORS.textLight} keyboardType="email-address" autoCapitalize="none"/>

                    <Text style={styles.label}>Hasło *</Text>
                    <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Wpisz hasło" placeholderTextColor={COLORS.textLight} secureTextEntry/>

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
                        onPress={handleSaveUser}
                        disabled={loading}
                    >
                        {loading ? (<ActivityIndicator color={COLORS.white} />) : (<Text style={styles.buttonText}>Dodaj Użytkownika</Text>)}
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
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 25, },
    label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500', },
    input: { backgroundColor: COLORS.cardBackground, color: COLORS.textPrimary, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 16, marginBottom: 18, borderWidth: 1, borderColor: COLORS.border, },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingVertical: 10, },
    button: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50, marginTop: 10, },
    buttonDisabled: { backgroundColor: COLORS.textLight, },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', },
    errorText: { color: COLORS.danger, marginBottom: 15, textAlign: 'center', fontSize: 14, },
});
