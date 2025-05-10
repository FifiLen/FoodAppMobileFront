import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { COLORS } from './constants'

interface SectionHeaderProps {
    title: string
    actionText?: string
}

export function SectionHeader({
     title, actionText = "Zobacz wszystkie", }: SectionHeaderProps) {
    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                paddingHorizontal: 24,
            }}
        >
            <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.textPrimary }}>
                {title}
            </Text>

            <TouchableOpacity>
                <Text style={{ fontSize: 14, color: COLORS.accent }}>{actionText}</Text>
            </TouchableOpacity>
        </View>
    )
}
