// components/home-page/AnimatedHeader.tsx
"use client"

import React from "react"
import { Animated, View, Text, TouchableOpacity, Platform } from "react-native"
import { ShoppingBag, Bell, Bookmark } from "lucide-react-native"
import { COLORS } from "@/components/home-page/constants"

interface AnimatedHeaderProps {
    headerOpacity: Animated.AnimatedInterpolation<string | number>
}

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
                                                                  headerOpacity,
                                                              }) => {
    return (
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
    )
}
