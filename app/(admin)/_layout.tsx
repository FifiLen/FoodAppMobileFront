import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Home } from 'lucide-react-native';
import { COLORS } from '@/components/home-page/constants';

export default function AdminLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={({ navigation }: { navigation: any }) => ({
                headerStyle: {
                    backgroundColor: COLORS.cardBackground,
                },
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Panel Admina',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)' as any)}
                            style={{ marginRight: 15, padding: 5 }}
                        >
                            <Home size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="categories/index"
                options={{ title: 'Zarządzaj Kategoriami' }}
            />
            <Stack.Screen
                name="categories/create"
                options={{ title: 'Dodaj Kategorię', presentation: 'modal' }}
            />
            <Stack.Screen
                name="categories/[id]"
                options={{ title: 'Edytuj Kategorię', presentation: 'modal' }}
            />

            <Stack.Screen
                name="restaurants/index"
                options={{ title: 'Zarządzaj Restauracjami' }}
            />
            <Stack.Screen
                name="restaurants/create"
                options={{ title: 'Dodaj Restaurację', presentation: 'modal' }}
            />
            <Stack.Screen
                name="restaurants/[id]"
                options={{ title: 'Edytuj Restaurację', presentation: 'modal' }}
            />

            <Stack.Screen
                name="products/index"
                options={{ title: 'Zarządzaj Produktami' }}
            />
            <Stack.Screen
                name="products/create"
                options={{ title: 'Dodaj Produkt', presentation: 'modal' }}
            />
            <Stack.Screen
                name="products/[id]"
                options={{ title: 'Edytuj Produkt', presentation: 'modal' }}
            />

            <Stack.Screen
                name="reviews/index"
                options={{ title: 'Zarządzaj Recenzjami' }}
            />

            <Stack.Screen
                name="users/index"
                options={{ title: 'Zarządzaj Użytkownikami' }}
            />
            <Stack.Screen
                name="users/create"
                options={{ title: 'Dodaj Użytkownika', presentation: 'modal' }}
            />
            <Stack.Screen
                name="users/[id]"
                options={{ title: 'Edytuj Użytkownika', presentation: 'modal' }}
            />

            <Stack.Screen
                name="favorites/index"
                options={{ title: 'Zarządzaj Ulubionymi' }}
            />
            <Stack.Screen
                name="favorites/create"
                options={{ title: 'Dodaj Ulubione', presentation: 'modal' }}
            />
            <Stack.Screen
                name="favorites/[id]"
                options={{ title: 'Szczegóły Ulubionego', presentation: 'modal' }}
            />
        </Stack>
    );
}
