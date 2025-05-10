import { Stack } from 'expo-router';
import React from 'react';

export default function CategoriesAdminLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}> // Przykład: ukrywamy nagłówek z tego layoutu, bo nadrzędny go ma
            <Stack.Screen name="index" />
            <Stack.Screen name="create" />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
