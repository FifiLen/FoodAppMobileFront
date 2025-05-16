"use client"

import { useEffect, useState } from "react"
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    type ListRenderItem,
} from "react-native"
import { useRouter } from "expo-router"
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from "./constants"
// Dostosuj tę ścieżkę, jeśli RestaurantListItem jest gdzie indziej:
import {
    RestaurantListItem,
    type RestaurantListItemProps as RestaurantType,
} from "../../components/home-page/RestaurantListItem"
import { RefreshCw, ChevronRight } from "lucide-react-native" // Ikony dla nagłówka

const API_BASE_URL = "http://192.168.0.13:8081"

const RestaurantApi = {
    listAll: async (): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/api/restaurants`)
        if (!response.ok) {
            const errorText = await response.text()
            console.error("RestaurantApi.listAll (FeaturedRestaurantsSection): Błąd serwera:", response.status, errorText)
            throw new Error(`Błąd serwera: ${response.status}`)
        }
        return await response.json()
    },
}

interface FeaturedRestaurantsSectionProps {
    title?: string
    maxItems?: number
    horizontal?: boolean
    onViewAllPress?: () => void
}

export function FeaturedRestaurantsSection({
                                               title = "Popularne Restauracje",
                                               maxItems,
                                               horizontal = false, // Domyślnie lista pionowa, zmień na true dla poziomej
                                               onViewAllPress,
                                           }: FeaturedRestaurantsSectionProps) {
    const router = useRouter()
    const [restaurants, setRestaurants] = useState<RestaurantType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchRestaurants = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const apiResponse = await RestaurantApi.listAll()
            if (apiResponse && apiResponse.$values && Array.isArray(apiResponse.$values)) {
                let mappedRestaurants: RestaurantType[] = apiResponse.$values.map((r: any) => ({
                    id: r.id.toString(),
                    name: r.name || "Nieznana Restauracja",
                    imageUrl: r.imageUrl, // Zakładamy, że API zwraca to pole
                    cuisineType: r.cuisineType || r.category?.name, // Przykładowe pole
                    rating: r.averageRating, // Zakładamy, że API może zwracać średnią ocenę
                    // Dodaj inne pola, jeśli RestaurantListItem ich oczekuje
                }))
                if (maxItems) {
                    mappedRestaurants = mappedRestaurants.slice(0, maxItems)
                }
                setRestaurants(mappedRestaurants)
            } else {
                console.error("FeaturedRestaurantsSection: Nieoczekiwany format danych dla restauracji.", apiResponse)
                setError("Nie udało się wczytać restauracji (niepoprawny format).")
                setRestaurants([])
            }
        } catch (err: any) {
            console.error("FeaturedRestaurantsSection: Błąd podczas pobierania restauracji:", err)
            setError(err.message || "Nie udało się wczytać restauracji.")
            setRestaurants([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRestaurants()
    }, [])

    const handleRestaurantPress = (restaurantId: string) => {
        router.push(`/restaurant/${restaurantId}` as any)
    }

    const renderRestaurantItem: ListRenderItem<RestaurantType> = ({ item }) => (
        <View style={horizontal ? styles.horizontalListItemContainer : styles.verticalListItemContainer}>
            <RestaurantListItem item={item} onPress={() => handleRestaurantPress(item.id)} />
        </View>
    )

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            {error && !isLoading && (
                <TouchableOpacity onPress={fetchRestaurants} style={styles.headerButton}>
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
    )

    if (isLoading) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.centeredMessage}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.messageText}>Ładowanie restauracji...</Text>
                </View>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.centeredMessage}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchRestaurants}>
                        <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    if (restaurants.length === 0) {
        // Możesz zdecydować, czy chcesz renderować nagłówek, nawet jeśli nie ma restauracji
        return (
            <View style={styles.container}>
                {renderHeader()}
                <Text style={styles.centeredMessageText}>Brak restauracji do wyświetlenia.</Text>
            </View>
        )
        // return null; // Lub nie renderuj nic
    }

    return (
        <View style={styles.container}>
            {renderHeader()}
            <FlatList
                data={restaurants}
                renderItem={renderRestaurantItem}
                keyExtractor={(item) => item.id}
                horizontal={horizontal}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={horizontal ? styles.listContainerHorizontal : styles.listContainerVertical}
                // Dla pionowej listy wewnątrz ScrollView, jeśli jest długa, może być potrzebny własny scroll
                // lub ograniczenie wysokości i scrollEnabled={true}
                // Jeśli lista jest krótka i pionowa, można rozważyć użycie .map() zamiast FlatList
                // aby uniknąć problemów z zagnieżdżonym scrollowaniem.
                // Na razie zostawiam FlatList.
            />
        </View>
    )
}

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
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.small,
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
    listContainerVertical: {
        // Dla listy pionowej, RestaurantListItem powinien mieć własne marginesy boczne
    },
    horizontalListItemContainer: {
        width: 280,
        marginRight: SPACING.md,
    },
    verticalListItemContainer: {
        // Dla listy pionowej, RestaurantListItem sam zarządza marginesami
    },
})
