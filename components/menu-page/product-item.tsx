"use client"

import React from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { Star } from "lucide-react-native"
import { COLORS } from "@/components/home-page/constants"
import { Product } from "@/types/menu-types"
import { DietaryTag } from "@/components/menu-page/dietary-tag"

interface ProductItemProps {
    item: Product
}

export function ProductItem({ item }: ProductItemProps) {
    return (
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
                style={{ width: "100%", height: 140 }}
                resizeMode="cover"
            />

            <View style={{ padding: 12 }}>
                <Text
                    style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 2 }}
                    numberOfLines={1}
                >
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
                            <DietaryTag key={`${diet}-${index}`} label={diet} />
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}
