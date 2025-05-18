// frontend/components/home-page/TopRatedRestaurantsSection.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  type ListRenderItem,
  ViewStyle,
  Dimensions,
  Alert, // IMPORT DIMENSIONS
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "./constants";
// ***** USE THE SAME RestaurantListItem *****
import {
  RestaurantListItem,
  type RestaurantListItemProps,
} from "./RestaurantListItem";
import { RefreshCw, ChevronRight, Star } from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import {
  FavoriteItemDto, // For mapping favorite status
  TopRatedRestaurantDto,
  favoriteService,
  restaurantService,
} from "@/src/api/services";

export interface TopRatedRestaurantsSectionProps {
  title?: string;
  count?: number;
  onViewAllPress?: () => void;
  showViewAllButton?: boolean;
  // itemStyle prop might not be needed if RestaurantListItem handles its own full styling
}

// Calculate item width based on screen dimensions - similar to how you might do it for a grid
// This aims for about 2.2 items visible on screen for a horizontal scroll, adjust as needed.
const SCREEN_WIDTH = Dimensions.get("window").width;
// Let's aim for a card width that allows roughly 2 to 2.5 items to be visible.
// This is a common pattern for "featured" horizontal lists.
// Adjust the divisor (2.5) or subtract more for wider margins if needed.
const ITEM_WIDTH = SCREEN_WIDTH / 2.5 > 200 ? 200 : SCREEN_WIDTH / 1.5; // Max width of 200, or responsive
// const ITEM_WIDTH = SCREEN_WIDTH * 0.6; // Alternative: 60% of screen width
// const ITEM_WIDTH = 280; // Or a fixed width like in FeaturedRestaurantsSection if preferred

