// app/(tabs)/restaurants.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    // Image, // No longer directly used here for restaurant items
    TouchableOpacity,
    Dimensions,
    Animated,
    Platform,
    StatusBar,
    TextInput,
    FlatList,
    ScrollView,
    ListRenderItem,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
    Search, ArrowLeft, Star, Clock, Filter as FilterIcon, ChevronDown, Heart,
    Bell, MapPin, X, Check, AlertCircle, SlidersHorizontal,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { favoriteService, FavoriteItemDto } from "@/src/api/services"
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "@/components/home-page/constants";

// ***** IMPORT THE MODIFIED RestaurantListItem and its PROPS INTERFACE *****
import { RestaurantListItem, type RestaurantListItemProps } from "@/components/home-page/RestaurantListItem"; // Adjust path
import { categoryService, restaurantService } from "@/src/api/services";
import { CategoryItem } from "@/components/home-page/category-item";
import { Category } from "@/types/menu-types";

const { width, height } = Dimensions.get("window");

interface CategoryViewData { id: string; name: string; icon: string; }
// No longer need RestaurantViewData, will map directly to RestaurantListItemProps

type SortByOption = "recommended" | "rating" | "delivery_time" | "distance";
type PriceRangeOption = "all" | "$" | "$$" | "$$$"; // This is for filtering, not directly on RestaurantListItemProps

const iconMap: Record<string, string> = { /* ... (same as before) ... */
    All: "🍽️", Pizza: "🍕", Burgers: "🍔", Sushi: "🍣",
    Healthy: "🥗", Desserts: "🍰", Asian: "🍜", Italian: "🍝", Inne: "🤷",
};
const SORT_LABELS: Record<SortByOption, string> = { /* ... (same as before) ... */
    recommended: "Polecane", rating: "Ocena", delivery_time: "Czas dostawy", distance: "Odległość",
};
const PRICE_LABELS: Record<PriceRangeOption, string> = { /* ... (same as before) ... */
    all: "Wszystkie", $: "Niskie ($)", $$: "Średnie ($$)", $$$: "Wysokie ($$$)",
};

