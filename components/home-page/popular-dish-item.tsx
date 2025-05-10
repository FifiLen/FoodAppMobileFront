// components/home-page/popular-dish-item.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS } from './constants'; // Upewnij się, że ta ścieżka jest poprawna
import { ImageSourcePropType } from 'react-native'; // <<< DODAJ TEN IMPORT

// Zaktualizowany interfejs PopularDish, aby pasował do definicji w index.tsx
// lub, co lepsze, zaimportuj go z centralnego miejsca, jeśli taki stworzysz.
interface PopularDish {
    id: string;
    name: string;
    restaurant: string;
    image: ImageSourcePropType; // <<< ZMIANA TUTAJ
    price: string;
    rating: number;
}

interface PopularDishItemProps {
    item: PopularDish;
}

export function PopularDishItem({ item }: PopularDishItemProps) {
    return (
        <TouchableOpacity style={styles.container}>
            <Image
                source={item.image} // Teraz item.image jest typu ImageSourcePropType
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.restaurantName} numberOfLines={1}>
                    {item.restaurant}
                </Text>
                <View style={styles.detailsRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    <View style={styles.ratingContainer}>
                        <Star size={12} color="#FFB800" fill="#FFB800" />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// Przeniosłem style do obiektu StyleSheet dla lepszej organizacji i wydajności
const styles = StyleSheet.create({
    container: {
        width: 150,
        marginRight: 16,
        borderRadius: 20, // Zwiększyłem trochę, aby pasowało do obrazka
        backgroundColor: COLORS.cardBackground,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        // overflow: "hidden", // Usunięte, bo borderRadius na kontenerze powinien wystarczyć, jeśli obrazek ma też borderRadius
    },
    image: {
        width: "100%",
        height: 120,
        borderTopLeftRadius: 20, // Dopasuj do kontenera
        borderTopRightRadius: 20, // Dopasuj do kontenera
    },
    infoContainer: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    restaurantName: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    price: {
        fontWeight: "bold", // Zmieniono z 600 na 'bold' dla spójności
        color: COLORS.accent, // Użyłem accent, bo tak było, ale często cena jest primary
        fontSize: 14, // Dodałem rozmiar czcionki dla ceny
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        marginLeft: 2,
        fontSize: 12,
        color: COLORS.textSecondary,
    },
});
