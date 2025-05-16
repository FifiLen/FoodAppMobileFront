// app/(auth)/register.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../components/home-page/constants";

const API_URL = "http://192.168.0.13:8081"; // UPEWNIJ SIĘ, ŻE TO POPRAWNY ADRES TWOJEGO BACKENDU

interface ApiError {
    code?: string;
    description: string;
}

// Uproszczony interfejs dla odpowiedzi błędu
interface ErrorResponse {
    message?: string;
    title?: string;
    errors?: ApiError[]; // Dla ASP.NET Identity errors
    $values?: ApiError[]; // Dla struktury z Twojego zrzutu
    // Możesz dodać inne typowe pola błędów, jeśli znasz strukturę
}

export default function RegistrationScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError("Wszystkie pola są wymagane.");
            Alert.alert("Błąd", "Wszystkie pola są wymagane.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Hasła nie są takie same.");
            Alert.alert("Błąd", "Hasła nie są takie same.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/Auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                let errorMessage = `Błąd serwera (status: ${response.status})`;
                // Spróbuj odczytać odpowiedź jako JSON, jeśli jest dostępna
                if (response.headers.get("content-type")?.includes("application/json")) {
                    try {
                        const errorData: ErrorResponse = await response.json();
                        console.log("Odpowiedź błędu API (JSON):", errorData);
                        if (errorData.errors && errorData.errors.length > 0) {
                            errorMessage = errorData.errors.map(e => e.description).join("\n");
                        } else if (errorData.$values && errorData.$values.length > 0) {
                            errorMessage = errorData.$values.map(e => e.description).join("\n");
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (errorData.title) {
                            errorMessage = errorData.title;
                        }
                    } catch (jsonParseError) {
                        console.error("Nie udało się sparsować odpowiedzi błędu jako JSON:", jsonParseError);
                        // Jeśli parsowanie JSON zawiedzie, spróbuj odczytać jako tekst
                        const errorText = await response.text();
                        console.log("Odpowiedź błędu API (Tekst):", errorText);
                        if (errorText) errorMessage = errorText.substring(0, 200); // Pokaż fragment
                    }
                } else {
                    // Jeśli odpowiedź nie jest JSON, spróbuj odczytać jako tekst
                    const errorText = await response.text();
                    console.log("Odpowiedź błędu API (Tekst):", errorText);
                    if (errorText) errorMessage = errorText.substring(0, 200);
                }
                throw new Error(errorMessage);
            }

            // Rejestracja pomyślna (zakładamy status 2xx i brak potrzeby parsowania ciała odpowiedzi)
            console.log("RegistrationScreen: Rejestracja pomyślna, status:", response.status);
            Alert.alert(
                "Rejestracja zakończona",
                "Twoje konto zostało utworzone. Możesz się teraz zalogować.",
                [{ text: "OK", onPress: () => router.push("/(auth)/login") }],
            );
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

        } catch (err: any) {
            console.error("RegistrationScreen: Błąd w bloku catch", err);
            const displayError = err.message || "Wystąpił nieoczekiwany błąd.";
            setError(displayError);
            Alert.alert("Błąd rejestracji", displayError);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToLogin = () => {
        router.push("/(auth)/login");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        <Text style={styles.title}>Stwórz konto</Text>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="Imię / Nazwa użytkownika"
                            placeholderTextColor={COLORS.textLight}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Adres e-mail"
                            placeholderTextColor={COLORS.textLight}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Hasło"
                            placeholderTextColor={COLORS.textLight}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Potwierdź hasło"
                            placeholderTextColor={COLORS.textLight}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>Zarejestruj się</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.loginPrompt}
                            onPress={navigateToLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginText}>
                                Masz już konto?{" "}
                                <Text style={styles.loginLink}>Zaloguj się</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    keyboardAvoidingView: { flex: 1 },
    scrollViewContent: { flexGrow: 1, justifyContent: "center" },
    container: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: COLORS.textPrimary,
        marginBottom: 20,
        textAlign: "center",
    },
    errorText: {
        color: COLORS.danger,
        marginBottom: 15,
        textAlign: "center",
        fontSize: 14,
        paddingHorizontal: 10,
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: COLORS.cardBackground,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.textPrimary,
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginTop: 10,
    },
    buttonDisabled: { backgroundColor: COLORS.textLight },
    buttonText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
    loginPrompt: { marginTop: 25 },
    loginText: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center" },
    loginLink: { color: COLORS.primary, fontWeight: "bold" },
});
