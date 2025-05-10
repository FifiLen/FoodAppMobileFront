"use client"

import React from "react"
import { View, Text } from "react-native"
import { COLORS } from "@/components/home-page/constants"


interface DietaryTagProps {
    label: string
}

export function DietaryTag({ label }: DietaryTagProps) {
    return (
        <View
            style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                backgroundColor: COLORS.primary + "30",
                borderRadius: 4,
                marginRight: 4,
                marginBottom: 4,
            }}
        >
            <Text style={{ fontSize: 10, color: COLORS.accent }}>{label}</Text>
        </View>
    )
}
