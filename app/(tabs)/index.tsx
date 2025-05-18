"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
    View,
    Text as RNText,
    Animated,
    Platform,
    StatusBar,
    Dimensions,
    ActivityIndicator
} from "react-native"
import { useRouter } from "expo-router"

import { COLORS } from "@/components/home-page/constants"
import { useAuth } from "@/context/AuthContext"
import { API_URL } from "@/app/constants"
import { categoryService, restaurantService, favoriteService } from "@/src/api/services"

// Import our new components
// import { AnimatedHeader } from "@/components/home-page/AnimatedHeader"
import { HomeContent } from "@/components/home-page/HomeContent"
import { FilterSheet } from "@/components/home-page/FilterSheet"
import { SearchResults } from "@/components/home-page/SearchResult"

const { height } = Dimensions.get("window")

interface Restaurant {
    id: string
    name: string
    cuisine: string
    rating: number
    isFavorite?: boolean
}

interface Product {
    id: string
    name: string
    restaurant: string
    price: number
}

type SortOption = "recommended" | "rating" | "popularity" | "delivery_time"

const SORT_OPTIONS: Record<SortOption, string> = {
    recommended: "Polecane",
    rating: "Ocena",
    popularity: "Popularność",
    delivery_time: "Czas dostawy",
}

export default function ModernFoodApp() {
    const scrollY = useRef(new Animated.Value(0)).current
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(30)).current
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const router = useRouter()

    // Auth and address
    const { userToken } = useAuth()
    const [loadingAddr, setLoadingAddr] = useState<boolean>(true)
    const [addressLabel, setAddressLabel] = useState<string>("Brak adresu")

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false)
    const [sortBy, setSortBy] = useState<SortOption>("recommended")
    const filterSheetAnim = useRef(new Animated.Value(height)).current

    // Data states
    const [restaurantData, setRestaurantData] = useState<Restaurant[]>([])
    const [productData, setProductData] = useState<Product[]>([])
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true)
    const [errorData, setErrorData] = useState<string | null>(null)

    // Filtered results
    const filteredItems = useMemo(() => {
        let results: { restaurants: Restaurant[]; products: Product[] } = {
            restaurants: [],
            products: [],
        }

        if (searchTerm.trim()) {
            const lowercasedTerm = searchTerm.toLowerCase()

            // Filter restaurants
            results.restaurants = restaurantData.filter(
                (r) =>
                    r.name.toLowerCase().includes(lowercasedTerm) ||
                    r.cuisine.toLowerCase().includes(lowercasedTerm)
            )

            // Filter products
            results.products = productData.filter(
                (p) =>
                    p.name.toLowerCase().includes(lowercasedTerm) ||
                    p.restaurant.toLowerCase().includes(lowercasedTerm)
            )

            // Sort results if needed
            if (sortBy === "rating") {
                results.restaurants = [...results.restaurants].sort(
                    (a, b) => b.rating - a.rating
                )
            }
        } else {
            results.restaurants = restaurantData
            results.products = productData
        }

        return results
    }, [searchTerm, sortBy, restaurantData, productData])

    // Fetch data
    const fetchData = useCallback(async () => {
        setIsLoadingData(true)
        setErrorData(null)

        let userFavoritesData: any[] = []
        if (userToken) {
            try {
                userFavoritesData = await favoriteService.getUserFavorites(userToken)
            } catch (favError) {
                console.error("ModernFoodApp: Error fetching user favorites:", favError)
            }
        }

        try {
            // Get restaurants from API
            const restaurantDtos = await restaurantService.getAll()

            // Map API data
            const mappedRestaurants: Restaurant[] = restaurantDtos.map((dto) => {
                const isFav = userFavoritesData.some(
                    (fav) => fav.restaurantId === dto.id
                )

                return {
                    id: dto.id.toString(),
                    name: dto.name || "Nieznana Restauracja",
                    cuisine: dto.categoryName || "Różne",
                    rating:
                        dto.averageRating ||
                        parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
                    isFavorite: isFav,
                }
            })

            setRestaurantData(mappedRestaurants)
            setProductData([])
        } catch (err) {
            console.error("ModernFoodApp: Error fetching data:", err)
            setErrorData("Nie udało się pobrać danych.")
        } finally {
            setIsLoadingData(false)
        }
    }, [userToken])

    const loadAddress = useCallback(async () => {
        if (!userToken) {
            setLoadingAddr(false)
            return
        }
        try {
            const res = await fetch(`${API_URL}/api/address`, {
                headers: { Authorization: `Bearer ${userToken}` },
            })
            const json = await res.json()
            const list = Array.isArray(json)
                ? json
                : Array.isArray(json?.$values)
                    ? json.$values
                    : json
                        ? [json]
                        : []

            if (list.length > 0) {
                const a = list[0] // pierwszy zapisany adres
                const label = `${a.street ?? ""}${
                    a.apartment ? `/${a.apartment}` : ""
                }, ${a.postalCode ?? ""} ${a.city ?? ""}`.trim()
                setAddressLabel(label || "Brak adresu")
            }
        } catch (e) {
            console.error("[Home] Nie udało się pobrać adresu:", e)
        } finally {
            setLoadingAddr(false)
        }
    }, [userToken])

    useEffect(() => {
        loadAddress()
    }, [loadAddress])

    // Load data on mount
    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        // Animation for initial content fade in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start()

        StatusBar.setBarStyle("dark-content")
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("transparent")
            StatusBar.setTranslucent(true)
        }
    }, [fadeAnim, slideAnim])

    // Filter sheet animation
    useEffect(() => {
        Animated.spring(filterSheetAnim, {
            toValue: showFilterSheet ? 0 : height,
            useNativeDriver: true,
            bounciness: 0,
        }).start()
    }, [showFilterSheet, filterSheetAnim, height])

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100, 200],
        outputRange: [0, 0.8, 1],
        extrapolate: "clamp",
    })

    const handleCategorySelect = (categoryId: string) => {
        console.log("ModernFoodApp: Wybrano kategorię ID:", categoryId)
        setActiveCategoryId((prevId) => (prevId === categoryId ? null : categoryId))
    }

    const handleViewAllRestaurants = () => {
        console.log(
            "ModernFoodApp: Próba nawigacji do listy wszystkich restauracji."
        )
        router.push("/(tabs)/restaurants")
    }

    const handleBannerPress = () => {
        console.log(
            "Promotional banner pressed. Navigating to welcome offer screen."
        )
        router.push("/(tabs)/welcome-offer")
    }

    const resetFilters = () => {
        setSortBy("recommended")
        setShowFilterSheet(false)
    }

    // Loading state
    if (isLoadingData && restaurantData.length === 0 && !searchTerm) {
        return (
            <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
                <ActivityIndicator size="large" color={COLORS.primary} />
                <RNText style={{ marginTop: 10, color: COLORS.textSecondary }}>
                    Ładowanie danych...
                </RNText>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Animated Header */}
            {/*<AnimatedHeader headerOpacity={headerOpacity} />*/}

            {searchTerm.trim() ? (
                <SearchResults
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    loadingAddr={loadingAddr}
                    addressLabel={addressLabel}
                    fadeAnim={fadeAnim}
                    slideAnim={slideAnim}
                    scrollY={scrollY}
                    filteredItems={filteredItems}
                    setShowFilterSheet={setShowFilterSheet}
                    sortBy={sortBy}
                    SORT_OPTIONS={SORT_OPTIONS}
                    errorData={errorData}
                    router={router}
                />
            ) : (
                <HomeContent
                    scrollY={scrollY}
                    fadeAnim={fadeAnim}
                    slideAnim={slideAnim}
                    loadingAddr={loadingAddr}
                    addressLabel={addressLabel}
                    setSearchTerm={setSearchTerm}
                    searchTerm={searchTerm}
                    handleBannerPress={handleBannerPress}
                    activeCategoryId={activeCategoryId}
                    handleCategorySelect={handleCategorySelect}
                    handleViewAllRestaurants={handleViewAllRestaurants}
                    errorData={errorData}
                />
            )}

            <FilterSheet
                showFilterSheet={showFilterSheet}
                setShowFilterSheet={setShowFilterSheet}
                filterSheetAnim={filterSheetAnim}
                sortBy={sortBy}
                setSortBy={setSortBy}
                resetFilters={resetFilters}
                SORT_OPTIONS={SORT_OPTIONS}
                COLORS={COLORS}
            />
        </View>
    )
}