export function TopRatedRestaurantsSection({
  title = "Najlepiej Oceniane",
  count = 5,
  onViewAllPress,
  showViewAllButton = true,
}: TopRatedRestaurantsSectionProps) {
  const router = useRouter();
  const [topRatedRestaurants, setTopRatedRestaurants] = useState<
    RestaurantListItemProps[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userToken, isAuthenticated, isLoading: isLoadingAuth } = useAuth();

  const mapTopRatedDtoToListItemProps = useCallback(
    (
      apiRestaurant: TopRatedRestaurantDto,
      userFavorites: FavoriteItemDto[],
    ): RestaurantListItemProps => {
      const isFav = userFavorites.some(
        (fav) => fav.restaurantId === apiRestaurant.id,
      );
      return {
        id: apiRestaurant.id.toString(),
        name: apiRestaurant.name || "Nieznana Restauracja",
        imageUrl: apiRestaurant.imageUrl || undefined,
        isFavorite: isFav,
        deliveryTime: apiRestaurant.deliveryTime || "20-30 min",
        rating: apiRestaurant.actualAverageRating,
        priceRange: apiRestaurant.priceRange || undefined, // Pass priceRange if RestaurantListItem uses it
        // cuisineType is not in TopRatedRestaurantDto, so we might omit or use a default
        cuisineType: apiRestaurant.priceRange ? `Cena: ${apiRestaurant.priceRange}` : "Różne", // Example: using priceRange as a stand-in for a tag
        isOpen: true, // Default, TopRated DTO doesn't specify
        distance: "N/A", // Not in TopRated DTO
        // Add promoLabel if you want to mock it or if it comes from API
        promoLabel: Math.random() > 0.8 ? "Top Wybór!" : undefined,
      };
    },
    [],
  );

  const fetchTopRatedData = useCallback(async () => {
    if (isLoadingAuth) return;
    setIsLoading(true);
    setError(null);
    try {
      const topRatedApiData = await restaurantService.getTopRated(count);
      let userFavoritesData: FavoriteItemDto[] = [];
      if (isAuthenticated && userToken) {
        try {
            userFavoritesData = await favoriteService.getUserFavorites(userToken);
        } catch (favError) {
            console.warn("TopRatedRestaurantsSection: Could not fetch favorites.", favError);
        }
      }
      const mappedData = topRatedApiData.map((r) =>
        mapTopRatedDtoToListItemProps(r, userFavoritesData),
      );
      setTopRatedRestaurants(mappedData);
    } catch (err: any) {
      console.error("TopRatedRestaurantsSection: Błąd:", err);
      setError(err.message || "Nie udało się wczytać danych.");
      setTopRatedRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    count,
    isLoadingAuth,
    isAuthenticated,
    userToken,
    mapTopRatedDtoToListItemProps,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoadingAuth) {
        fetchTopRatedData();
      }
    }, [isLoadingAuth, fetchTopRatedData]),
  );

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}` as any);
  };

  // Favorite Toggling - adapted from your RestaurantsScreen
  const handleToggleFavorite = useCallback(async (restaurantId: string, newStatus: boolean) => {
    if (!isAuthenticated || !userToken) {
        Alert.alert("Logowanie", "Zaloguj się, aby zarządzać ulubionymi.");
        return;
    }
    const numericId = parseInt(restaurantId, 10);
    if (isNaN(numericId)) return;

    const originalItems = [...topRatedRestaurants];
    setTopRatedRestaurants(prev =>
        prev.map(r => (r.id === restaurantId ? { ...r, isFavorite: newStatus } : r))
    );

    try {
        if (newStatus) {
            await favoriteService.addRestaurantFavorite(numericId, userToken);
        } else {
            await favoriteService.removeRestaurantFavorite(numericId, userToken);
        }
    } catch (apiError: any) {
        console.error("API Error toggling favorite in TopRated:", apiError);
        setTopRatedRestaurants(originalItems); // Revert UI
        Alert.alert("Błąd", apiError.message || "Nie udało się zaktualizować ulubionych.");
    }
  }, [isAuthenticated, userToken, topRatedRestaurants]);


  const renderRestaurantListItem: ListRenderItem<RestaurantListItemProps> = ({
    item,
  }) => (
    <View style={styles.listItemWrapper}>
      <RestaurantListItem
        item={item}
        onPress={(id) => handleRestaurantPress(id)}
        onToggleFavorite={handleToggleFavorite} // Use the new handler
        // Pass a specific style if RestaurantListItem accepts it and needs to be sized
        // style={{ width: ITEM_WIDTH }} // This would be for RestaurantListItem's internal container
      />
    </View>
  );

  const renderHeader = () =>
    (title || (showViewAllButton && onViewAllPress && !error && !isLoading && topRatedRestaurants.length > 0)) && (
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Star size={FONT_SIZE.lg + 2} color={COLORS.secondary} style={styles.titleIcon} />
          {title && <Text style={styles.headerTitle}>{title}</Text>}
        </View>
        {error && !isLoading && (
          <TouchableOpacity onPress={fetchTopRatedData} style={styles.headerButton}>
            <RefreshCw size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {showViewAllButton && onViewAllPress && !error && !isLoading && topRatedRestaurants.length > 0 && (
            <TouchableOpacity onPress={onViewAllPress} style={styles.headerButton}>
              <Text style={styles.seeAllText}>Zobacz wszystkie</Text>
              <ChevronRight size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
      </View>
    );

  if (isLoadingAuth || isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.messageText}>
            {isLoadingAuth ? "Autoryzacja..." : "Ładowanie restauracji..."}
          </Text>
        </View>
      </View>
    );
  }

  if (error && topRatedRestaurants.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centeredMessage}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTopRatedData}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (topRatedRestaurants.length === 0 && !isLoading) {
    if (!title) return null;
    return (
      <View style={styles.container}>
        {renderHeader()}
        <Text style={styles.centeredMessageText}>
          Brak najlepiej ocenianych restauracji.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {error && topRatedRestaurants.length > 0 && (
        <Text style={styles.errorTextBrief}>{error}</Text>
      )}
      <FlatList
        data={topRatedRestaurants}
        renderItem={renderRestaurantListItem}
        keyExtractor={(item) => `top-rated-${item.id}`} // Unique keys
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainerHorizontal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginBottom: SPACING.xl, // Let parent control
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  titleContainer: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  titleIcon: { marginRight: SPACING.sm -2 },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: "bold", color: COLORS.textPrimary }, // Adjusted from xl
  headerButton: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, marginLeft: SPACING.sm },
  seeAllText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: "600", marginRight: SPACING.xs },
  centeredMessage: { paddingVertical: SPACING.lg, alignItems: "center", justifyContent: "center", minHeight: 120, marginHorizontal: SPACING.md }, // Increased minHeight
  messageText: { marginTop: SPACING.sm, color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
  errorText: { color: COLORS.danger, textAlign: "center", marginBottom: SPACING.sm, fontSize: FONT_SIZE.md, paddingHorizontal: SPACING.md },
  errorTextBrief: { color: COLORS.danger, textAlign: "center", marginHorizontal: SPACING.md, marginBottom: SPACING.sm, fontSize: FONT_SIZE.sm }, // Adjusted from xs
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, ...SHADOWS.small, marginTop: SPACING.md },
  retryButtonText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: "600" },
  centeredMessageText: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, textAlign: "center", color: COLORS.textSecondary, minHeight: 50, fontSize: FONT_SIZE.md },
  listContainerHorizontal: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs, // Added for shadow visibility
  },
  // This style is for the View that WRAPS each RestaurantListItem
  // It controls the spacing and width of the item in the horizontal list
  listItemWrapper: {
    width: ITEM_WIDTH, // Use the calculated ITEM_WIDTH
    marginRight: SPACING.xs,
    // The actual card styling (background, shadow, border radius)
    // should ideally be handled by RestaurantListItem itself.
    // If RestaurantListItem is just content, then add card styles here:
    // backgroundColor: COLORS.cardBackground,
    // borderRadius: BORDER_RADIUS.lg,
    // ...SHADOWS.medium,
    // overflow: 'hidden', // If applying card styles here
  },
});
