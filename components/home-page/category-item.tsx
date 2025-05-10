import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { COLORS } from './constants'

interface Category {
    id: string
    name: string
    icon: string
}

interface CategoryItemProps {
    item: Category
    activeCategory: string
    onPress: (categoryName: string) => void
}

export function CategoryItem({ item, activeCategory, onPress }: CategoryItemProps) {
    return (
        <TouchableOpacity
            style={{
                marginRight: 12,
                alignItems: "center",
            }}
            onPress={() => onPress(item.name)}
        >
            <View
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    backgroundColor: activeCategory === item.name ? COLORS.primary : COLORS.cardBackground,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                }}
            >
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            </View>

            <Text
                style={{
                    fontSize: 12,
                    fontWeight: activeCategory === item.name ? "600" : "400",
                    color: activeCategory === item.name ? COLORS.accent : COLORS.textSecondary,
                }}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    )
}
