// frontend/app/(tabs)/index.tsx

"use client"

import React, { useState, useRef, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Animated,
    Platform,
    StatusBar,
    TextInput,
    FlatList,
    ListRenderItem,
    ActivityIndicator,
    ImageSourcePropType,
} from "react-native"
import { useRouter } from "expo-router"
import {
    Search,
    ArrowRight,
    MapPin,
    ChevronRight,
    ShoppingBag,
    Bell,
} from "lucide-react-native"

import { COLORS } from "@/components/home-page/constants"
import { SectionHeader } from "@/components/home-page/section-header"
import { CategoryItem } from "@/components/home-page/category-item"
import { FeaturedRestaurantItem } from "@/components/home-page/featured-restaurant-item"
import { PopularDishItem } from "@/components/home-page/popular-dish-item"
import { SpecialOfferItem } from "@/components/home-page/special-offer-item"
import { BottomNavigation } from "@/components/bottom-nav"
import {
    ApiCategory,
    CategoryApi,
    ApiRestaurant,
    RestaurantApi,
    ApiDish, // <<< Import interfejsu ApiDish
    DishApi,   // <<< Import obiektu DishApi
} from "@/src/api/Api"

// Interfejsy dla danych używanych w UI
interface Category {
    id: string
    name: string
    icon: string
}

interface FeaturedRestaurant {
    id: string
    name: string
    image: ImageSourcePropType
    rating: number
    time: string
    tags: string[]
    promo: string | null
}

interface PopularDish { // Ten interfejs jest używany przez PopularDishItem
    id: string
    name: string
    restaurant: string // Nazwa restauracji
    image: ImageSourcePropType
    price: string // Cena jako string, np. "18 zł"
    rating: number // Rating samego dania
}

interface SpecialOffer {
    id: string
    title: string
    description: string
    code: string
    backgroundColor: string
    textColor: string
}

const { width } = Dimensions.get("window")

const iconMap: Record<string, string> = {
    All: "🍽️",
    Pizza: "🍕",
    Burgers: "🍔",
    Sushi: "🍣",
    Healthy: "🥗",
    Desserts: "🍰",
    Pasta: "🍝",
    Tacos: "🌮",
}

const LOCAL_PLACEHOLDER_IMAGE = require('../../assets/images/placeholder-restaurant.png');

const getRestaurantImageSource = (apiRestaurantData?: ApiRestaurant): ImageSourcePropType => {
    if (apiRestaurantData && apiRestaurantData.imageUrl && apiRestaurantData.imageUrl.startsWith("http")) {
        return { uri: apiRestaurantData.imageUrl };
    }
    return LOCAL_PLACEHOLDER_IMAGE;
};

const getDishImageSource = (apiDishData?: ApiDish): ImageSourcePropType => {
    // Jeśli backend doda pole imageUrl do ApiDish:
    if (apiDishData && apiDishData.imageUrl && apiDishData.imageUrl.startsWith("http")) {
        return { uri: apiDishData.imageUrl };
    }
    return LOCAL_PLACEHOLDER_IMAGE;
};


