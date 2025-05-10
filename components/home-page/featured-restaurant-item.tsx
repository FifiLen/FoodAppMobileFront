// frontend/components/home-page/featured-restaurant-item.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Heart, Star, Clock } from 'lucide-react-native';
import { COLORS } from './constants'; // Upewnij się, że ta ścieżka jest poprawna
import { ImageSourcePropType } from 'react-native'; // <<< DODAJ TEN IMPORT

const { width } = Dimensions.get("window");

// Zaktualizowany interfejs FeaturedRestaurant
// (lub zaimportuj z centralnego miejsca, jeśli taki masz)
interface FeaturedRestaurant {
    id: string;
    name: string;
    image: ImageSourcePropType; // <<< ZMIANA TUTAJ
    rating: number;
    time: string;
    tags: string[];
    promo: string | null;
}

interface FeaturedRestaurantItemProps {
    item: FeaturedRestaurant;
}

export function FeaturedRestaurantItem({ item }: FeaturedRestaurantItemProps) {
    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={item.image} // Teraz item.image jest typu ImageSourcePropType
                    style={styles.image}
                    resizeMode="cover"
                />
                {item.promo && (
                    <View style={styles.promoBadge}>
                        <Text style={styles.promoText}>{item.promo}</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.favoriteButton}>
                    <Heart size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                </Text>
                <View style={styles.tagsContainer}>
                    {item.tags.map((tag, index) => (
                        <Text key={`${tag}-${index}`} style={styles.tagText}>
                            {tag}
                            {index < item.tags.length - 1 ? " • " : ""}
                        </Text>
                    ))}
                </View>
                <View style={styles.detailsRow}>
                    <View style={styles.ratingContainer}>
                        <Star size={16} color="#FFB800" fill="#FFB800" />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Clock size={14} color={COLORS.textSecondary} />
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// Przeniosłem style do StyleSheet.create
const styles = StyleSheet.create({
    container: {
        width: width * 0.7,
        marginRight: 16,
        borderRadius: 24,
        backgroundColor: COLORS.cardBackground,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        overflow: "hidden", // Ważne, aby zaokrąglone rogi obrazka były widoczne
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 160,
    },
    promoBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: COLORS.secondary, // Użyj swoich stałych
    },
    promoText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333", // Dostosuj kolor tekstu promo
    },
    favoriteButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    infoContainer: {
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold", // Zmieniono na 'bold' dla spójności
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 12,
    },
    tagText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginRight: 8, // Odstęp między tagami
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        marginLeft: 4,
        fontWeight: "500",
        color: COLORS.textPrimary,
        fontSize: 14, // Dodałem rozmiar czcionki
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        marginLeft: 4,
        fontSize: 12,
        color: COLORS.textSecondary,
    },
});
