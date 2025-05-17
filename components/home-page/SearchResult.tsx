// components/home-page/SearchResults.tsx
"use client"

import React from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    Animated,
    ScrollView,
    Platform, ActivityIndicator,
} from "react-native"
import {
    MapPin,
    Search,
    X,
    FilterIcon,
    SlidersHorizontal,
    Star,
} from "lucide-react-native"
import { COLORS } from "@/components/home-page/constants"

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

interface SearchResultsProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    loadingAddr: boolean
    addressLabel: string
    fadeAnim: Animated.Value
    slideAnim: Animated.Value
    scrollY: Animated.Value
    filteredItems: {
        restaurants: Restaurant[]
        products: Product[]
    }
    setShowFilterSheet: (show: boolean) => void
    sortBy: string
    SORT_OPTIONS: Record<string, string>
    errorData: string | null
    router: any
}

export const SearchResults: React.FC<SearchResultsProps> = ({
                                                                searchTerm,
                                                                setSearchTerm,
                                                                loadingAddr,
                                                                addressLabel,
                                                                fadeAnim,
                                                                slideAnim,
                                                                scrollY,
                                                                filteredItems,
                                                                setShowFilterSheet,
                                                                sortBy,
                                                                SORT_OPTIONS,
                                                                errorData,
                                                                router,
                                                            }) => {
    // Item renderers
    const renderRestaurantSearchResult = ({ item }: { item: Restaurant }) => (
        <TouchableOpacity
            style={{
                flexDirection: "row",
                backgroundColor: COLORS.cardBackground,
                borderRadius: 12,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                overflow: "hidden",
            }}
            onPress={() => router.push(`/restaurant/${item.id}`)}
        >
            <View style={{ width: 80, height: 80, backgroundColor: "#f0f0f0" }}>
                <Image
                    source={{ uri: `https://picsum.photos/80/80?random=${item.id}` }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                />
            </View>
            <View style={{ flex: 1, padding: 12, justifyContent: "center" }}>
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: COLORS.textPrimary,
                        marginBottom: 4,
                    }}
                >
                    {item.name}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        color: COLORS.textSecondary,
                        marginBottom: 6,
                    }}
                >
                    {item.cuisine}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Star size={14} color="#FFD700" />
                    <Text style={{ fontSize: 13, fontWeight: "bold", marginLeft: 4 }}>
                        {item.rating}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )

    const renderProductSearchResult = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={{
                flexDirection: "row",
                backgroundColor: COLORS.cardBackground,
                borderRadius: 12,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                overflow: "hidden",
            }}
            onPress={() => console.log(`Navigate to product ${item.id}`)}
        >
            <View style={{ width: 80, height: 80, backgroundColor: "#f0f0f0" }}>
                <Image
                    source={{ uri: `https://picsum.photos/80/80?random=${item.id + 10}` }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                />
            </View>
            <View style={{ flex: 1, padding: 12, justifyContent: "center" }}>
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: COLORS.textPrimary,
                        marginBottom: 4,
                    }}
                >
                    {item.name}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        color: COLORS.textSecondary,
                        marginBottom: 6,
                    }}
                >
                    {item.restaurant}
                </Text>
                <Text
                    style={{ fontSize: 14, fontWeight: "700", color: COLORS.primary }}
                >
                    {item.price} zł
                </Text>
            </View>
        </TouchableOpacity>
    )

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            contentContainerStyle={{
                paddingTop: Platform.OS === "ios" ? 100 : 80,
                paddingBottom: 100,
            }}
        >
            {/* Hero Section with Search */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    marginHorizontal: 20,
                    marginBottom: 25,
                    marginTop: 10,
                }}
            >
                <View
                    style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
                >
                    <MapPin size={16} color={COLORS.primary} />
                    <Text
                        style={{ fontSize: 14, color: COLORS.textSecondary, marginLeft: 6 }}
                    >
                        Dostawa do
                    </Text>

                    {loadingAddr ? (
                        <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                            style={{ marginLeft: 6 }}
                        />
                    ) : (
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: COLORS.textPrimary,
                                marginLeft: 4,
                            }}
                        >
                            {addressLabel}
                        </Text>
                    )}
                </View>

                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: "800",
                        color: COLORS.textPrimary,
                        marginBottom: 20,
                    }}
                >
                    Czego dziś szukasz?
                </Text>

                {/* Search Bar */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.05)",
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 5,
                    }}
                >
                    <Search size={20} color={COLORS.textSecondary} />
                    <TextInput
                        placeholder="Szukaj dań, restauracji..."
                        placeholderTextColor={COLORS.textSecondary}
                        style={{
                            flex: 1,
                            marginLeft: 10,
                            color: COLORS.textPrimary,
                            fontSize: 15,
                        }}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm ? (
                        <TouchableOpacity
                            onPress={() => setSearchTerm("")}
                            style={{ padding: 4 }}
                        >
                            <X size={18} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </Animated.View>

            {/* Filter Buttons */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 20,
                    marginTop: 5,
                    marginBottom: 15,
                }}
            >
                <TouchableOpacity
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.cardBackground,
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        marginRight: 10,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 2,
                    }}
                    onPress={() => setShowFilterSheet(true)}
                >
                    <FilterIcon size={16} color={COLORS.textSecondary} />
                    <Text
                        style={{ marginLeft: 6, color: COLORS.textSecondary, fontSize: 14 }}
                    >
                        Filtry
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.cardBackground,
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 2,
                    }}
                    onPress={() => setShowFilterSheet(true)}
                >
                    <SlidersHorizontal size={16} color={COLORS.textSecondary} />
                    <Text
                        style={{ marginLeft: 6, color: COLORS.textSecondary, fontSize: 14 }}
                    >
                        Sortuj: {SORT_OPTIONS[sortBy]}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Error message */}
            {errorData && (
                <View
                    style={{
                        margin: 20,
                        padding: 15,
                        backgroundColor: "#ffeeee",
                        borderRadius: 12,
                    }}
                >
                    <Text style={{ color: "#cc0000", textAlign: "center" }}>
                        {errorData}
                    </Text>
                </View>
            )}

            {/* Search Results */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    marginHorizontal: 20,
                    marginBottom: 20,
                }}
            >
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: COLORS.textPrimary,
                        marginBottom: 15,
                    }}
                >
                    Wyniki wyszukiwania dla "{searchTerm}"
                </Text>

                {filteredItems.restaurants.length === 0 &&
                filteredItems.products.length === 0 ? (
                    <View
                        style={{
                            alignItems: "center",
                            padding: 30,
                            backgroundColor: COLORS.cardBackground,
                            borderRadius: 12,
                            marginBottom: 20,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 15,
                                color: COLORS.textSecondary,
                                textAlign: "center",
                            }}
                        >
                            Nie znaleziono wyników dla "{searchTerm}"
                        </Text>
                    </View>
                ) : (
                    <>
                        {filteredItems.restaurants.length > 0 && (
                            <View style={{ marginBottom: 20 }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: "600",
                                        color: COLORS.textSecondary,
                                        marginBottom: 10,
                                    }}
                                >
                                    Restauracje ({filteredItems.restaurants.length})
                                </Text>
                                <FlatList
                                    data={filteredItems.restaurants}
                                    renderItem={renderRestaurantSearchResult}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                />
                            </View>
                        )}

                        {filteredItems.products.length > 0 && (
                            <View>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: "600",
                                        color: COLORS.textSecondary,
                                        marginBottom: 10,
                                    }}
                                >
                                    Dania ({filteredItems.products.length})
                                </Text>
                                <FlatList
                                    data={filteredItems.products}
                                    renderItem={renderProductSearchResult}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                />
                            </View>
                        )}
                    </>
                )}
            </Animated.View>
        </ScrollView>
    )
}
