// frontend/components/home-page/RestaurantListItem.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  type ImageSourcePropType,
  ActivityIndicator,
  StyleProp,   // Import StyleProp
  ViewStyle,    // Import ViewStyle
} from "react-native";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "./constants";
import { Star, Clock, MapPin as LocationIcon, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const DEFAULT_RESTAURANT_IMAGE = require("../../assets/images/placeholder-restaurant.png"); // Ensure this path is correct

export interface RestaurantListItemProps {
  id: string;
  name: string;
  imageUrl?: string | null; // Allow null
  cuisineType?: string | null; // Allow null
  rating?: number | null; // Allow null
  deliveryTime?: string | null; // Allow null
  distance?: string | null; // Allow null
  isOpen?: boolean | null; // Allow null
  promoLabel?: string | null; // Allow null
  isFavorite?: boolean | null; // Allow null
  priceRange?: string | null;
}

interface RestaurantListItemComponentProps {
  item: RestaurantListItemProps;
  onPress: (restaurantId: string) => void; // Pass restaurantId for clarity
  onToggleFavorite?: (itemId: string, newStatus: boolean) => Promise<void> | void;
  style?: StyleProp<ViewStyle>; // <<< NEW: Optional style prop for the container
}

export const RestaurantListItem = ({
  item,
  onPress,
  onToggleFavorite,
  style, // <<< NEW: Destructure style prop
}: RestaurantListItemComponentProps) => {
  const imageSource: ImageSourcePropType =
    item.imageUrl && item.imageUrl.startsWith("http")
      ? { uri: item.imageUrl }
      : DEFAULT_RESTAURANT_IMAGE;

  const [isFavoriteLocal, setIsFavoriteLocal] = useState(
    item.isFavorite || false,
  );
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  useEffect(() => {
    setIsFavoriteLocal(item.isFavorite || false);
  }, [item.isFavorite]);

  const handleFavoritePress = async () => {
    if (isLoadingFavorite || !onToggleFavorite) {
        if (!onToggleFavorite) {
            console.warn("RestaurantListItem: onToggleFavorite handler not provided.");
        }
        return;
    }
    setIsLoadingFavorite(true);
    const newStatus = !isFavoriteLocal;
    // Optimistically update UI, then call prop
    setIsFavoriteLocal(newStatus);
    try {
      await onToggleFavorite(item.id, newStatus);
    } catch (error) {
      console.error("RestaurantListItem: Failed to toggle favorite via prop", error);
      setIsFavoriteLocal(!newStatus); // Revert on error
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]} // <<< MODIFIED: Apply the style prop
      onPress={() => onPress(item.id)}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.topContainer}>
            <View style={styles.topLeftBadges}>
              {item.isOpen !== undefined && item.isOpen !== null && ( // Check for null as well
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: item.isOpen
                        ? COLORS.success
                        : COLORS.danger,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.isOpen ? "Otwarte" : "Zamknięte"}
                  </Text>
                </View>
              )}
              {item.promoLabel && (
                <View style={styles.promoBadge}>
                  <Text style={styles.promoText}>{item.promoLabel}</Text>
                </View>
              )}
            </View>

            {onToggleFavorite && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={handleFavoritePress}
                disabled={isLoadingFavorite}
              >
                {isLoadingFavorite ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Heart
                    size={24}
                    color={isFavoriteLocal ? COLORS.primary : COLORS.white}
                    fill={isFavoriteLocal ? COLORS.primary : "none"}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

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
              {typeof item.rating === "number" && item.rating > 0 && (
                <View style={styles.ratingContainer}>
                  <Star
                    size={14}
                    color={COLORS.secondary}
                    fill={COLORS.secondary}
                  />
                  <Text style={styles.ratingText}>
                    {item.rating.toFixed(1)}
                  </Text>
                </View>
              )}
              {item.deliveryTime && (
                <View style={styles.detailBadge}>
                  <Clock size={12} color={COLORS.white} />
                  <Text style={styles.detailText}>{item.deliveryTime}</Text>
                </View>
              )}
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
  );
};

const styles = StyleSheet.create({
  container: { // Default style
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: SPACING.sm, // Default vertical margin
    marginHorizontal: SPACING.md, // Default horizontal margin
    overflow: "hidden",
    backgroundColor: COLORS.cardBackground, // Added for shadow to work on Android if image fails
    ...SHADOWS.medium,
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  imageStyle: {
    // borderRadius: BORDER_RADIUS.lg, // Already applied by container's overflow:hidden
  },
  gradient: {
    flex: 1, // Ensure gradient fills the ImageBackground
    justifyContent: "space-between",
    padding: SPACING.md,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  topLeftBadges: {
    flexDirection: "row",
    flexWrap: 'wrap', // Allow badges to wrap if too many
    gap: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2 + 1,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs -1, // Slightly smaller
    fontWeight: "600",
  },
  promoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2 + 1,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
  },
  promoText: {
    color: COLORS.textOnPrimary || COLORS.white, // Use textOnPrimary if defined
    fontSize: FONT_SIZE.xs -1, // Slightly smaller
    fontWeight: "600",
  },
  favoriteButton: {
    padding: SPACING.xs,
    // backgroundColor: 'rgba(0,0,0,0.3)', // Optional: slight background for better visibility
    borderRadius: BORDER_RADIUS.round,
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
    flexWrap: "wrap", // Allow badges to wrap
    alignItems: 'center',
    gap: SPACING.sm, // Use gap for spacing between badges
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 229, 102, 0.9)", // Slightly more opaque
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2 + 1,
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
    backgroundColor: "rgba(0, 0, 0, 0.55)", // Slightly more opaque
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2 + 1,
    borderRadius: BORDER_RADIUS.sm,
  },
  detailText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    fontWeight: "500",
  },
});
