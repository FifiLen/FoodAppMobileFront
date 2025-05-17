"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "@/components/home-page/constants";
import {
  RestaurantListItem,
  type RestaurantListItemProps,
} from "@/components/home-page/RestaurantListItem";
// You might want a specific ProductListItem in the future:
// import { ProductListItem, type ProductListItemPropsForFav } from "@/components/ProductListItem";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  XCircle,
  HeartOff,
  Store,
  Package, // Package will be replaced by Utensils for the button
  Utensils, // Added Utensils icon
} from "lucide-react-native";
import { FavoriteItemDto, favoriteService } from "@/src/api/services";

type FavoriteDisplayType = "restaurant" | "product";

interface UIFavoriteItem extends RestaurantListItemProps {
  originalApiId: string;
  originalType: FavoriteDisplayType;
  productName?: string;
  productPrice?: number;
  productRestaurantName?: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { userToken, isAuthenticated, isLoading: isLoadingAuth } = useAuth();

  const [allRawFavorites, setAllRawFavorites] = useState<FavoriteItemDto[]>([]);
  const [processedAndFilteredFavorites, setProcessedAndFilteredFavorites] =
    useState<UIFavoriteItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFavoriteType, setActiveFavoriteType] =
    useState<FavoriteDisplayType>("restaurant");

  const mapFavoriteDtoToUIItem = useCallback(
    (dto: FavoriteItemDto): UIFavoriteItem | null => {
      if (dto.restaurantId && dto.restaurantName) {
        return {
          id: dto.restaurantId.toString(),
          originalApiId: dto.restaurantId.toString(),
          name: dto.restaurantName,
          imageUrl: undefined,
          isFavorite: true,
          originalType: "restaurant",
          deliveryTime: "20-30 min",
          distance: "1-2 km",
          isOpen: Math.random() > 0.2,
        };
      } else if (dto.productId && dto.productName) {
        return {
          id: dto.productId.toString(),
          originalApiId: dto.productId.toString(),
          name: dto.productName,
          imageUrl: dto.productImageUrl || undefined,
          isFavorite: true,
          originalType: "product",
          productName: dto.productName,
          productPrice: dto.productPrice || undefined,
          productRestaurantName: dto.productRestaurantName || undefined,
        };
      }
      return null;
    },
    [],
  );

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !userToken) {
      setAllRawFavorites([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const favoriteDtos = await favoriteService.getUserFavorites(userToken);
      setAllRawFavorites(favoriteDtos);
    } catch (err: any) {
      console.error("FavoritesScreen: Błąd pobierania ulubionych:", err);
      setError(err.message || "Nie udało się wczytać ulubionych.");
      setAllRawFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userToken]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoadingAuth) {
        fetchFavorites();
      }
    }, [isLoadingAuth, fetchFavorites]),
  );

  useEffect(() => {
    if (isLoadingAuth || isLoading) {
      setProcessedAndFilteredFavorites([]);
      return;
    }
    if (!isAuthenticated) {
      setProcessedAndFilteredFavorites([]);
      return;
    }

    const uiItems = allRawFavorites
      .map(mapFavoriteDtoToUIItem)
      .filter((item): item is UIFavoriteItem => item !== null);

    const typeFilteredItems = uiItems.filter(
      (item) => item.originalType === activeFavoriteType,
    );

    if (searchTerm.trim() === "") {
      setProcessedAndFilteredFavorites(typeFilteredItems);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const searchedItems = typeFilteredItems.filter((fav) => {
        const nameMatch = fav.name.toLowerCase().includes(lowercasedTerm);
        let restaurantNameMatch = false;
        if (fav.originalType === "product" && fav.productRestaurantName) {
          restaurantNameMatch = fav.productRestaurantName
            .toLowerCase()
            .includes(lowercasedTerm);
        }
        return nameMatch || restaurantNameMatch;
      });
      setProcessedAndFilteredFavorites(searchedItems);
    }
  }, [
    searchTerm,
    allRawFavorites,
    activeFavoriteType,
    isLoadingAuth,
    isLoading,
    isAuthenticated,
    mapFavoriteDtoToUIItem,
  ]);

  const handleToggleFavorite = async (itemToToggle: UIFavoriteItem) => {
    if (!isAuthenticated || !userToken) {
      setError("Zaloguj się, aby zarządzać ulubionymi.");
      return;
    }

    setProcessedAndFilteredFavorites((prev) =>
      prev.filter(
        (fav) =>
          fav.originalApiId !== itemToToggle.originalApiId ||
          fav.originalType !== itemToToggle.originalType,
      ),
    );
    setAllRawFavorites((prev) =>
      prev.filter((favDto) => {
        if (itemToToggle.originalType === "restaurant")
          return favDto.restaurantId?.toString() !== itemToToggle.originalApiId;
        if (itemToToggle.originalType === "product")
          return favDto.productId?.toString() !== itemToToggle.originalApiId;
        return true;
      }),
    );

    try {
      const numericId = parseInt(itemToToggle.originalApiId, 10);
      if (itemToToggle.originalType === "restaurant") {
        await favoriteService.removeRestaurantFavorite(numericId, userToken);
      } else if (itemToToggle.originalType === "product") {
        await favoriteService.removeProductFavorite(numericId, userToken);
      }
    } catch (apiError: any) {
      console.error(
        "FavoritesScreen: Błąd API przy usuwaniu ulubionego:",
        apiError,
      );
      setError(`Błąd usuwania ulubionego: ${apiError.message}`);
      fetchFavorites();
    }
  };

  const handleItemPress = (item: UIFavoriteItem) => {
    if (item.originalType === "restaurant") {
      router.push(`/restaurant/${item.originalApiId}` as any);
    } else if (item.originalType === "product") {
      const originalDto = allRawFavorites.find(
        (dto) => dto.productId?.toString() === item.originalApiId,
      );
      if (originalDto?.productRestaurantName && originalDto.restaurantId) {
        router.push(`/restaurant/${originalDto.restaurantId}` as any);
      } else {
        Alert.alert("Info", "Szczegóły produktu nie są jeszcze dostępne.");
      }
    }
  };

  const renderFavoriteItem: ListRenderItem<UIFavoriteItem> = ({ item }) => {
    const displayItemProps: RestaurantListItemProps = {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      isFavorite: true,
      deliveryTime: item.deliveryTime,
      distance: item.distance,
      isOpen: item.isOpen,
    };

    return (
      <RestaurantListItem
        item={displayItemProps}
        onPress={() => handleItemPress(item)}
        onToggleFavorite={() => handleToggleFavorite(item)}
      />
    );
  };

  const clearSearch = () => setSearchTerm("");

  if (isLoadingAuth) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Autoryzacja...</Text>
      </View>
    );
  }
  if (!isAuthenticated) {
    return (
      <View style={styles.centeredContainer}>
        <Stack.Screen options={{ title: "Ulubione" }} />
        <HeartOff size={48} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>
          Zaloguj się, aby zobaczyć swoje ulubione.
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Zaloguj się</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ title: "Moje Ulubione" }} />

      <View style={styles.segmentedControlContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeFavoriteType === "restaurant" && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveFavoriteType("restaurant")}
        >
          <Store
            size={18}
            color={
              activeFavoriteType === "restaurant"
                ? COLORS.white
                : COLORS.primary
            }
            style={styles.segmentIcon}
          />
          <Text
            style={[
              styles.segmentText,
              activeFavoriteType === "restaurant" && styles.segmentTextActive,
            ]}
          >
            Restauracje
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeFavoriteType === "product" && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveFavoriteType("product")}
        >
          <Utensils // Changed from Package
            size={18}
            color={
              activeFavoriteType === "product" ? COLORS.white : COLORS.primary
            }
            style={styles.segmentIcon}
          />
          <Text
            style={[
              styles.segmentText,
              activeFavoriteType === "product" && styles.segmentTextActive,
            ]}
          >
            Dania
          </Text>
          {/* Changed from Produkty */}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <Search size={20} color={COLORS.textSecondary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder={`Szukaj w ulubionych ${
            activeFavoriteType === "restaurant" ? "restauracjach" : "daniach" // Changed from produktach
          }...`}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            style={styles.clearSearchButton}
          >
            <XCircle size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Ładowanie...</Text>
        </View>
      )}
      {!isLoading && error && (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchFavorites}
          >
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isLoading &&
        !error &&
        processedAndFilteredFavorites.length === 0 && (
          <View style={styles.centeredContainer}>
            <HeartOff size={48} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {searchTerm
                ? `Brak pasujących ulubionych ${
                    activeFavoriteType === "restaurant"
                      ? "restauracji"
                      : "dań" // Changed from produktów
                  }.`
                : `Nie masz jeszcze żadnych ulubionych ${
                    activeFavoriteType === "restaurant"
                      ? "restauracji"
                      : "dań" // Changed from produktów
                  }.`}
            </Text>
          </View>
        )}
      {!isLoading && !error && processedAndFilteredFavorites.length > 0 && (
        <FlatList
          data={processedAndFilteredFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => `${item.originalType}-${item.originalApiId}`}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: COLORS.background },
  segmentedControlContainer: {
    flexDirection: "row",
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "transparent",
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  segmentIcon: {
    marginRight: SPACING.xs,
  },
  segmentText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.small,
    height: 48,
  },
  searchIconContainer: { paddingHorizontal: SPACING.sm },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    height: "100%",
    paddingVertical: Platform.OS === "ios" ? SPACING.sm : 0,
  },
  clearSearchButton: { padding: SPACING.sm },
  listContentContainer: {
    paddingHorizontal: SPACING.md / 2,
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
    marginTop: SPACING.md,
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
