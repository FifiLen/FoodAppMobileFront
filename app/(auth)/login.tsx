// app/(auth)/login.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert, // Zachowujemy Alert na wypadek potrzeby
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext"; // Upewnij się, że ścieżka jest poprawna
import { COLORS } from "@/components/home-page/constants"; // Upewnij się, że ścieżka jest poprawna
import { API_URL } from "../constants";

// UPEWNIJ SIĘ, ŻE TEN ADRES JEST POPRAWNY I WSKAZUJE NA TWÓJ BACKEND

interface LoginSuccessResponse {
    token: string;
    userId?: string | number; // Dodajemy opcjonalne userId (może być stringiem lub liczbą z API)
    id?: string | number;     // Alternatywna nazwa pola dla ID użytkownika
    user_id?: string | number;// Kolejna alternatywna nazwa
    // Możesz dodać inne pola, które Twoje API może zwracać, np. userName, email
}

interface ApiError {
    code?: string;
    description: string;
}

interface LoginErrorResponse {
    message?: string;
    title?: string;
    errors?: ApiError[] | Record<string, string[]>;
    $values?: ApiError[];
}

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth(); // Pobieramy signIn z AuthContext
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Email i hasło są wymagane.");
            return;
        }

        setIsLoading(true);
        setError(null);
        console.log(`LoginScreen: Próba logowania z URL: ${API_URL}/api/AuthControler/login`);

        try {
            const response = await fetch(`${API_URL}/api/AuthControler/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            console.log(`LoginScreen: Otrzymano odpowiedź. Status: ${response.status}, OK: ${response.ok}`);

            if (!response.ok) {
                let errorMessage = `Błąd logowania (status: ${response.status})`;
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    try {
                        const errorData: LoginErrorResponse = await response.json();
                        console.log("LoginScreen: Odpowiedź błędu API (JSON):", errorData);
                        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.every(e => typeof e.description === 'string')) {
                            errorMessage = (errorData.errors as ApiError[]).map(e => e.description).join("\n");
                        } else if (errorData.$values && Array.isArray(errorData.$values)) {
                            errorMessage = errorData.$values.map(e => e.description).join("\n");
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (errorData.title) {
                            errorMessage = errorData.title;
                        }
                    } catch (jsonParseError) {
                        console.error("LoginScreen: Nie udało się sparsować odpowiedzi błędu jako JSON:", jsonParseError);
                        const errorText = await response.text();
                        console.log("LoginScreen: Odpowiedź błędu API (Tekst po błędzie parsowania JSON):", errorText);
                        if (errorText) errorMessage = errorText.substring(0, 200);
                    }
                } else {
                    const errorText = await response.text();
                    console.log("LoginScreen: Odpowiedź błędu API (Tekst):", errorText);
                    if (errorText) errorMessage = errorText.substring(0, 200);
                }
                throw new Error(errorMessage);
            }

            const successData: LoginSuccessResponse = await response.json();
            console.log("LoginScreen: Odpowiedź sukcesu API (JSON):", successData);

            if (successData && successData.token) {
                const receivedToken = successData.token;
                // Próba odczytania ID użytkownika z różnych możliwych pól
                const receivedUserId = successData.userId?.toString() ||
                    successData.id?.toString() ||
                    successData.user_id?.toString();

                console.log("LoginScreen: Otrzymano token:", receivedToken ? receivedToken.substring(0,10)+"..." : "BRAK TOKENU");
                if (receivedUserId) {
                    console.log("LoginScreen: Otrzymano userId:", receivedUserId);
                } else {
                    console.warn("LoginScreen: Nie otrzymano userId z API logowania lub pole ma inną nazwę.");
                }

                await signIn(receivedToken, receivedUserId); // Przekaż token i opcjonalnie userId
                console.log("LoginScreen: signIn() z AuthContext zostało wywołane.");
                // Nawigacja zostanie obsłużona przez AppNavigationLogic w _layout.tsx
            } else {
                console.error("LoginScreen: Odpowiedź API sukcesu nie zawiera tokenu.", successData);
                throw new Error("Odpowiedź serwera nie zawiera tokenu.");
            }
        } catch (err: any) {
            console.error("LoginScreen: Błąd w głównym bloku catch handleLogin:", err.message);
            setError(err.message || "Wystąpił nieoczekiwany błąd logowania.");
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToRegister = () => {
        if (!isLoading) {
            router.push("/(auth)/register");
        }
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
                        <Text style={styles.title}>Zaloguj się</Text>
                        {error && <Text style={styles.errorText}>{error}</Text>}
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
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>Zaloguj</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.registerPrompt}
                            onPress={navigateToRegister}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerText}>
                                Nie masz konta?{" "}
                                <Text style={styles.registerLink}>Zarejestruj się</Text>
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
    registerPrompt: { marginTop: 25 },
    registerText: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center" },
    registerLink: { color: COLORS.primary, fontWeight: "bold" },
});
