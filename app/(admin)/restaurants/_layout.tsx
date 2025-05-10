import { Stack } from 'expo-router';
import React from 'react';

export default function RestaurantsAdminLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
            />
            <Stack.Screen
                name="create"
            />
            <Stack.Screen
                name="[id]"
            />
        </Stack>
    );
}
