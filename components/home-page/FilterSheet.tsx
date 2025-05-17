// components/home-page/FilterSheet.tsx
"use client"

import React from "react"
import { Animated, View, Text, TouchableOpacity, Platform } from "react-native"
import { X, Check } from "lucide-react-native"

interface FilterSheetProps {
    showFilterSheet: boolean
    setShowFilterSheet: (show: boolean) => void
    filterSheetAnim: Animated.Value
    sortBy: string
    setSortBy: (option: any) => void
    resetFilters: () => void
    SORT_OPTIONS: Record<string, string>
    COLORS: {
        primary: string
        cardBackground: string
        textPrimary: string
        textSecondary: string
        [key: string]: string
    }
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
                                                            showFilterSheet,
                                                            setShowFilterSheet,
                                                            filterSheetAnim,
                                                            sortBy,
                                                            setSortBy,
                                                            resetFilters,
                                                            SORT_OPTIONS,
                                                            COLORS,
                                                        }) => {
    return (
        <Animated.View
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: COLORS.cardBackground,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingHorizontal: 20,
                paddingTop: 15,
                paddingBottom: Platform.OS === "ios" ? 40 : 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 20,
                transform: [{ translateY: filterSheetAnim }],
                zIndex: 1000,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 15,
                }}
            >
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: COLORS.textPrimary,
                    }}
                >
                    Filtry i Sortowanie
                </Text>
                <TouchableOpacity onPress={() => setShowFilterSheet(false)}>
                    <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: COLORS.textPrimary,
                        marginBottom: 10,
                    }}
                >
                    Sortuj według
                </Text>

                {Object.entries(SORT_OPTIONS).map(([key, label]) => (
                    <TouchableOpacity
                        key={key}
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: "rgba(0,0,0,0.05)",
                        }}
                        onPress={() => setSortBy(key)}
                    >
                        <Text
                            style={{
                                fontSize: 15,
                                color: sortBy === key ? COLORS.primary : COLORS.textPrimary,
                                fontWeight: sortBy === key ? "600" : "normal",
                            }}
                        >
                            {label}
                        </Text>
                        {sortBy === key && <Check size={20} color={COLORS.primary} />}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity
                    style={{
                        paddingVertical: 12,
                        paddingHorizontal: 15,
                        borderRadius: 10,
                    }}
                    onPress={resetFilters}
                >
                    <Text style={{ color: COLORS.textSecondary, fontWeight: "600" }}>
                        Resetuj
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        backgroundColor: COLORS.primary,
                        paddingVertical: 12,
                        paddingHorizontal: 25,
                        borderRadius: 10,
                        shadowColor: COLORS.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                    onPress={() => setShowFilterSheet(false)}
                >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Zastosuj</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}
