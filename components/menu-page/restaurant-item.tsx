"use client"

import React from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { Heart, Star, Clock, MapPin } from "lucide-react-native"
import { COLORS } from "@/components/home-page/constants"
import { Restaurant } from "@/types/menu-types"

interface RestaurantItemProps {
    item: Restaurant
}

export function RestaurantItem({ item }: RestaurantItemProps) {
    return (
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
                    style={{ width: "100%", height: 180 }}
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
                <View
                    style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}
                >
                    <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.textPrimary }}>
                        {item.name}
                    </Text>
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

                <View
                    style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Star size={16} color="#FFB800" fill="#FFB800" />
                        <Text style={{ marginLeft: 4, fontWeight: "500", color: COLORS.textPrimary }}>
                            {item.rating}
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Clock size={14} color={COLORS.textSecondary} />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: COLORS.textSecondary, marginRight: 12 }}>
                            {item.time}
                        </Text>

                        <MapPin size={14} color={COLORS.textSecondary} />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: COLORS.textSecondary }}>
                            {item.distance}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}
