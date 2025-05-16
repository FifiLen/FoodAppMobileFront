"use client"

import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, type ImageSourcePropType } from "react-native"
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "./constants"
import { Star, Clock, MapPin as LocationIcon } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

// Interfejs propsów dla tego komponentu
export interface RestaurantListItemProps {
    id: string
    name: string
    imageUrl?: string
    cuisineType?: string
    rating?: number
    deliveryTime?: string
    minOrder?: string
    distance?: string
    isOpen?: boolean
    promoLabel?: string
}

// Domyślny obrazek, jeśli restauracja nie ma swojego
const DEFAULT_RESTAURANT_IMAGE = require("../../assets/images/placeholder-restaurant.png")

export const RestaurantListItem = ({
                                       item,
                                       onPress,
                                   }: {
    item: RestaurantListItemProps
    onPress: () => void
}) => {
    const imageSource: ImageSourcePropType =
        item.imageUrl && item.imageUrl.startsWith("http") ? { uri: item.imageUrl } : DEFAULT_RESTAURANT_IMAGE

    // Losowe dane dla demonstracji (w prawdziwej aplikacji byłyby to rzeczywiste dane)
    const deliveryTime =
        item.deliveryTime || `${15 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 15)} min`
    const isOpen = item.isOpen !== undefined ? item.isOpen : Math.random() > 0.2
    const hasPromo = Math.random() > 0.7
    const promoLabel = item.promoLabel || (hasPromo ? "Darmowa dostawa" : undefined)

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
            <ImageBackground source={imageSource} style={styles.imageBackground} imageStyle={styles.imageStyle}>
                {/* Gradient overlay dla lepszej czytelności tekstu */}
                <LinearGradient
                    colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    {/* Status i promocje */}
                   /

                    {/* Główna zawartość */}
                    <View style={styles.contentContainer}>
                        <View style={styles.mainInfo}>
                            <Text style={styles.name} numberOfLines={2}>
                                {item.name}
                            </Text>
                            {item.cuisineType && (
                                <Text style={styles.cuisine} numberOfLines={1}>
                                    {item.cuisineType}
                                </Text>
                            )}
                        </View>

                        <View style={styles.detailsContainer}>
                            {/* Ocena */}
                            {typeof item.rating === "number" && item.rating > 0 && (
                                <View style={styles.ratingContainer}>
                                    <Star size={14} color={COLORS.secondary} fill={COLORS.secondary} />
                                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                                </View>
                            )}

                            {/* Czas dostawy */}
                            <View style={styles.detailBadge}>
                                <Clock size={12} color={COLORS.white} />
                                <Text style={styles.detailText}>{deliveryTime}</Text>
                            </View>

                            {/* Odległość (jeśli dostępna) */}
                            {item.distance && (
                                <View style={styles.detailBadge}>
                                    <LocationIcon size={12} color={COLORS.white} />
                                    <Text style={styles.detailText}>{item.distance}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 180, // Większy kafelek
        borderRadius: BORDER_RADIUS.lg,
        marginVertical: SPACING.sm,
        marginHorizontal: SPACING.md,
        overflow: "hidden",
        ...SHADOWS.medium,
    },
    imageBackground: {
        width: "100%",
        height: "100%",
    },
    imageStyle: {
        borderRadius: BORDER_RADIUS.lg,
    },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: "space-between",
        padding: SPACING.md,
    },
    topContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statusBadge: {
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        fontWeight: "600",
    },
    promoBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    promoText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        fontWeight: "600",
    },
    contentContainer: {
        justifyContent: "flex-end",
    },
    mainInfo: {
        marginBottom: SPACING.sm,
    },
    name: {
        fontSize: FONT_SIZE.xl,
        fontWeight: "800",
        color: COLORS.white,
        marginBottom: SPACING.xs / 2,
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    cuisine: {
        fontSize: FONT_SIZE.sm,
        color: "rgba(255, 255, 255, 0.9)",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    detailsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SPACING.xs,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 229, 102, 0.85)",
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    ratingText: {
        marginLeft: SPACING.xs,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textPrimary,
        fontWeight: "700",
    },
    detailBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    detailText: {
        marginLeft: SPACING.xs,
        fontSize: FONT_SIZE.xs,
        color: COLORS.white,
        fontWeight: "500",
    },
})
