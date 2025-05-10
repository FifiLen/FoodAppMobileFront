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
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { Trash2, MessageSquare, Star, UserCircle, ShoppingBag as ProductIcon, Store } from 'lucide-react-native';
import { ApiReview, ReviewApi } from '@/src/api/Api';
import { COLORS } from '@/components/home-page/constants';

interface ReviewForList {
    id: string;
    rating: number;
    comment: string | null;
    reviewDate: string;
    userId: number;
    targetInfo: string;
}

export default function ManageReviewsListScreen() {
    const router = useRouter();
    const [reviews, setReviews] = useState<ReviewForList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('pl-PL', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiReviews = await ReviewApi.list();
            const mappedReviews: ReviewForList[] = apiReviews.map(r => {
                let targetInfo = `ID Użytkownika: ${r.userId}`;
                if (r.productId !== null) {
                    targetInfo += `, Produkt ID: ${r.productId}`;
                } else if (r.restaurantId !== null) {
                    targetInfo += `, Restauracja ID: ${r.restaurantId}`;
                }
                return {
                    id: r.id.toString(),
                    rating: r.rating,
                    comment: r.comment,
                    reviewDate: formatDate(r.reviewDate),
                    userId: r.userId,
                    targetInfo: targetInfo,
                };
            });
            setReviews(mappedReviews);
        } catch (err: any) {
            setError(err.message || "Nie udało się pobrać recenzji.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchReviews();
        }, [fetchReviews])
    );

    const handleDeleteReview = (reviewId: string, reviewComment: string | null) => {
        console.log(`[UI] Naciśnięto przycisk usuwania dla recenzji ID: ${reviewId}`);

        const commentSummary = reviewComment ?
            `"${reviewComment.substring(0, 30)}${reviewComment.length > 30 ? '...' : ''}"` :
            `o ID: ${reviewId}`;

        Alert.alert(
            "Potwierdź usunięcie",
            `Czy na pewno chcesz usunąć recenzję ${commentSummary}?`,
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        console.log(`[UI] Potwierdzono usunięcie recenzji ID: ${reviewId}`);
                        try {
                            if (!reviewId) {
                                console.error('[UI] ID recenzji jest puste lub nieprawidłowe:', reviewId);
                                Alert.alert("Błąd", "Nieprawidłowy identyfikator recenzji.");
                                return;
                            }

                            await ReviewApi.delete(reviewId);
                            console.log(`[UI] Wywołanie API usuwania zakończone powodzeniem dla ID: ${reviewId}`);
                            Alert.alert("Sukces", "Recenzja została usunięta.");
                            await fetchReviews();
                        } catch (delErr: any) {
                            console.error(`[UI] Błąd podczas usuwania recenzji ${reviewId}:`,
                                delErr.message, delErr.stack);
                            Alert.alert("Błąd", `Nie udało się usunąć recenzji: ${delErr.message}`);
                        }
                    },
                },
            ]
        );
    };

    const renderStars = (rating: number) => {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    color={i <= rating ? COLORS.primary : COLORS.border} // Użyj swoich kolorów
                    fill={i <= rating ? COLORS.primary : 'transparent'}
                />
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Ładowanie recenzji...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
                <TouchableOpacity onPress={fetchReviews} style={styles.button}>
                    <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <View style={styles.itemIconContainer}>
                                <MessageSquare size={28} color={COLORS.accent} />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <View style={styles.reviewHeader}>
                                    {renderStars(item.rating)}
                                    <Text style={styles.dateText}>{item.reviewDate}</Text>
                                </View>
                                <Text style={styles.commentText} numberOfLines={4}>{item.comment || "Brak komentarza."}</Text>
                                <Text style={styles.metaText}>{item.targetInfo}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleDeleteReview(item.id, item.comment)}
                                style={styles.actionButton}
                                activeOpacity={0.6}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Trash2 size={22} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyText}>Brak recenzji do wyświetlenia.</Text>
                        </View>
                    }
                    contentContainerStyle={reviews.length === 0 ? styles.emptyListInnerContainer : styles.listContentContainer}
                    ListHeaderComponent={reviews.length > 0 ? <View style={{ height: 10 }} /> : null}
                />
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
        backgroundColor: COLORS.cardBackground, padding: 15, marginVertical: 8, marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
    },
    itemIconContainer: {
        marginRight: 15,
        paddingTop: 2,
    },
    itemTextContainer: {
        flex: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    dateText: {
        fontSize: 11,
        color: COLORS.textLight,
    },
    commentText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 20,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    actionButton: {
        marginLeft: 10,
        padding: 8,
        alignSelf: 'center',
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
        paddingBottom: 20,
    },
});