export default function RestaurantsScreen() {
    const router = useRouter();
    const { userToken, isAuthenticated, isLoading: isLoadingAuth } = useAuth();

    const [categories, setCategories] = useState<CategoryViewData[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    // Now stores data compatible with RestaurantListItemProps
    const [allRestaurants, setAllRestaurants] = useState<RestaurantListItemProps[]>([]);
    const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
    const [errorRestaurants, setErrorRestaurants] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategoryTag, setActiveCategoryTag] = useState<string>("All");
    const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<SortByOption>("recommended");
    const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRangeOption>("all");
    // For managing favorite status if fetched with restaurants or updated via API
    // const [userFavorites, setUserFavorites] = useState<string[]>([]); // Array of favorite restaurant IDs

    const filterSheetAnim = useRef(new Animated.Value(height)).current;

    const fetchData = useCallback(async () => {
        setIsLoadingCategories(true); setIsLoadingRestaurants(true);
        setErrorCategories(null); setErrorRestaurants(null);

        let userFavoritesData: FavoriteItemDto[] = [];
        if (isAuthenticated && userToken) { // Check isLoadingAuth if you want to wait for auth to resolve
            try {
                userFavoritesData = await favoriteService.getUserFavorites(userToken);
            } catch (favError) {
                console.error("RestaurantsScreen: Error fetching user favorites:", favError);
                // Optionally set an error state for favorites or proceed without them
            }
        }

        try { /* Category fetching remains the same */
            const categoryDtos = await categoryService.getAll();
            const mappedCategories: CategoryViewData[] = categoryDtos.map(dto => {
                const categoryName = dto.name || "Inne";
                return { id: dto.id.toString(), name: categoryName, icon: iconMap[categoryName] || iconMap["Inne"] };
            });
            setCategories([{ id: "0", name: "All", icon: iconMap["All"] || "🍽️" }, ...mappedCategories]);
        } catch (err) { setErrorCategories("Nie udało się wczytać kategorii."); console.error("Cat err:", err); }
        finally { setIsLoadingCategories(false); }

        try {
            const restaurantDtos = await restaurantService.getAll();
            // Map directly to RestaurantListItemProps
            const mappedRestaurants: RestaurantListItemProps[] = restaurantDtos.map(dto => {
                const isFav = userFavoritesData.some(fav => fav.restaurantId === dto.id);
                const tags: string[] = [];
                if (dto.categoryName) tags.push(dto.categoryName);
                if (tags.length === 0) tags.push("Różne");

                

                return {
                    id: dto.id.toString(),
                    name: dto.name || "Nieznana Restauracja",
                    imageUrl: dto.imageUrl || undefined, // Pass as string or undefined
                    cuisineType: tags.join(', ') || undefined, // Example: join tags for cuisineType
                    rating: dto.averageRating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
                    deliveryTime: dto.deliveryTime || `${15 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 15)} min`,
                    distance: dto.distance || `${(Math.random() * 4 + 0.5).toFixed(1)} km`,
                    isOpen: Math.random() > 0.3, // Mock isOpen
                    promoLabel: Math.random() > 0.7 ? "Darmowa Dostawa" : undefined, // Mock promoLabel
                    isFavorite: isFav, // Default, should be fetched or managed with user's favorites
                };
            });
            setAllRestaurants(mappedRestaurants);
        } catch (err) { setErrorRestaurants("Nie udało się wczytać restauracji."); console.error("Rest err:", err); }
        finally { setIsLoadingRestaurants(false); }
    }, []);

    useEffect(() => { /* StatusBar and initial fetchData call */
        StatusBar.setBarStyle("dark-content");
        if (Platform.OS === "android") { StatusBar.setBackgroundColor("transparent"); StatusBar.setTranslucent(true); }
        fetchData();
    }, [fetchData]);

    useEffect(() => { /* Filter sheet animation */
        Animated.spring(filterSheetAnim, { toValue: showFilterSheet ? 0 : height, useNativeDriver: true, bounciness: 0 }).start();
    }, [showFilterSheet, filterSheetAnim]);

    useFocusEffect(
        useCallback(() => {
            console.log("RestaurantsScreen: Screen focused, calling fetchData.");
            if (!isLoadingAuth) { // Optionally wait for auth to resolve if it's initially loading
                fetchData();
            }
            // Optional: Return a cleanup function if needed when the screen loses focus
            // return () => console.log("RestaurantsScreen: Screen unfocused");
        }, [fetchData, isLoadingAuth]) // fetchData is a dependency here
    );

    const processedRestaurants = useMemo(() => {
        let restaurantsToDisplay = [...allRestaurants];
        if (searchTerm.trim()) { /* Search logic */
            const lowercasedTerm = searchTerm.toLowerCase();
            restaurantsToDisplay = restaurantsToDisplay.filter(r => r.name.toLowerCase().includes(lowercasedTerm) || r.cuisineType?.toLowerCase().includes(lowercasedTerm));
        }
        if (activeCategoryTag !== "All") { /* Category tag logic */
            restaurantsToDisplay = restaurantsToDisplay.filter(r => r.cuisineType?.includes(activeCategoryTag)); // Assuming cuisineType holds category tags
        }
        // Price Range filter needs RestaurantDto to have priceRange or mock it
        // if (selectedPriceRange !== "all") {
        //     restaurantsToDisplay = restaurantsToDisplay.filter(r => r.priceRange === selectedPriceRange);
        // }
        switch (sortBy) { /* Sort logic - needs data like minTime, numericDistance on RestaurantListItemProps if sorting by these */
            case "rating": restaurantsToDisplay.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
            // Add other sort cases if data is available on RestaurantListItemProps
        }
        return restaurantsToDisplay;
    }, [allRestaurants, searchTerm, activeCategoryTag, selectedPriceRange, sortBy]);

    const resetAllFilters = () => {
        setSortBy("recommended");
        setSelectedPriceRange("all");
        setActiveCategoryTag("All"); // This was missing from your previous full file, but good to have
        setShowFilterSheet(false); // This closes the sheet immediately
    };
    const applyFiltersFromSheet = () => setShowFilterSheet(false);

    // Placeholder for actual favorite toggling logic
    const handleRestaurantFavoriteToggle = async (restaurantId: string, newStatus: boolean) => {
        if (!isAuthenticated || !userToken) {
            Alert.alert("Logowanie", "Zaloguj się, aby zarządzać ulubionymi.");
            return;
        }
        const numericId = parseInt(restaurantId, 10);
        if (isNaN(numericId)) {
            console.error("Invalid restaurantId for favorite toggle:", restaurantId);
            Alert.alert("Błąd", "Wystąpił problem z ID restauracji.");
            return;
        }

        // Keep the original state for potential revert
        const originalRestaurants = [...allRestaurants];

        // Optimistic UI Update
        setAllRestaurants(prev =>
            prev.map(r => (r.id === restaurantId ? { ...r, isFavorite: newStatus } : r))
        );

        try {
            if (newStatus) {
                await favoriteService.addRestaurantFavorite(numericId, userToken);
                console.log(`Restaurant ${restaurantId} added to favorites.`);
            } else {
                await favoriteService.removeRestaurantFavorite(numericId, userToken);
                console.log(`Restaurant ${restaurantId} removed from favorites.`);
            }
            // Optionally: re-fetch user favorites here if your global state isn't updated,
            // or if you want to be absolutely sure, though optimistic update is usually enough.
            // fetchData(); // Or a more targeted favorite update
        } catch (apiError: any) {
            console.error("API Error toggling restaurant favorite:", apiError);
            // Revert UI on error
            setAllRestaurants(originalRestaurants);
            Alert.alert("Błąd", apiError.message || "Nie udało się zaktualizować ulubionych.");
        }
    };

    const renderRestaurantListItem: ListRenderItem<RestaurantListItemProps> = ({ item }) => (
        <RestaurantListItem
            item={item}
            onPress={(id) => router.push(`/restaurant/${id}`)}
            onToggleFavorite={handleRestaurantFavoriteToggle} // Pass the handler
            style={styles.restaurantListItemStyle} // Apply specific style for this list
        />
    );

    const renderHeader = () => ( // This is an implicit return of the View
        <View style={styles.headerMainContainer}>
            <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/')}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Restauracje</Text>
                <TouchableOpacity onPress={() => { /* TODO: Notifications */ }}>
                    <Bell size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
            <View style={styles.searchBarContainer}>
                <Search size={20} color={COLORS.textSecondary} />
                <TextInput
                    placeholder="Szukaj restauracji..."
                    placeholderTextColor={COLORS.textLight}
                    style={styles.searchInput}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                {searchTerm ? <TouchableOpacity onPress={() => setSearchTerm("")} style={{ padding: SPACING.xs }}><X size={18} color={COLORS.textSecondary} /></TouchableOpacity> : null}
            </View>
        </View>
    );
    const renderFilterAndSortBar = (): React.ReactNode => (
        <View style={styles.filterSortBarContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingRight: SPACING.md }}>
                <TouchableOpacity style={styles.filterSortButton} onPress={() => setShowFilterSheet(true)}>
                    <FilterIcon size={16} color={COLORS.textSecondary} />
                    <Text style={styles.filterSortButtonText}>Filtry</Text>
                    {(selectedPriceRange !== 'all') && <View style={styles.activeFilterDot}/>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterSortButton} onPress={() => setShowFilterSheet(true)}>
                    <SlidersHorizontal size={16} color={COLORS.textSecondary} />
                    <Text style={styles.filterSortButtonText}>Sortuj: {SORT_LABELS[sortBy]}</Text>
                </TouchableOpacity>
                {activeCategoryTag !== "All" && (
                    <TouchableOpacity style={[styles.filterSortButton, styles.activeFilterChip]} onPress={() => setActiveCategoryTag("All")}>
                        <Text style={[styles.filterSortButtonText, styles.activeFilterChipText]}>{activeCategoryTag}</Text>
                        <X size={14} color={COLORS.accent} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
    
    const renderCategoryItem: ListRenderItem<CategoryViewData> = ({ item }) => (
        <TouchableOpacity style={styles.categoryItemContainer} onPress={() => setActiveCategoryTag(item.name)}>
            <View style={[styles.categoryIconWrapper, { backgroundColor: activeCategoryTag === item.name ? COLORS.primary : COLORS.cardBackground }]}>
                <Text style={styles.categoryIconText}>{item.icon}</Text>
            </View>
            <Text style={[styles.categoryNameText, { color: activeCategoryTag === item.name ? COLORS.accent : COLORS.textSecondary, fontWeight: activeCategoryTag === item.name ? "600" : "400" }]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderCategoriesList = (): React.ReactNode | null => {
        if (isLoadingCategories) return <ActivityIndicator style={styles.categoriesLoader} size="small" color={COLORS.primary} />;
        if (errorCategories) return <Text style={styles.errorLoadingText}>{errorCategories}</Text>;
        if (categories.length <= 1 && !isLoadingCategories) return null; // Don't show if only "All" or empty and not loading

        return (
            <View style={styles.categoriesListContainer}>
                <FlatList data={categories} renderItem={renderCategoryItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesFlatListContent} />
            </View>
        );
    };
    const renderMainContent = () => { /* ... (same as before, but FlatList uses renderRestaurantListItem) ... */
        if (isLoadingRestaurants && allRestaurants.length === 0) { /* ... */ }
        if (errorRestaurants && allRestaurants.length === 0) { /* ... */ }
        if (processedRestaurants.length === 0 && !isLoadingRestaurants) { /* ... */ }
        return <FlatList data={processedRestaurants} renderItem={renderRestaurantListItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.restaurantListContentContainer} showsVerticalScrollIndicator={false} ListHeaderComponent={isLoadingRestaurants ? <ActivityIndicator size="small" color={COLORS.primary} style={{marginVertical: SPACING.md}} /> : null} />;
    };
    const renderFilterSheet = (): React.ReactNode => (
        <Animated.View style={[styles.filterSheetContainer, { transform: [{ translateY: filterSheetAnim }] }]}>
            <View style={styles.filterSheetHeader}><Text style={styles.filterSheetTitle}>Filtry i Sortowanie</Text><TouchableOpacity onPress={() => setShowFilterSheet(false)}><X size={24} color={COLORS.textPrimary} /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterSheetScrollContent}>
                <View style={styles.filterSection}><Text style={styles.filterSectionTitle}>Sortuj według</Text>
                    {Object.entries(SORT_LABELS).map(([key, label]) => (
                        <TouchableOpacity key={key} style={styles.filterOptionRow} onPress={() => setSortBy(key as SortByOption)}>
                            <Text style={[styles.filterOptionText, sortBy === key && styles.filterOptionTextActive]}>{label}</Text>
                            {sortBy === key && <Check size={18} color={COLORS.accent} />}
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.filterSection}><Text style={styles.filterSectionTitle}>Przedział cenowy</Text>
                    <View style={styles.priceChipContainer}>
                        {Object.entries(PRICE_LABELS).map(([key, label]) => (
                            <TouchableOpacity key={key} style={[styles.priceChip, selectedPriceRange === key && styles.priceChipActive]} onPress={() => setSelectedPriceRange(key as PriceRangeOption)}>
                                <Text style={[styles.priceChipText, selectedPriceRange === key && styles.priceChipTextActive]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.filterSheetFooter}>
                <TouchableOpacity style={styles.filterResetButton} onPress={resetAllFilters}><Text style={styles.filterResetButtonText}>Resetuj</Text></TouchableOpacity>
                <TouchableOpacity style={styles.filterApplyButton} onPress={applyFiltersFromSheet}><Text style={styles.filterApplyButtonText}>Pokaż wyniki</Text></TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.screenContainer}>
            {renderHeader()}
            {renderFilterAndSortBar()}
            {renderCategoriesList()}
            <View style={{flex: 1}}>
                {renderMainContent()}
            </View>
            {renderFilterSheet()}
        </View>
    );

    return (
        <View style={styles.screenContainer}>
            {renderHeader()}
            {renderFilterAndSortBar()}
            {renderCategoriesList()}
            <View style={{flex: 1}}>
                {renderMainContent()}
            </View>
            {renderFilterSheet()}
        </View>
    );
}

const styles = StyleSheet.create({
    // ... (Most styles from your previous RestaurantsScreen can be kept) ...
    // Add or adjust this style for how RestaurantListItem should appear in the FlatList
    restaurantListItemStyle: {
        marginHorizontal: 0, // FlatList contentContainerStyle will handle horizontal padding
        marginVertical: SPACING.sm,
        // height: 180, // Keep default height or allow it to be dynamic
    },
    // Ensure other styles like headerMainContainer, filterSheetContainer, etc., are complete
    screenContainer: { flex: 1, backgroundColor: COLORS.background },
    headerMainContainer: {
        paddingTop: Platform.OS === "ios" ? SPACING.xxl - SPACING.sm : SPACING.xl - SPACING.xs,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.cardBackground,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.medium,
        zIndex: 10,
    },
    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.md,
    },
    headerTitle: { fontSize: FONT_SIZE.xl + 2, fontWeight: "bold", color: COLORS.textPrimary },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        height: 48,
    },
    searchInput: { flex: 1, marginLeft: SPACING.sm, fontSize: FONT_SIZE.md, color: COLORS.textPrimary },
    filterSortBarContainer: {
        paddingVertical: SPACING.sm,
        paddingLeft: SPACING.lg,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    filterSortButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.cardBackground,
        marginRight: SPACING.sm,
        ...SHADOWS.small,
    },
    filterSortButtonText: { marginLeft: SPACING.xs, color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
    activeFilterDot: {
        width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: SPACING.xs + 2,
    },
    activeFilterChip: {
        backgroundColor: COLORS.primaryLight,
        paddingRight: SPACING.sm,
    },
    activeFilterChipText: {
        color: COLORS.accent,
        fontWeight: '600',
    },
    categoriesListContainer: { marginVertical: SPACING.md, backgroundColor: COLORS.background },
    categoriesFlatListContent: { paddingHorizontal: SPACING.lg, paddingRight: SPACING.md },
    categoryItemContainer: { marginRight: SPACING.md, alignItems: "center", paddingBottom: SPACING.xs },
    categoryIconWrapper: {
        width: 60, height: 60, borderRadius: BORDER_RADIUS.xl,
        justifyContent: "center", alignItems: "center", marginBottom: SPACING.xs,
        ...SHADOWS.small,
    },
    categoryIconText: { fontSize: FONT_SIZE.xxl - 4 },
    categoryNameText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
    categoriesLoader: { marginVertical: SPACING.md + 20, height: 60 + SPACING.xs + FONT_SIZE.xs },
    restaurantListContentContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: 80 },
    // restaurantItemContainer: { // This style is now handled by restaurantListItemStyle or RestaurantListItem's default
    //     marginBottom: SPACING.lg,
    //     borderRadius: BORDER_RADIUS.xl,
    //     backgroundColor: COLORS.cardBackground,
    //     ...SHADOWS.medium,
    //     overflow: "hidden",
    // },
    // restaurantImageWrapper: { position: "relative" }, // These are now inside RestaurantListItem
    // restaurantImage: { width: "100%", height: 160 },
    // promoBadge: { /* ... */ },
    // promoText: { /* ... */ },
    // favoriteIconOnImage: { /* ... */ },
    // restaurantInfoContainer: { /* ... */ },
    // restaurantNameAndPrice: { /* ... */ },
    // restaurantName: { /* ... */ },
    // priceRangeBadge: { /* ... */ },
    // priceRangeText: { /* ... */ },
    // tagsContainer: { /* ... */ },
    // tagText: { /* ... */ },
    // ratingTimeDistanceContainer: { /* ... */ },
    // infoPair: { /* ... */ },
    // infoPairText: { /* ... */ },
    centeredMessageContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.lg, paddingBottom: SPACING.xxl },
    loadingText: { marginTop: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
    errorLoadingText: { color: COLORS.danger, textAlign: "center", fontSize: FONT_SIZE.sm, padding: SPACING.md },
    retryButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.lg, ...SHADOWS.small },
    retryButtonText: { color: COLORS.white, fontWeight: '600', fontSize: FONT_SIZE.md },
    noResultsText: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs, textAlign: 'center' },
    noResultsSubText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, textAlign: 'center'},
    filterSheetContainer: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.cardBackground,
        borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm,
        ...SHADOWS.large,
        maxHeight: height * 0.75,
        elevation: 20,
    },
    filterSheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md, paddingVertical: SPACING.sm },
    filterSheetTitle: { fontSize: FONT_SIZE.xl, fontWeight: "bold", color: COLORS.textPrimary },
    filterSheetScrollContent: { paddingBottom: 90 },
    filterSection: { marginBottom: SPACING.xl },
    filterSectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: "600", color: COLORS.textPrimary, marginBottom: SPACING.md },
    filterOptionRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    filterOptionText: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary },
    filterOptionTextActive: { color: COLORS.accent, fontWeight: "600" },
    priceChipContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: 'space-between' },
    priceChip: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.surfaceVariant,
        marginBottom: SPACING.sm,
        minWidth: (width - SPACING.lg * 2 - SPACING.sm * 3) / 4 -1,
        alignItems: 'center',
    },
    priceChipActive: { backgroundColor: COLORS.primaryLight },
    priceChipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: "500" },
    priceChipTextActive: { color: COLORS.accent, fontWeight: "600" },
    filterSheetFooter: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        paddingBottom: Platform.OS === "ios" ? SPACING.xl : SPACING.md,
        borderTopWidth: 1, borderTopColor: COLORS.border,
        backgroundColor: COLORS.cardBackground,
    },
    filterResetButton: {
        paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
    },
    filterResetButtonText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: FONT_SIZE.md },
    filterApplyButton: {
        backgroundColor: COLORS.accent, paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg,
        flex: 1, marginLeft: SPACING.md, alignItems: 'center', ...SHADOWS.small
    },
    filterApplyButtonText: { color: COLORS.white, fontWeight: "bold", fontSize: FONT_SIZE.md },
});
