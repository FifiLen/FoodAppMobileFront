"use client"

import React, { useState, useRef, useEffect } from "react"
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    Animated,
    Platform,
    StatusBar,
    TextInput,
    FlatList,
    ScrollView,
    ListRenderItem,
} from "react-native"
import { useRouter } from "expo-router"
import {
    Search,
    ArrowLeft,
    Star,
    Clock,
    Filter,
    ChevronDown,
    Heart,
    ShoppingBag,
    Home,
    User,
    Bell,
    MapPin,
    X,
    Check,
} from "lucide-react-native"

const { width, height } = Dimensions.get("window")

const COLORS = {
    primary: "#A3D69D",
    secondary: "#FFE566",
    accent: "#5F7161",
    background: "#F8F8F8",
    cardBackground: "#FFFFFF",
    textPrimary: "#333333",
    textSecondary: "#666666",
    textLight: "#999999",
    border: "#EEEEEE",
}

interface Category {
    id: string
    name: string
    icon: string
}

interface DietaryOption {
    id: string
    name: string
}

interface Restaurant {
    id: string
    name: string
    image: string
    rating: number
    time: string
    tags: string[]
    promo: string | null
    priceRange: "$" | "$$" | "$$$"
    distance: string
}

interface Product {
    id: string
    name: string
    restaurant: string
    image: string
    price: string
    rating: number
    category: string
    dietary: string[]
}

type SortByOption = "recommended" | "rating" | "delivery_time" | "distance"
type PriceRangeOption = "all" | "$" | "$$" | "$$$"

