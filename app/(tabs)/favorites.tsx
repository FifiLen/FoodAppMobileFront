"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  ListRenderItem,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native"; // For re-fetching on screen focus

import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "@/components/home-page/constants"; // Adjust path
import {
  RestaurantListItem,
  type RestaurantListItemProps,
} from "@/components/home-page/RestaurantListItem"; // Adjust path
import { useAuth } from "@/context/AuthContext";
import { Search, XCircle, HeartOff } from "lucide-react-native"; // Icons
import { FavoriteItemDto, favoriteService } from "@/src/api/services";

// Define what a UI-ready favorite item will look like (mapped from FavoriteItemDto)
interface UIFavoriteItem extends RestaurantListItemProps {
  originalType: "restaurant" | "product"; // To distinguish if needed later
  // Add product-specific fields if you display product favorites differently
  productName?: string;
  productPrice?: number;
  productRestaurantName?: string;
  restaurantName?:string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { userToken, isAuthenticated, isLoading: isLoadingAuth } = useAuth();

  const [allFavorites, setAllFavorites] = useState<UIFavoriteItem[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<UIFavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const mapFavoriteDtoToUIItem = (
    dto: FavoriteItemDto,
  ): UIFavoriteItem | null => {
    if (dto.restaurantId && dto.restaurantName) {
      return {
        id: dto.restaurantId.toString(), // Use restaurantId as the primary ID for the list item
        name: dto.restaurantName,
        imageUrl: dto.productImageUrl || undefined, // FavoriteItemDto has productImageUrl, maybe use a generic one for restaurant?
        // For now, RestaurantListItem will use its default if imageUrl is undefined.
        // You might need to fetch full restaurant details if you need more than name/id.
        isFavorite: true, // It's a favorite by definition here
        originalType: "restaurant",
        // Mock or leave other RestaurantListItemProps as undefined if not in FavoriteItemDto
        // cuisineType: dto.restaurantCuisineType, // If available
        // rating: dto.restaurantRating, // If available
      };
    } else if (dto.productId && dto.productName) {
      // For now, we are focusing on restaurants, but this is how you'd map products
      // You'd likely use a different list item component for products
      return {
        id: dto.productId.toString(),
        name: dto.productName, // This will be used by RestaurantListItem's name prop
        imageUrl: dto.productImageUrl || undefined,
        isFavorite: true,
        originalType: "product",
        productName: dto.productName,
        productPrice: dto.productPrice || undefined,
        productRestaurantName: dto.productRestaurantName || undefined,
        // Map other relevant fields to RestaurantListItemProps or a dedicated ProductListItemProps
        restaurantName: dto.restaurantName|| undefined, // So search can find it
      };
    }
    return null; // Should not happen if DTO is valid
  };

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !userToken) {
      setAllFavorites([]);
      setFilteredFavorites([]);
      setIsLoading(false);
      // setError("Zaloguj się, aby zobaczyć ulubione."); // Optional: show message or rely on screen protection
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const favoriteDtos = await favoriteService.getUserFavorites(userToken);
      const uiItems = favoriteDtos
        .map(mapFavoriteDtoToUIItem)
        .filter((item): item is UIFavoriteItem => item !== null); // Type guard

      // For now, let's only show restaurant favorites using RestaurantListItem
      const restaurantUiItems = uiItems.filter(item => item.originalType === 'restaurant');

      setAllFavorites(restaurantUiItems);
      setFilteredFavorites(restaurantUiItems); // Initialize filtered list
    } catch (err: any) {
      console.error("FavoritesScreen: Błąd pobierania ulubionych:", err);
      setError(err.message || "Nie udało się wczytać ulubionych.");
      setAllFavorites([]);
      setFilteredFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userToken]);

  // Fetch favorites when the screen comes into focus or auth state changes
  useFocusEffect(
    useCallback(() => {
      if (!isLoadingAuth) { // Ensure auth state is resolved
        // console.log("FavoritesScreen focused, isAuthenticated:", isAuthenticated);
        fetchFavorites();
      }
    }, [isLoadingAuth, fetchFavorites]) // fetchFavorites is memoized by useCallback
  );


  // Filter logic
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredFavorites(allFavorites);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = allFavorites.filter((fav) =>
        fav.name.toLowerCase().includes(lowercasedTerm) ||
        (fav.restaurantName && fav.restaurantName.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredFavorites(filtered);
    }
  }, [searchTerm, allFavorites]);

  const handleToggleFavorite = async (
    itemId: string, // This will be restaurantId or productId
    newStatus: boolean,
  ) => {
    if (!isAuthenticated || !userToken) {
      setError("Zaloguj się, aby zarządzać ulubionymi.");
      return;
    }

    const itemToToggle = allFavorites.find((fav) => fav.id === itemId);
    if (!itemToToggle) return;

    // Optimistic UI update
    setAllFavorites((prev) =>
      prev
        .map((fav) =>
          fav.id === itemId ? { ...fav, isFavorite: newStatus } : fav,
        )
        .filter(fav => newStatus ? true : fav.id !== itemId) // Remove if un-favorited
    );


    try {
      const numericId = parseInt(itemId, 10);
      if (itemToToggle.originalType === "restaurant") {
        if (newStatus) {
          // This case shouldn't happen if it's already a favorite, but for robustness:
          await favoriteService.addRestaurantFavorite(numericId, userToken);
        } else {
          await favoriteService.removeRestaurantFavorite(numericId, userToken);
        }
      } else if (itemToToggle.originalType === "product") {
        // Add product favorite logic here if needed
        // if (newStatus) {
        //   await favoriteService.addProductFavorite(numericId, userToken);
        // } else {
        //   await favoriteService.removeProductFavorite(numericId, userToken);
        // }
      }
      // Optionally re-fetch after successful toggle to ensure data consistency
      // await fetchFavorites();
    } catch (apiError: any) {
      console.error("FavoritesScreen: Błąd API przy zmianie ulubionych:", apiError);
      setError(`Błąd aktualizacji ulubionych: ${apiError.message}`);
      // Revert optimistic update by re-fetching
      fetchFavorites();
    }
  };

  const handleRestaurantPress = (restaurantId: string) => {
    // Assuming restaurantId is always a string here
    router.push(`/restaurant/${restaurantId}` as any);
  };

  const renderFavoriteItem: ListRenderItem<UIFavoriteItem> = ({ item }) => {
    if (item.originalType === "restaurant") {
      return (
        <RestaurantListItem
          item={item} // item is already RestaurantListItemProps
          onPress={() => handleRestaurantPress(item.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }
    // Add rendering for Product favorites if you have a ProductListItem
    // else if (item.originalType === "product") {
    //   return <ProductListItem item={item} ... />;
    // }
    return null;
  };

  const clearSearch = () => {
    setSearchTerm("");
    Keyboard.dismiss();
  };

  if (isLoadingAuth) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Sprawdzanie autoryzacji...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centeredContainer}>
        <Stack.Screen options={{ title: "Ulubione" }} />
        <HeartOff size={48} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>Zaloguj się, aby zobaczyć swoje ulubione.</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Zaloguj się</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: "Moje Ulubione" }} />

      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <Search size={20} color={COLORS.textSecondary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj w ulubionych..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
            <XCircle size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Ładowanie ulubionych...</Text>
        </View>
      )}

      {!isLoading && error && (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFavorites}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && filteredFavorites.length === 0 && (
        <View style={styles.centeredContainer}>
          <HeartOff size={48} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            {searchTerm ? "Brak pasujących ulubionych." : "Nie masz jeszcze żadnych ulubionych."}
          </Text>
        </View>
      )}

      {!isLoading && !error && filteredFavorites.length > 0 && (
        <FlatList
          data={filteredFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => `${item.originalType}-${item.id}`} // Ensure unique keys
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground, // Or a light grey
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.small,
    height: 48,
  },
  searchIconContainer: {
    paddingHorizontal: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    height: "100%",
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0, // Adjust padding for Android
  },
  clearSearchButton: {
    padding: SPACING.sm,
  },
  listContentContainer: {
    paddingHorizontal: SPACING.md / 2, // To align with RestaurantListItem's internal horizontal margin
    paddingBottom: SPACING.lg,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  infoText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
  loginButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl * 1.5,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
});
