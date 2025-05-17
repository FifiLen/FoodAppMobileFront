// frontend/components/home-page/section-header.tsx
"use client" // Keep this if it's there

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from './constants'; // Assuming constants.ts is in the same directory

interface SectionHeaderProps {
    title: string;
    actionText?: string;
    onActionPress?: () => void; // New optional prop
    showActionButton?: boolean; // New optional prop to control visibility
}

export function SectionHeader({
    title,
    actionText = "Zobacz wszystkie",
    onActionPress, // Destructure new prop
    showActionButton = true, // Default to true
}: SectionHeaderProps) {
    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                paddingHorizontal: 24, // Or use SPACING.lg if defined
            }}
        >
            <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.textPrimary }}>
                {title}
            </Text>

            {showActionButton && onActionPress && ( // Conditionally render the button
                <TouchableOpacity onPress={onActionPress}>
                    <Text style={{ fontSize: 14, color: COLORS.accent, fontWeight: '600' }}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
