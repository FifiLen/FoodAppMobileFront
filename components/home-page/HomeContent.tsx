// components/home-page/HomeContent.tsx
"use client"

import React from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Animated,
    ActivityIndicator,
    Platform,
} from "react-native"
import { MapPin, Search, X, Percent } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

import { COLORS, SPACING } from "@/components/home-page/constants"
import { CategoriesSection } from "@/components/home-page/CategoriesSection"
import { ProductsSection } from "@/components/home-page/ProductSection"
import { FeaturedRestaurantsSection } from "@/components/home-page/FeaturedRestaurantsSection"
import { TopRatedRestaurantsSection } from "./TopRatedRestaurantsSection"

interface HomeContentProps {
    scrollY: Animated.Value
    fadeAnim: Animated.Value
    slideAnim: Animated.Value
    loadingAddr: boolean
    addressLabel: string
    setSearchTerm: (term: string) => void
    searchTerm: string
    handleBannerPress: () => void
    activeCategoryId: string | null
    handleCategorySelect: (id: string) => void
    handleViewAllRestaurants: () => void
    errorData: string | null
}

export const HomeContent: React.FC<HomeContentProps> = ({
                                                            scrollY,
                                                            fadeAnim,
                                                            slideAnim,
                                                            loadingAddr,
                                                            addressLabel,
                                                            setSearchTerm,
                                                            searchTerm,
                                                            handleBannerPress,
                                                            activeCategoryId,
                                                            handleCategorySelect,
                                                            handleViewAllRestaurants,
                                                            errorData,
                                                        }) => {
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
            {/* Hero Section */}
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

            {/* Promotional Banner */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    marginHorizontal: 20,
                    marginBottom: 25,
                }}
            >
                <TouchableOpacity onPress={handleBannerPress}>
                    <LinearGradient
                        colors={[COLORS.primary, "#ff7e5f"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            borderRadius: 16,
                            padding: 16,
                            shadowColor: COLORS.primary,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                            elevation: 6,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginBottom: 8,
                                    }}
                                >
                                    <Percent size={18} color="#fff" />
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontWeight: "700",
                                            marginLeft: 6,
                                            fontSize: 16,
                                        }}
                                    >
                                        PROMOCJA DNIA
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "800",
                                        fontSize: 20,
                                        marginBottom: 6,
                                    }}
                                >
                                    -30% na pierwsze zamówienie
                                </Text>
                                <Text
                                    style={{
                                        color: "rgba(255,255,255,0.8)",
                                        fontSize: 14,
                                        marginBottom: 12,
                                    }}
                                >
                                    Użyj kodu: WELCOME30
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: "#fff",
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                        borderRadius: 8,
                                        alignSelf: "flex-start",
                                    }}
                                >
                                    <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                                        Zamów teraz
                                    </Text>
                                </View>
                            </View>
                            <View style={{ width: 80, height: 80, marginLeft: 10 }}>
                                <Image
                                    source={{
                                        uri: "https://cdn-icons-png.flaticon.com/512/5787/5787908.png",
                                    }}
                                    style={{ width: 80, height: 80 }}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            {/* Categories */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }}
            >
                <CategoriesSection
                    activeCategoryId={activeCategoryId}
                    onCategorySelect={handleCategorySelect}
                />
            </Animated.View>

            {/* Products */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    marginTop: 10,
                    marginBottom: 20,
                }}
            >
                <ProductsSection selectedCategoryId={activeCategoryId} />
            </Animated.View>


            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    marginTop: 5,
                }}
            >
                <FeaturedRestaurantsSection
                    title="Popularne Restauracje"
                    maxItems={5}
                    horizontal={true}
                    onViewAllPress={handleViewAllRestaurants}
                />
            </Animated.View>

            <Animated.View
                style={{
                    opacity: fadeAnim, // Assuming you have these animations
                    transform: [{ translateY: slideAnim }],
                    marginTop: SPACING.md, // Use constants
                    marginBottom: SPACING.md,
                  }}
            >
                <TopRatedRestaurantsSection
                    title="Najlepiej Oceniane"
                    count={5} // Number of top-rated to show
                    showViewAllButton={true}
                    // itemStyle is handled within TopRatedRestaurantsSection for its specific layout
                 />
            </Animated.View>
        </ScrollView>
    )
}
