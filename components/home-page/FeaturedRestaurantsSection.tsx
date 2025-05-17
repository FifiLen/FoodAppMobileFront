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
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "./constants";
import {
  RestaurantListItem,
  type RestaurantListItemProps,
} from "./RestaurantListItem";
import { RefreshCw, ChevronRight } from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { RestaurantDto, PopularRestaurantDto, FavoriteItemDto, restaurantService, favoriteService } from "@/src/api/services";

interface FeaturedRestaurantsSectionProps {
  title?: string;
  maxItems?: number;
  horizontal?: boolean;
  onViewAllPress?: () => void;
}

export function FeaturedRestaurantsSection({
  title = "Popularne Restauracje",
  maxItems,
  horizontal = false,
  onViewAllPress,
}: FeaturedRestaurantsSectionProps) {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<RestaurantListItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userToken, isAuthenticated, isLoading: isLoadingAuth } = useAuth();

  // Maps API DTO (RestaurantDto or PopularRestaurantDto) to RestaurantListItemProps
  const mapApiRestaurantToListItemProps = (
    apiRestaurant: RestaurantDto | PopularRestaurantDto,
    userFavorites: FavoriteItemDto[],
  ): RestaurantListItemProps => {
    const isFav = userFavorites.some(
      (fav) => fav.restaurantId === apiRestaurant.id,
    );

    // Fields available in both RestaurantDto and PopularRestaurantDto
    const baseProps = {
      id: apiRestaurant.id.toString(),
      name: apiRestaurant.name || "Nieznana Restauracja",
      isFavorite: isFav,
    };

    // Fields specific to PopularRestaurantDto (if any beyond favoriteCount, which isn't directly used in ListItemProps)
    // let popularSpecificProps = {};
    // if ('favoriteCount' in apiRestaurant) { // Type guard for PopularRestaurantDto
    //   // popularSpecificProps.someOtherField = (apiRestaurant as PopularRestaurantDto).someOtherField;
    // }

    // For fields NOT in RestaurantDto or PopularRestaurantDto, we'll rely on RestaurantListItem's defaults or mock them here.
    // RestaurantListItemProps expects: imageUrl?, cuisineType?, rating?, deliveryTime?, distance?, isOpen?, promoLabel?

    return {
      ...baseProps,
      // imageUrl: undefined, // Explicitly undefined; RestaurantListItem will use its default
      // cuisineType: undefined, // RestaurantListItem will not render this if undefined
      // rating: undefined, // RestaurantListItem will not render this if undefined

      // Mock data (as in your original RestaurantListItem or here for clarity)
      // If RestaurantListItem handles these mocks internally, you can omit them here.
      // It's generally better for the parent (this component) to decide what to pass.
      deliveryTime: `${15 + Math.floor(Math.random() * 20)}-${
        30 + Math.floor(Math.random() * 15)
      } min`,
      distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
      isOpen: Math.random() > 0.2,
      // promoLabel: Math.random() > 0.7 ? "Darmowa dostawa" : undefined, // Example
    };
  };

  const fetchFeaturedData = async () => {
    if (isLoadingAuth) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const restaurantApiData =
        horizontal && maxItems
          ? await restaurantService.getPopular(maxItems) // Returns PopularRestaurantDto[]
          : await restaurantService.getAll(); // Returns RestaurantDto[]

      let userFavoritesData: FavoriteItemDto[] = [];
      if (isAuthenticated && userToken) {
        userFavoritesData = await favoriteService.getUserFavorites(userToken);
      }

      let mappedData = restaurantApiData.map((r) =>
        mapApiRestaurantToListItemProps(r, userFavoritesData),
      );

      if (maxItems && !horizontal) {
        mappedData = mappedData.slice(0, maxItems);
      }
      setRestaurants(mappedData);
    } catch (err: any) {
      console.error("FeaturedRestaurantsSection: Błąd:", err);
      setError(err.message || "Nie udało się wczytać danych.");
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
    if (!isLoadingAuth) {
        fetchFeaturedData();
    }
  }, [isLoadingAuth, isAuthenticated, userToken])
  );

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}` as any);
  };

  const handleToggleFavorite = async (
    restaurantId: string,
    newStatus: boolean,
  ) => {
    if (!isAuthenticated || !userToken) {
      setError("Zaloguj się, aby dodać do ulubionych.");
      return;
    }
    const numericId = parseInt(restaurantId, 10);
    if (isNaN(numericId)) return;

    const originalRestaurants = [...restaurants];
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId ? { ...r, isFavorite: newStatus } : r,
      ),
    );
    try {
      if (newStatus) {
        await favoriteService.addRestaurantFavorite(numericId, userToken);
      } else {
        await favoriteService.removeRestaurantFavorite(numericId, userToken);
      }
    } catch (apiError: any) {
      console.error("FeaturedRestaurantsSection: Błąd API przy zmianie ulubionych:", apiError);
      setRestaurants(originalRestaurants);
      setError(`Błąd aktualizacji ulubionych: ${apiError.message}`);
    }
  };

  const renderRestaurantItem: ListRenderItem<RestaurantListItemProps> = ({
    item,
  }) => (
    <View
      style={
        horizontal
          ? styles.horizontalListItemContainer
          : styles.verticalListItemContainer
      }
    >
      <RestaurantListItem
        item={item}
        onPress={() => handleRestaurantPress(item.id)}
        onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      {error && !isLoading && (
        <TouchableOpacity
          onPress={fetchFeaturedData}
          style={styles.headerButton}
        >
          <RefreshCw size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      {onViewAllPress && !error && !isLoading && restaurants.length > 0 && (
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
            {isLoadingAuth ? "Sprawdzanie autoryzacji..." : "Ładowanie restauracji..."}
          </Text>
        </View>
      </View>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centeredMessage}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchFeaturedData}
          >
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (restaurants.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <Text style={styles.centeredMessageText}>
          Brak restauracji do wyświetlenia.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {error && restaurants.length > 0 && (
         <Text style={[styles.errorTextBrief]}>{error}</Text>
      )}
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          horizontal
            ? styles.listContainerHorizontal
            : styles.listContainerVertical
        }
        extraData={restaurants}
      />
    </View>
  );
}

// Styles (remain the same)
const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.xl,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: "bold",
        color: COLORS.textPrimary,
    },
    headerButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
    },
    seeAllText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: "600",
        marginRight: SPACING.xs,
    },
    centeredMessage: {
        paddingVertical: SPACING.lg,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 100,
        marginHorizontal: SPACING.md,
    },
    messageText: {
        marginTop: SPACING.sm,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
    },
    errorText: {
        color: COLORS.danger,
        textAlign: "center",
        marginBottom: SPACING.sm,
        fontSize: FONT_SIZE.sm,
        paddingHorizontal: SPACING.md,
    },
    errorTextBrief: {
        color: COLORS.danger,
        textAlign: "center",
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
        fontSize: FONT_SIZE.xs,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.small,
        marginTop: SPACING.md,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
    },
    centeredMessageText: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        textAlign: "center",
        color: COLORS.textSecondary,
        minHeight: 50,
        fontSize: FONT_SIZE.sm,
    },
    listContainerHorizontal: {
        paddingLeft: SPACING.md,
        paddingRight: SPACING.xs,
    },
    listContainerVertical: {},
    horizontalListItemContainer: {
        width: 280,
        marginRight: SPACING.md,
    },
    verticalListItemContainer: {},
});