export default function ModernFoodApp() {
    const router = useRouter()
    const scrollY = useRef(new Animated.Value(0)).current

    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCats, setLoadingCats] = useState(true)

    const [featuredRestaurants, setFeaturedRestaurants] = useState<FeaturedRestaurant[]>([])
    const [loadingRestaurants, setLoadingRestaurants] = useState(true)

    const [popularDishes, setPopularDishes] = useState<PopularDish[]>([]) // <<< Stan dla dań
    const [loadingDishes, setLoadingDishes] = useState(true)           // <<< Stan ładowania dań

    const [activeCategory, setActiveCategory] = useState<string>("All")
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(30)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start()

        StatusBar.setBarStyle("dark-content")
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("transparent")
            StatusBar.setTranslucent(true)
        }

        console.log("useEffect: Attempting to fetch initial data...");

        CategoryApi.list()
            .then((apiCategories: ApiCategory[]) => {
                console.log("useEffect: Successfully fetched categories:", apiCategories);
                const mappedCats: Category[] = apiCategories.map(c => ({
                    id: c.id.toString(),
                    name: c.name,
                    icon: iconMap[c.name] ?? "🍽️",
                }));
                setCategories(mappedCats);
            })
            .catch(err => {
                console.error("useEffect: Błąd pobierania kategorii:", err.message, err.stack, err);
            })
            .finally(() => {
                console.log("useEffect: Finished fetching categories.");
                setLoadingCats(false);
            });

        RestaurantApi.list()
            .then((apiRestaurants: ApiRestaurant[]) => {
                console.log("useEffect: Successfully fetched restaurants from API:", apiRestaurants);
                const mappedRestaurants: FeaturedRestaurant[] = apiRestaurants.map(r => ({
                    id: r.id.toString(),
                    name: r.name,
                    image: getRestaurantImageSource(r),
                    rating: 4.0,
                    time: "20-30 min",
                    tags: ["Placeholder"],
                    promo: null,
                }));
                setFeaturedRestaurants(mappedRestaurants);
            })
            .catch(err => {
                console.error("useEffect: Błąd pobierania polecanych restauracji:", err.message, err.stack, err);
            })
            .finally(() => {
                console.log("useEffect: Finished fetching restaurants.");
                setLoadingRestaurants(false);
            });

        DishApi.list()
            .then((apiDishes: ApiDish[]) => {
                console.log("useEffect: Successfully fetched popular dishes from API:", apiDishes);
                const mappedDishes: PopularDish[] = apiDishes.map(d => {
                    const formattedPrice = `${d.price.toFixed(2)} zł`;
                    const restaurantName = d.restaurant?.name || "Brak restauracji";


                    let productRating = 0;
                    if (d.reviews && d.reviews.length > 0) {
                        const sum = d.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
                        productRating = sum / d.reviews.length;
                    }

                    return {
                        id: d.id.toString(),
                        name: d.name,
                        restaurant: restaurantName,
                        image: getDishImageSource(d),
                        price: formattedPrice,
                        rating: parseFloat(productRating.toFixed(1)) || 0,
                    };
                });
                setPopularDishes(mappedDishes);
            })
            .catch(err => {
                console.error("useEffect: Błąd pobierania popularnych dań:", err.message, err.stack, err);
            })
            .finally(() => {
                console.log("useEffect: Finished fetching popular dishes.");
                setLoadingDishes(false);
            });

    }, [fadeAnim, slideAnim])

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100, 200],
        outputRange: [0, 0.8, 1],
        extrapolate: "clamp",
    })

    const specialOffers: SpecialOffer[] = [
        { id: "1", title: "30% zniżki", description: "Na pierwsze zamówienie", code: "WELCOME30", backgroundColor: COLORS.secondary, textColor: "#333" },
        { id: "2", title: "Darmowa dostawa", description: "Przy zamówieniu powyżej 50 zł", code: "FREEDEL", backgroundColor: COLORS.primary, textColor: "#333" },
    ]

    const renderCategoryItem: ListRenderItem<Category> = ({ item }) => (
        <CategoryItem item={item} activeCategory={activeCategory} onPress={setActiveCategory} />
    )
    const renderRestaurantItem: ListRenderItem<FeaturedRestaurant> = ({ item }) => (
        <FeaturedRestaurantItem item={item} />
    )
    const renderDishItem: ListRenderItem<PopularDish> = ({ item }) => (
        <PopularDishItem item={item} />
    )
    const renderOfferItem: ListRenderItem<SpecialOffer> = ({ item }) => (
        <SpecialOfferItem item={item} />
    )

    const renderListStatus = (loading: boolean, dataLength: number, loadingText: string, emptyText: string) => {
        if (loading) {
            return (
                <View style={{ padding: 24, alignItems: "center", justifyContent: "center", height: 100 }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 8, color: COLORS.textSecondary }}>{loadingText}</Text>
                </View>
            );
        }
        if (dataLength === 0) {
            return (
                <Text style={{ paddingHorizontal: 24, paddingVertical: 16, textAlign: "center", color: COLORS.textSecondary }}>
                    {emptyText}
                </Text>
            );
        }
        return null;
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Animated.View
                style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: Platform.OS === "ios" ? 90 : 70,
                    paddingTop: Platform.OS === "ios" ? 40 : 30,
                    backgroundColor: COLORS.cardBackground,
                    zIndex: 1000, opacity: headerOpacity,
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingHorizontal: 20,
                    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
                        marginRight: 8,
                    }}>
                        <ShoppingBag size={20} color={COLORS.accent} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.textPrimary }}>
                        FoodApp
                    </Text>
                </View>
                <TouchableOpacity>
                    <Bell size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View style={{
                    paddingTop: Platform.OS === "ios" ? 60 : 40,
                    paddingHorizontal: 24, marginBottom: 24,
                }}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                            <MapPin size={18} color={COLORS.accent} />
                            <Text style={{
                                fontSize: 16, fontWeight: "500",
                                color: COLORS.textPrimary, marginLeft: 6, marginRight: 4,
                            }}>
                                Adres użytkownika
                            </Text>
                            <ChevronRight size={16} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        <Text style={{
                            fontSize: 28, fontWeight: "700",
                            color: COLORS.textPrimary, marginBottom: 24,
                        }}>
                            Pojawił się głód?
                        </Text>

                        <View style={{
                            flexDirection: "row", alignItems: "center",
                            backgroundColor: COLORS.cardBackground,
                            borderRadius: 16,
                            paddingHorizontal: 16, paddingVertical: 12,
                            shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
                        }}>
                            <Search size={20} color={COLORS.textSecondary} />
                            <TextInput
                                placeholder="Szukaj restauracji lub dania..."
                                placeholderTextColor={COLORS.textLight}
                                style={{ flex: 1, marginLeft: 12, fontSize: 15, color: COLORS.textPrimary }}
                            />
                            <TouchableOpacity style={{
                                width: 36, height: 36, borderRadius: 12,
                                backgroundColor: COLORS.background,
                                justifyContent: "center", alignItems: "center",
                            }}>
                                <ChevronRight size={18} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>

                <View style={{ marginBottom: 32 }}>
                    <SectionHeader title="Kategorie" />
                    {renderListStatus(loadingCats, categories.length, "Ładowanie kategorii…", "Nie znaleziono kategorii.")}
                    {!loadingCats && categories.length > 0 && (
                        <FlatList
                            data={categories}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
                        />
                    )}
                </View>

                <View style={{ marginBottom: 32 }}>
                    <SectionHeader title="Promocje" />
                    <FlatList
                        data={specialOffers}
                        renderItem={renderOfferItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
                    />
                </View>

                <View style={{ marginBottom: 32 }}>
                    <SectionHeader title="Polecane restauracje" />
                    {renderListStatus(loadingRestaurants, featuredRestaurants.length, "Ładowanie restauracji…", "Nie znaleziono polecanych restauracji.")}
                    {!loadingRestaurants && featuredRestaurants.length > 0 && (
                        <FlatList
                            data={featuredRestaurants}
                            renderItem={renderRestaurantItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
                            snapToInterval={width * 0.7 + 16}
                            decelerationRate="fast"
                        />
                    )}
                </View>

                <View style={{ marginBottom: 32 }}>
                    <SectionHeader title="Popularne dania" />
                    {renderListStatus(loadingDishes, popularDishes.length, "Ładowanie dań…", "Nie znaleziono popularnych dań.")}
                    {!loadingDishes && popularDishes.length > 0 && (
                        <FlatList
                            data={popularDishes}
                            renderItem={renderDishItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
                        />
                    )}
                </View>

                <View style={{
                    marginHorizontal: 24, marginBottom: 40,
                    padding: 24, borderRadius: 24,
                    backgroundColor: COLORS.cardBackground,
                    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
                }}>
                    <Text style={{
                        fontSize: 20, fontWeight: "700",
                        color: COLORS.textPrimary, marginBottom: 12,
                        textAlign: "center",
                    }}>
                        Gotowy, by zamówić?
                    </Text>
                    <Text style={{
                        color: COLORS.textSecondary,
                        marginBottom: 24, lineHeight: 22,
                        textAlign: "center",
                    }}>
                        Dołącz do tysięcy zadowolonych klientów i zamawiaj swoje ulubione
                        jedzenie już teraz
                    </Text>
                    <TouchableOpacity
                        style={{
                            backgroundColor: COLORS.accent,
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            shadowColor: COLORS.accent,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                        onPress={() => router.push("/(tabs)/menu")}
                    >
                        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16, marginRight: 8 }}>
                            Przejdź do menu
                        </Text>
                        <ArrowRight size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>

            <BottomNavigation />
        </View>
    )
}
