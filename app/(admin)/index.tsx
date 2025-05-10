"use client";

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/components/home-page/constants';
import { ListChecks, Store, Utensils, MessageSquare, Users, Heart, Settings, Home, Box } from 'lucide-react-native';

const adminPanelItems = [
    {
        id: 'categories',
        label: 'Zarządzaj Kategoriami',
        icon: ListChecks,
        path: '/(admin)/categories',
    },
    {
        id: 'restaurants',
        label: 'Zarządzaj Restauracjami',
        icon: Store,
        path: '/(admin)/restaurants',
    },
    {
        id: 'products',
        label: 'Zarządzaj Produktami',
        icon: Utensils,
        path: '/(admin)/products',
    },
    {
        id: 'reviews',
        label: 'Zarządzaj Recenzjami',
        icon: MessageSquare,
        path: '/(admin)/reviews',
    },
    {
        id: 'users',
        label: 'Zarządzaj Użytkownikami',
        icon: Users,
        path: '/(admin)/users',
    },
    {
        id: 'favorites',
        label: 'Zarządzaj Ulubionymi',
        icon: Heart,
        path: '/(admin)/favorites',
    },
    {
        id: 'orders',
        label: 'Zarządzaj Zamówieniami',
        icon: Box,
        path: '/(admin)/orders',
    },
];

export default function AdminDashboardScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.container}>
                    <Text style={styles.title}>Panel Administracyjny</Text>
                    <Text style={styles.subtitle}>Wybierz sekcję do zarządzania:</Text>

                    {adminPanelItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.button}
                            onPress={() => router.push(item.path as any)}
                        >
                            <item.icon color={COLORS.white} size={24} style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[styles.button, styles.backButton]}
                        onPress={() => router.replace('/(tabs)/' as any)}
                    >
                        <Home color={COLORS.textPrimary} size={24} style={styles.buttonIcon} />
                        <Text style={[styles.buttonText, styles.backButtonText]}>Wróć do Aplikacji</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 30 : 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 10,
        marginTop: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 25,
        borderRadius: 12,
        marginBottom: 18,
        width: '95%',
        maxWidth: 400,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonIcon: {
        marginRight: 15,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '600',
    },
    backButton: {
        backgroundColor: COLORS.cardBackground,
        borderColor: COLORS.border,
        borderWidth: 1,
        marginTop: 20,
    },
    backButtonText: {
        color: COLORS.textPrimary,
    }
});
