// frontend/components/home-page/RestaurantListItem.tsx
"use client";

import React, { useState, useEffect } from "react";
// ... other imports (StyleSheet, ImageBackground, etc.)
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  type ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "./constants";
import { Star, Clock, MapPin as LocationIcon, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const DEFAULT_RESTAURANT_IMAGE = require("../../assets/images/placeholder-restaurant.png");

// Interface for the DATA of a single restaurant item
// This is what the parent component (e.g., FeaturedRestaurantsSection) will map its API data to.
export interface RestaurantListItemProps { // <<< THIS IS THE KEY EXPORTED TYPE FOR THE ITEM DATA
  id: string;
  name: string;
  imageUrl?: string;
  cuisineType?: string;
  rating?: number;
  deliveryTime?: string;
  distance?: string;
  isOpen?: boolean;
  promoLabel?: string;
  isFavorite?: boolean;
}

// Interface for the PROPS of the RestaurantListItem COMPONENT
interface RestaurantListItemComponentProps {
  item: RestaurantListItemProps; // <<< Uses the exported type above
  onPress: () => void;
  onToggleFavorite?: (itemId: string, newStatus: boolean) => Promise<void> | void;
}

export const RestaurantListItem = ({
  item,
  onPress,
  onToggleFavorite,
}: RestaurantListItemComponentProps) => { // <<< Uses the component's props type
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
    setIsFavoriteLocal(newStatus);
    try {
      await onToggleFavorite(item.id, newStatus);
    } catch (error) {
      console.error("RestaurantListItem: Failed to toggle favorite via prop", error);
      setIsFavoriteLocal(!newStatus);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // ... rest of your component's rendering logic using item.xxx ...
  // (Make sure to use item.isOpen, item.promoLabel, item.deliveryTime, item.distance directly)

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
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
              {item.isOpen !== undefined && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: item.isOpen
                        ? COLORS.success || "green"
                        : COLORS.danger || "red",
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

// Styles (ensure these are complete and correct)
const styles = StyleSheet.create({
  container: {
    height: 180,
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
    alignItems: "flex-start",
    zIndex: 1,
  },
  topLeftBadges: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
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
    alignSelf: "flex-start",
  },
  promoText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  favoriteButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
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
});