export default function MenuTabs() {
    const router = useRouter()


    const [activeTab, setActiveTab] = useState<"restaurants" | "products">("restaurants")
    const [activeCategory, setActiveCategory] = useState<string>("All")
    const [showFilters, setShowFilters] = useState<boolean>(false)
    const [sortBy, setSortBy] = useState<SortByOption>("recommended")
    const [priceRange, setPriceRange] = useState<PriceRangeOption>("all")
    const [dietaryFilters, setDietaryFilters] = useState<string[]>([])

    const filterSheetAnim = useRef(new Animated.Value(height)).current

    useEffect(() => {
        StatusBar.setBarStyle("dark-content")
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("transparent")
            StatusBar.setTranslucent(true)
        }
    }, [])

    useEffect(() => {
        if (showFilters) {
            Animated.spring(filterSheetAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 0,
            }).start()
        } else {
            Animated.spring(filterSheetAnim, {
                toValue: height,
                useNativeDriver: true,
                bounciness: 0,
            }).start()
        }
    }, [showFilters, filterSheetAnim])

    const categories: Category[] = [
        { id: "1", name: "All", icon: "🍽️" },
        { id: "2", name: "Pizza", icon: "🍕" },
        { id: "3", name: "Burgers", icon: "🍔" },
        { id: "4", name: "Sushi", icon: "🍣" },
        { id: "5", name: "Healthy", icon: "🥗" },
        { id: "6", name: "Desserts", icon: "🍰" },
    ]

    const dietaryOptions: DietaryOption[] = [
        { id: "1", name: "Vegetarian" },
        { id: "2", name: "Vegan" },
        { id: "3", name: "Gluten-free" },
        { id: "4", name: "Dairy-free" },
        { id: "5", name: "Nut-free" },
    ]

    const restaurants: Restaurant[] = [
        {
            id: "1",
            name: "Green Garden",
            image: "/vibrant-grain-bowl.png",
            rating: 4.8,
            time: "20-30 min",
            tags: ["Healthy", "Salads", "Bowls"],
            promo: "Free delivery",
            priceRange: "$$",
            distance: "1.2 km",
        },
        {
            id: "2",
            name: "Burger House",
            image: "/juicy-gourmet-burger.png",
            rating: 4.6,
            time: "15-25 min",
            tags: ["Burgers", "American", "Fast Food"],
            promo: "20% off",
            priceRange: "$$",
            distance: "0.8 km",
        },
        {
            id: "3",
            name: "Sushi Master",
            image: "/exquisite-sushi-selection.png",
            rating: 4.9,
            time: "25-35 min",
            tags: ["Japanese", "Sushi", "Asian"],
            promo: null,
            priceRange: "$$$",
            distance: "2.5 km",
        },
        {
            id: "4",
            name: "Pizza Palace",
            image: "/wood-fired-pizza-night.png",
            rating: 4.5,
            time: "20-30 min",
            tags: ["Pizza", "Italian", "Pasta"],
            promo: "Buy 1 Get 1",
            priceRange: "$$",
            distance: "1.5 km",
        },
        {
            id: "5",
            name: "Thai Delight",
            image: "/bustling-thai-eatery.png",
            rating: 4.7,
            time: "25-40 min",
            tags: ["Thai", "Asian", "Spicy"],
            promo: null,
            priceRange: "$$",
            distance: "3.2 km",
        },
        {
            id: "6",
            name: "Sweet Treats",
            image: "/cozy-dessert-corner.png",
            rating: 4.4,
            time: "15-25 min",
            tags: ["Desserts", "Bakery", "Coffee"],
            promo: "10% off",
            priceRange: "$",
            distance: "1.0 km",
        },
    ]

    const products: Product[] = [
        {
            id: "1",
            name: "Avocado Toast",
            restaurant: "Green Garden",
            image: "/hearty-avocado-toast.png",
            price: "18 zł",
            rating: 4.7,
            category: "Healthy",
            dietary: ["Vegetarian"],
        },
        {
            id: "2",
            name: "Classic Burger",
            restaurant: "Burger House",
            image: "/juicy-beef-classic.png",
            price: "24 zł",
            rating: 4.5,
            category: "Burgers",
            dietary: [],
        },
        {
            id: "3",
            name: "California Roll",
            restaurant: "Sushi Master",
            image: "/classic-california-roll.png",
            price: "32 zł",
            rating: 4.8,
            category: "Sushi",
            dietary: ["Gluten-free"],
        },
        {
            id: "4",
            name: "Margherita Pizza",
            restaurant: "Pizza Palace",
            image: "/classic-margherita.png",
            price: "29 zł",
            rating: 4.6,
            category: "Pizza",
            dietary: ["Vegetarian"],
        },
        {
            id: "5",
            name: "Pad Thai",
            restaurant: "Thai Delight",
            image: "/placeholder.svg?height=150&width=150&query=pad thai noodles",
            price: "28 zł",
            rating: 4.7,
            category: "Thai",
            dietary: ["Gluten-free", "Nut-free"],
        },
        {
            id: "6",
            name: "Chocolate Lava Cake",
            restaurant: "Sweet Treats",
            image: "/placeholder.svg?height=150&width=150&query=chocolate lava cake",
            price: "16 zł",
            rating: 4.9,
            category: "Desserts",
            dietary: ["Vegetarian"],
        },
        {
            id: "7",
            name: "Quinoa Bowl",
            restaurant: "Green Garden",
            image: "/placeholder.svg?height=150&width=150&query=quinoa vegetable bowl",
            price: "22 zł",
            rating: 4.6,
            category: "Healthy",
            dietary: ["Vegan", "Gluten-free"],
        },
        {
            id: "8",
            name: "Spicy Tuna Roll",
            restaurant: "Sushi Master",
            image: "/placeholder.svg?height=150&width=150&query=spicy tuna roll",
            price: "36 zł",
            rating: 4.8,
            category: "Sushi",
            dietary: ["Gluten-free"],
        },
    ]

    const toggleDietaryFilter = (filter: string) => {
        if (dietaryFilters.includes(filter)) {
            setDietaryFilters((prev) => prev.filter((item) => item !== filter))
        } else {
            setDietaryFilters((prev) => [...prev, filter])
        }
    }

    const renderCategoryItem: ListRenderItem<Category> = ({ item }) => (
        <TouchableOpacity
            style={{
                marginRight: 12,
                alignItems: "center",
            }}
            onPress={() => setActiveCategory(item.name)}
        >
            <View
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    backgroundColor: activeCategory === item.name ? COLORS.primary : COLORS.cardBackground,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                }}
            >
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            </View>
            <Text
                style={{
                    fontSize: 12,
                    fontWeight: activeCategory === item.name ? "600" : "400",
                    color: activeCategory === item.name ? COLORS.accent : COLORS.textSecondary,
                }}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    )

    const renderRestaurantItem: ListRenderItem<Restaurant> = ({ item }) => (
        <TouchableOpacity
            style={{
                marginBottom: 16,
                borderRadius: 24,
                backgroundColor: COLORS.cardBackground,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
                overflow: "hidden",
            }}
        >
            <View style={{ position: "relative" }}>
                <Image
                    source={{ uri: item.image }}
                    style={{ width: "100%", height: 180, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                    resizeMode="cover"
                />

                {item.promo && (
                    <View
                        style={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                            backgroundColor: COLORS.secondary,
                        }}
                    >
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#333" }}>{item.promo}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Heart size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.textPrimary }}>{item.name}</Text>
                    <View
                        style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            backgroundColor: COLORS.background,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{item.priceRange}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
                    {item.tags.map((tag, index) => (
                        <Text
                            key={`${tag}-${index}`}
                            style={{
                                fontSize: 12,
                                color: COLORS.textSecondary,
                                marginRight: 8,
                            }}
                        >
                            {tag}
                            {index < item.tags.length - 1 ? " • " : ""}
                        </Text>
                    ))}
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Star size={16} color="#FFB800" fill="#FFB800" />
                        <Text style={{ marginLeft: 4, fontWeight: "500", color: COLORS.textPrimary }}>{item.rating}</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Clock size={14} color={COLORS.textSecondary} />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: COLORS.textSecondary, marginRight: 12 }}>
                            {item.time}
                        </Text>

                        <MapPin size={14} color={COLORS.textSecondary} />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: COLORS.textSecondary }}>{item.distance}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )

    const renderProductItem: ListRenderItem<Product> = ({ item }) => (
        <TouchableOpacity
            style={{
                flex: 1,
                margin: 8,
                borderRadius: 20,
                backgroundColor: COLORS.cardBackground,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
                overflow: "hidden",
            }}
        >
            <Image
                source={{ uri: item.image }}
                style={{ width: "100%", height: 140, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                resizeMode="cover"
            />

            <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 2 }} numberOfLines={1}>
                    {item.name}
                </Text>

                <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }} numberOfLines={1}>
                    {item.restaurant}
                </Text>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "600", color: COLORS.accent }}>{item.price}</Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Star size={12} color="#FFB800" fill="#FFB800" />
                        <Text style={{ marginLeft: 2, fontSize: 12, color: COLORS.textSecondary }}>{item.rating}</Text>
                    </View>
                </View>

                {item.dietary.length > 0 && (
                    <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                        {item.dietary.map((diet, index) => (
                            <View
                                key={`${diet}-${index}`}
                                style={{
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    backgroundColor: COLORS.primary + "30",
                                    borderRadius: 4,
                                    marginRight: 4,
                                    marginBottom: 4,
                                }}
                            >
                                <Text style={{ fontSize: 10, color: COLORS.accent }}>{diet}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )

    const filteredRestaurants = activeCategory === "All"
        ? restaurants
        : restaurants.filter((restaurant) => restaurant.tags.includes(activeCategory))

    const filteredProducts = activeCategory === "All"
        ? products
        : products.filter(
            (product) => product.category === activeCategory || product.dietary.includes(activeCategory)
        )


    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Nagłówek */}
            <View
                style={{
                    paddingTop: Platform.OS === "ios" ? 60 : 40,
                    paddingBottom: 16,
                    paddingHorizontal: 20,
                    backgroundColor: COLORS.cardBackground,
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 15,
                    elevation: 5,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>

                    <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.textPrimary }}>Menu</Text>

                    <TouchableOpacity>
                        <Bell size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.background,
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        marginBottom: 16,
                    }}
                >
                    <Search size={20} color={COLORS.textSecondary} />
                    <TextInput
                        placeholder="Szukaj restauracji lub dania..."
                        placeholderTextColor={COLORS.textLight}
                        style={{ flex: 1, marginLeft: 12, fontSize: 15, color: COLORS.textPrimary }}
                    />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderBottomWidth: 2,
                            borderBottomColor: activeTab === "restaurants" ? COLORS.accent : "transparent",
                            alignItems: "center",
                        }}
                        onPress={() => setActiveTab("restaurants")}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: activeTab === "restaurants" ? "600" : "400",
                                color: activeTab === "restaurants" ? COLORS.accent : COLORS.textSecondary,
                            }}
                        >
                            Restauracje
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderBottomWidth: 2,
                            borderBottomColor: activeTab === "products" ? COLORS.accent : "transparent",
                            alignItems: "center",
                        }}
                        onPress={() => setActiveTab("products")}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: activeTab === "products" ? "600" : "400",
                                color: activeTab === "products" ? COLORS.accent : COLORS.textSecondary,
                            }}
                        >
                            Produkty
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    backgroundColor: COLORS.background,
                }}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 16,
                            backgroundColor: COLORS.cardBackground,
                            marginRight: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 5,
                            elevation: 2,
                        }}
                        onPress={() => setShowFilters(true)}
                    >
                        <Filter size={16} color={COLORS.textSecondary} />
                        <Text style={{ marginLeft: 6, color: COLORS.textSecondary }}>Filtry</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 16,
                            backgroundColor: COLORS.cardBackground,
                            marginRight: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 5,
                            elevation: 2,
                        }}
                    >
                        <Text style={{ marginRight: 6, color: COLORS.textSecondary }}>Sortuj</Text>
                        <ChevronDown size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    {dietaryFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 16,
                                backgroundColor: COLORS.primary,
                                marginRight: 12,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 5,
                                elevation: 2,
                            }}
                            onPress={() => toggleDietaryFilter(filter)}
                        >
                            <Text style={{ marginRight: 6, color: COLORS.accent, fontWeight: "500" }}>{filter}</Text>
                            <X size={14} color={COLORS.accent} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>


            <View style={{ marginVertical: 12 }}>
                <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20, paddingRight: 12 }}
                />
            </View>


            {activeTab === "restaurants" ? (
                <FlatList
                    data={filteredRestaurants}
                    renderItem={renderRestaurantItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}


            <Animated.View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: COLORS.cardBackground,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    padding: 20,
                    paddingBottom: Platform.OS === "ios" ? 40 : 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 10,
                    transform: [{ translateY: filterSheetAnim }],
                    maxHeight: height * 0.8,
                }}
            >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.textPrimary }}>Filtry</Text>
                    <TouchableOpacity onPress={() => setShowFilters(false)}>
                        <X size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 12 }}>
                            Sortuj według
                        </Text>
                        {(["recommended", "rating", "delivery_time", "distance"] as SortByOption[]).map((option) => {
                            const labels: Record<SortByOption, string> = {
                                recommended: "Polecane",
                                rating: "Ocena",
                                delivery_time: "Czas dostawy",
                                distance: "Odległość",
                            }

                            return (
                                <TouchableOpacity
                                    key={option}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        paddingVertical: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: COLORS.border,
                                    }}
                                    onPress={() => setSortBy(option)}
                                >
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            color: sortBy === option ? COLORS.accent : COLORS.textPrimary,
                                            fontWeight: sortBy === option ? "500" : "400",
                                        }}
                                    >
                                        {labels[option]}
                                    </Text>
                                    {sortBy === option && <Check size={18} color={COLORS.accent} />}
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 12 }}>
                            Przedział cenowy
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            {(["all", "$", "$$", "$$$"] as PriceRangeOption[]).map((option) => {
                                const labels: Record<PriceRangeOption, string> = {
                                    all: "Wszystkie",
                                    $: "Niskie",
                                    $$: "Średnie",
                                    $$$: "Wysokie",
                                }

                                return (
                                    <TouchableOpacity
                                        key={option}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 16,
                                            backgroundColor: priceRange === option ? COLORS.primary : COLORS.background,
                                            marginRight: 8,
                                            marginBottom: 8,
                                        }}
                                        onPress={() => setPriceRange(option)}
                                    >
                                        <Text
                                            style={{
                                                color: priceRange === option ? COLORS.accent : COLORS.textSecondary,
                                                fontWeight: priceRange === option ? "500" : "400",
                                            }}
                                        >
                                            {labels[option]}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 12 }}>
                            Preferencje dietetyczne
                        </Text>
                        {dietaryOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingVertical: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: COLORS.border,
                                }}
                                onPress={() => toggleDietaryFilter(option.name)}
                            >
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: dietaryFilters.includes(option.name) ? COLORS.accent : COLORS.textPrimary,
                                        fontWeight: dietaryFilters.includes(option.name) ? "500" : "400",
                                    }}
                                >
                                    {option.name}
                                </Text>
                                {dietaryFilters.includes(option.name) && <Check size={18} color={COLORS.accent} />}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: COLORS.accent,
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 12,
                        }}
                        onPress={() => setShowFilters(false)}
                    >
                        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Zastosuj filtry</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 8,
                        }}
                        onPress={() => {
                            setSortBy("recommended")
                            setPriceRange("all")
                            setDietaryFilters([])
                        }}
                    >
                        <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>Resetuj filtry</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>

            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 70,
                    backgroundColor: COLORS.cardBackground,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                    paddingBottom: Platform.OS === "ios" ? 20 : 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 10,
                }}
            >
                <TouchableOpacity style={{ alignItems: "center" }} onPress={() => router.push("/")}>
                    <Home size={24} color={COLORS.textSecondary} />
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: "center" }}>
                    <Search size={24} color={COLORS.accent} />
                    <Text style={{ fontSize: 12, color: COLORS.accent, marginTop: 4, fontWeight: "500" }}>Menu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: COLORS.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        bottom: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <ShoppingBag size={24} color={COLORS.accent} />
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: "center" }}>
                    <Heart size={24} color={COLORS.textSecondary} />
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>Favorites</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: "center" }}>
                    <User size={24} color={COLORS.textSecondary} />
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
