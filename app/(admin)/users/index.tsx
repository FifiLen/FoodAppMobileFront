"use client";

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { PlusCircle, Edit, Trash2, Users as UsersIcon } from 'lucide-react-native';
import { ApiUser, UserApi } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

interface UserForList {
    id: string;
    name: string;
    email: string;
    role?: string; // Opcjonalnie, jeśli API zwraca i chcesz wyświetlić
    isActive?: boolean; // Opcjonalnie
}

export default function ManageUsersListScreen() {
    const router = useRouter();
    const [users, setUsers] = useState<UserForList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUsers = await UserApi.list();
            const mappedUsers: UserForList[] = apiUsers.map(u => ({
                id: u.id.toString(),
                name: u.name,
                email: u.email,
                role: u.role || undefined,
                isActive: u.isActive,
            }));
            setUsers(mappedUsers);
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać użytkowników.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [fetchUsers])
    );

    const handleAddUser = () => {
        router.push('/(admin)/users/create');
    };

    const handleEditUser = (userId: string) => {
        router.push({
            pathname: '/(admin)/users/[id]',
            params: { id: userId },
        });
    };

    const handleDeleteUser = (userId: string, userName: string) => {
        Alert.alert(
            "Potwierdź usunięcie",
            `Czy na pewno chcesz usunąć użytkownika "${userName}"? Tej operacji nie można cofnąć.`,
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await UserApi.delete(userId);
                            Alert.alert("Sukces", `Użytkownik "${userName}" został usunięty.`);
                            fetchUsers();
                        } catch (delErr: any) {
                            Alert.alert("Błąd", `Nie udało się usunąć użytkownika: ${delErr.message}`);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Ładowanie użytkowników...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
                <TouchableOpacity onPress={fetchUsers} style={styles.button}>
                    <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <UsersIcon size={24} color={COLORS.accent} style={styles.itemIcon}/>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.listItemTextName}>{item.name}</Text>
                                <Text style={styles.listItemTextEmail}>{item.email}</Text>
                                {item.role && <Text style={styles.listItemSubtitle}>Rola: {item.role}</Text>}
                                {typeof item.isActive === 'boolean' && (
                                    <Text style={[styles.listItemSubtitle, { color: item.isActive ? COLORS.primary : COLORS.danger }]}>
                                        Status: {item.isActive ? 'Aktywny' : 'Nieaktywny'}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => handleEditUser(item.id)} style={styles.actionButton}>
                                    <Edit size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteUser(item.id, item.name)} style={styles.actionButton}>
                                    <Trash2 size={20} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyText}>Brak użytkowników. Kliknij + aby dodać.</Text>
                        </View>
                    }
                    contentContainerStyle={users.length === 0 ? styles.emptyListInnerContainer : styles.listContentContainer}
                    ListHeaderComponent={users.length > 0 ? <View style={{ height: 10 }} /> : null}
                />
                <TouchableOpacity style={styles.fab} onPress={handleAddUser}>
                    <PlusCircle size={32} color={COLORS.white} />
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
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
    centered: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 10, color: COLORS.textSecondary,
    },
    errorText: {
        color: COLORS.danger, marginBottom: 10, textAlign: 'center', fontSize: 16,
    },
    button: {
        backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10,
    },
    buttonText: {
        color: COLORS.white, fontWeight: 'bold',
    },
    listItem: {
        backgroundColor: COLORS.cardBackground, paddingVertical: 15, paddingHorizontal: 20, marginVertical: 6, marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
    },
    itemIcon: {
        marginRight: 15,
    },
    itemTextContainer: {
        flex: 1,
    },
    listItemTextName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    listItemTextEmail: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    listItemSubtitle: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 3,
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 15, padding: 8,
    },
    emptyText: {
        fontSize: 16, color: COLORS.textSecondary,
    },
    emptyListContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
    },
    emptyListInnerContainer: {
        flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    },
    listContentContainer: {
        paddingBottom: 80,
    },
    fab: {
        position: 'absolute', right: 25, bottom: 25, backgroundColor: COLORS.accent, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, zIndex: 10,
    },
});
