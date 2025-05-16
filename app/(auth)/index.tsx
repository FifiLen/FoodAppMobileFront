// app/(auth)/index.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router"; // Import useRouter
import { SafeAreaView } from "react-native-safe-area-context";
import {COLORS} from "@/components/home-page/constants";

export default function AuthIndexScreen() {
    const router = useRouter(); // Użyj hooka useRouter

    const navigateToLogin = () => {
        router.push("/(auth)/login");
    };

    const navigateToRegister = () => {
        router.push("/(auth)/register");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* <Image source={require('../../assets/logo.png')} style={styles.logo} /> */}
                <Text style={styles.title}>Witaj w FoodApp!</Text>
                <Text style={styles.subtitle}>
                    Zaloguj się lub stwórz konto, aby kontynuować.
                </Text>

                <TouchableOpacity
                    style={[styles.button, styles.loginButton]}
                    onPress={navigateToLogin} // Użyj funkcji nawigującej
                >
                    <Text style={styles.buttonText}>Zaloguj się</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.registerButton]}
                    onPress={navigateToRegister} // Użyj funkcji nawigującej
                >
                    <Text style={styles.buttonText}>Stwórz konto</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        backgroundColor: COLORS.background,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: COLORS.textPrimary,
        textAlign: "center",
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginBottom: 50,
    },
    button: {
        width: "100%",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
    },
    registerButton: {
        backgroundColor: COLORS.accent,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "600",
    },
});
