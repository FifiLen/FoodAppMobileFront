// app/(auth)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import {COLORS} from "@/components/home-page/constants";

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.background,
                },
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="login"
                options={{
                    title: "Logowanie",
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    title: "Rejestracja",
                }}
            />
        </Stack>
    );
}
