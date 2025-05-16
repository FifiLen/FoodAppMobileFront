"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, Animated, Platform, StatusBar, ScrollView, Image } from "react-native"
import { ShoppingBag, Bell, MapPin, Search, Clock, Star, Bookmark, TrendingUp, Percent } from "lucide-react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { COLORS } from "@/components/home-page/constants"
import { CategoriesSection } from "@/components/home-page/CategoriesSection"
import { ProductsSection } from "@/components/home-page/ProductSection"
import { FeaturedRestaurantsSection } from "@/components/home-page/FeaturedRestaurantsSection"

export default function ModernFoodApp() {
    const scrollY = useRef(new Animated.Value(0)).current
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(30)).current
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const router = useRouter()

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
    }, [fadeAnim, slideAnim])

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
        console.log("ModernFoodApp: Próba nawigacji do listy wszystkich restauracji.")
        alert("Nawigacja do pełnej listy restauracji (TODO)")
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Enhanced Animated Header */}
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: Platform.OS === "ios" ? 100 : 80,
                    paddingTop: Platform.OS === "ios" ? 45 : 35,
                    backgroundColor: COLORS.cardBackground,
                    zIndex: 1000,
                    opacity: headerOpacity,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 20,
                    elevation: 8,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: COLORS.primary,
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                            shadowColor: COLORS.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <ShoppingBag size={20} color={COLORS.accent} />
                    </View>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: "700",
                            color: COLORS.textPrimary,
                            letterSpacing: 0.5,
                        }}
                    >
                        FoodApp
                    </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: "rgba(0,0,0,0.05)",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                        }}
                    >
                        <Bookmark size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: "rgba(0,0,0,0.05)",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Bell size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Main ScrollView with Enhanced Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
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
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
                        <MapPin size={16} color={COLORS.primary} />
                        <Text
                            style={{
                                fontSize: 14,
                                color: COLORS.textSecondary,
                                marginLeft: 6,
                            }}
                        >
                            Dostawa do
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: COLORS.textPrimary,
                                marginLeft: 4,
                            }}
                        >
                            ul. Warszawska 24
                        </Text>
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

                    <TouchableOpacity
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
                        <Text
                            style={{
                                marginLeft: 10,
                                color: COLORS.textSecondary,
                                fontSize: 15,
                            }}
                        >
                            Szukaj dań, restauracji...
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* NOWE: Promocyjny Banner */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        marginHorizontal: 20,
                        marginBottom: 25,
                    }}
                >
                    <TouchableOpacity>
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
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                                        <Percent size={18} color="#fff" />
                                        <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 6, fontSize: 16 }}>PROMOCJA DNIA</Text>
                                    </View>
                                    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 20, marginBottom: 6 }}>
                                        -30% na pierwsze zamówienie
                                    </Text>
                                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 12 }}>
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
                                        <Text style={{ color: COLORS.primary, fontWeight: "700" }}>Zamów teraz</Text>
                                    </View>
                                </View>
                                <View style={{ width: 80, height: 80, marginLeft: 10 }}>
                                    <Image
                                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/5787/5787908.png" }}
                                        style={{ width: 80, height: 80 }}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Categories Section */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <CategoriesSection activeCategoryId={activeCategoryId} onCategorySelect={handleCategorySelect} />
                </Animated.View>

                {/* Products Section - PRZENIESIONA BEZPOŚREDNIO POD KATEGORIE */}
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

                {/* NOWE: Szybkie Zamówienie Ponownie */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        marginTop: 15,
                        marginBottom: 20,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 20,
                            marginBottom: 15,
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary }}>Zamów ponownie</Text>
                        <TouchableOpacity>
                            <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "600" }}>Zobacz wszystkie</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
                    >
                        {[1, 2, 3].map((item) => (
                            <TouchableOpacity key={item} style={{ marginRight: 15 }}>
                                <View
                                    style={{
                                        width: 200,
                                        borderRadius: 16,
                                        backgroundColor: COLORS.cardBackground,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 3,
                                        overflow: "hidden",
                                    }}
                                >
                                    <View style={{ height: 100, backgroundColor: "#f0f0f0" }}>
                                        <Image
                                            source={{ uri: `https://picsum.photos/200/100?random=${item}` }}
                                            style={{ width: "100%", height: "100%" }}
                                            resizeMode="cover"
                                        />
                                        <View
                                            style={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                backgroundColor: "rgba(255,255,255,0.9)",
                                                borderRadius: 12,
                                                padding: 6,
                                            }}
                                        >
                                            <Clock size={16} color={COLORS.primary} />
                                        </View>
                                    </View>
                                    <View style={{ padding: 12 }}>
                                        <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 4 }}>
                                            {item === 1 ? "Pizza Margherita" : item === 2 ? "Burger Classic" : "Pad Thai"}
                                        </Text>
                                        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 }}>
                                            {item === 1 ? "Pizzeria Roma" : item === 2 ? "Burger House" : "Thai Spicy"}
                                        </Text>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.primary }}>
                                                {item === 1 ? "32 zł" : item === 2 ? "29 zł" : "38 zł"}
                                            </Text>
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: COLORS.primary,
                                                    paddingVertical: 6,
                                                    paddingHorizontal: 12,
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Zamów</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Featured Restaurants Section */}
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

                {/* NOWE: Sekcja Najlepiej Oceniane */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        marginTop: 20,
                        marginBottom: 15,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 20,
                            marginBottom: 15,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Star size={18} color="#FFD700" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary }}>Najlepiej Oceniane</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "600" }}>Zobacz wszystkie</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
                    >
                        {[1, 2, 3, 4].map((item) => (
                            <TouchableOpacity key={item} style={{ marginRight: 15 }}>
                                <View
                                    style={{
                                        width: 160,
                                        borderRadius: 16,
                                        backgroundColor: COLORS.cardBackground,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 3,
                                        overflow: "hidden",
                                    }}
                                >
                                    <View style={{ height: 100, backgroundColor: "#f0f0f0" }}>
                                        <Image
                                            source={{ uri: `https://picsum.photos/160/100?random=${item + 10}` }}
                                            style={{ width: "100%", height: "100%" }}
                                            resizeMode="cover"
                                        />
                                        <View
                                            style={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                backgroundColor: "rgba(0,0,0,0.6)",
                                                padding: 6,
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Star size={14} color="#FFD700" />
                                            <Text style={{ color: "#fff", marginLeft: 4, fontWeight: "700" }}>
                                                {(4.5 + item * 0.1).toFixed(1)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ padding: 10 }}>
                                        <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 2 }}>
                                            {item === 1
                                                ? "Sushi Master"
                                                : item === 2
                                                    ? "Trattoria"
                                                    : item === 3
                                                        ? "Bistro Francais"
                                                        : "Tapas Bar"}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                                            {item === 1 ? "Japońska" : item === 2 ? "Włoska" : item === 3 ? "Francuska" : "Hiszpańska"}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* NOWE: Sekcja Na Czasie */}
                {/*<Animated.View*/}
                {/*    style={{*/}
                {/*        opacity: fadeAnim,*/}
                {/*        transform: [{ translateY: slideAnim }],*/}
                {/*        marginTop: 10,*/}
                {/*        marginBottom: 15,*/}
                {/*    }}*/}
                {/*>*/}
                {/*    <View*/}
                {/*        style={{*/}
                {/*            flexDirection: "row",*/}
                {/*            justifyContent: "space-between",*/}
                {/*            alignItems: "center",*/}
                {/*            paddingHorizontal: 20,*/}
                {/*            marginBottom: 15,*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <View style={{ flexDirection: "row", alignItems: "center" }}>*/}
                {/*            <TrendingUp size={18} color={COLORS.primary} style={{ marginRight: 6 }} />*/}
                {/*            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary }}>Na Czasie</Text>*/}
                {/*        </View>*/}
                {/*        <TouchableOpacity>*/}
                {/*            <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "600" }}>Zobacz wszystkie</Text>*/}
                {/*        </TouchableOpacity>*/}
                {/*    </View>*/}

                {/*    <View style={{ paddingHorizontal: 20 }}>*/}
                {/*        {[1, 2].map((item) => (*/}
                {/*            <TouchableOpacity key={item} style={{ marginBottom: 15 }}>*/}
                {/*                <View*/}
                {/*                    style={{*/}
                {/*                        flexDirection: "row",*/}
                {/*                        borderRadius: 16,*/}
                {/*                        backgroundColor: COLORS.cardBackground,*/}
                {/*                        shadowColor: "#000",*/}
                {/*                        shadowOffset: { width: 0, height: 4 },*/}
                {/*                        shadowOpacity: 0.1,*/}
                {/*                        shadowRadius: 8,*/}
                {/*                        elevation: 3,*/}
                {/*                        overflow: "hidden",*/}
                {/*                    }}*/}
                {/*                >*/}
                {/*                    <View style={{ width: 100, height: 100, backgroundColor: "#f0f0f0" }}>*/}
                {/*                        <Image*/}
                {/*                            source={{ uri: `https://picsum.photos/100/100?random=${item + 20}` }}*/}
                {/*                            style={{ width: "100%", height: "100%" }}*/}
                {/*                            resizeMode="cover"*/}
                {/*                        />*/}
                {/*                    </View>*/}
                {/*                    <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>*/}
                {/*                        <View>*/}
                {/*                            <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 4 }}>*/}
                {/*                                {item === 1 ? "Zdrowe Bowle" : "Kuchnia Roślinna"}*/}
                {/*                            </Text>*/}
                {/*                            <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 }}>*/}
                {/*                                {item === 1 ? "Odkryj nowy trend kulinarny" : "Popularne dania bez mięsa"}*/}
                {/*                            </Text>*/}
                {/*                        </View>*/}
                {/*                        <View style={{ flexDirection: "row", alignItems: "center" }}>*/}
                {/*                            <View*/}
                {/*                                style={{*/}
                {/*                                    backgroundColor: "rgba(0,0,0,0.05)",*/}
                {/*                                    paddingVertical: 4,*/}
                {/*                                    paddingHorizontal: 8,*/}
                {/*                                    borderRadius: 6,*/}
                {/*                                    marginRight: 8,*/}
                {/*                                }}*/}
                {/*                            >*/}
                {/*                                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>*/}
                {/*                                    {item === 1 ? "#zdrowie" : "#eko"}*/}
                {/*                                </Text>*/}
                {/*                            </View>*/}
                {/*                            <View*/}
                {/*                                style={{*/}
                {/*                                    backgroundColor: "rgba(0,0,0,0.05)",*/}
                {/*                                    paddingVertical: 4,*/}
                {/*                                    paddingHorizontal: 8,*/}
                {/*                                    borderRadius: 6,*/}
                {/*                                }}*/}
                {/*                            >*/}
                {/*                                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>*/}
                {/*                                    {item === 1 ? "#fitness" : "#vegan"}*/}
                {/*                                </Text>*/}
                {/*                            </View>*/}
                {/*                        </View>*/}
                {/*                    </View>*/}
                {/*                </View>*/}
                {/*            </TouchableOpacity>*/}
                {/*        ))}*/}
                {/*    </View>*/}
                {/*</Animated.View>*/}
            </ScrollView>
        </View>
    )
}
