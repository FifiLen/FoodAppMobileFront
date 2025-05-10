// components/SpecialOfferItem.tsx
import React from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'

const { width } = Dimensions.get("window")

interface SpecialOffer {
    id: string
    title: string
    description: string
    code: string
    backgroundColor: string
    textColor: string
}

interface SpecialOfferItemProps {
    item: SpecialOffer
}

export function SpecialOfferItem({ item }: SpecialOfferItemProps) {
    return (
        <TouchableOpacity
            style={{
                width: width * 0.7,
                marginRight: 16,
                borderRadius: 24,
                backgroundColor: item.backgroundColor,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
            }}
        >
            <Text
                style={{ fontSize: 22, fontWeight: "700", color: item.textColor, marginBottom: 8 }}
            >
                {item.title}
            </Text>

            <Text style={{ fontSize: 14, color: item.textColor, opacity: 0.8, marginBottom: 16 }}>
                {item.description}
            </Text>

            <View
                style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.3)",
                }}
            >
                <Text style={{ fontWeight: "600", color: item.textColor }}>{item.code}</Text>
            </View>
        </TouchableOpacity>
    )
}
