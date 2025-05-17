// frontend/components/home-page/CategoriesSection.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ListRenderItem, ActivityIndicator } from 'react-native';
import { SectionHeader } from './section-header';
import { CategoryItem } from './category-item';
import { COLORS } from './constants';
import { API_URL } from '@/app/constants';

// Upewnij się, że ten adres jest poprawny i wskazuje na Twój backend
// Jeśli Docker mapuje port 8080 kontenera na 8081 hosta, to jest OK.

const CategoryApi = {
    list: async (): Promise<any> => {
        try {
            // ZMIANA: Nowy endpoint dla kategorii
            const response = await fetch(`${API_URL}/api/categories`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("CategoryApi.list: Błąd odpowiedzi serwera:", response.status, errorText);
                throw new Error(`Błąd serwera: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("CategoryApi.list: Błąd fetch:", error);
            throw error;
        }
    }
};

interface Category {
    id: string;
    name: string;
    icon: string;
}

const iconMap: Record<string, string> = {
    All: "🍽️", Pizza: "🍕", Burgers: "🍔", Sushi: "🍣",
    Healthy: "🥗", Desserts: "🍰", Pasta: "🍝", Tacos: "🌮",
    // Dodaj więcej mapowań, jeśli backend zwraca inne nazwy kategorii
};

interface CategoriesSectionProps {
    activeCategoryId: string | null;
    onCategorySelect: (categoryId: string) => void;
}

export function CategoriesSection({ activeCategoryId, onCategorySelect }: CategoriesSectionProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    useEffect(() => {
        console.log("CategoriesSection: Rozpoczynam pobieranie kategorii...");
        setLoadingCats(true);
        CategoryApi.list()
            .then((apiResponse: any) => {
                console.log("CategoriesSection: Surowa odpowiedź z CategoryApi.list():", apiResponse);
                // ***** POCZĄTEK POPRAWKI *****
                // Sprawdzamy, czy apiResponse istnieje ORAZ czy ma pole $values, które jest tablicą
                if (apiResponse && apiResponse.$values && Array.isArray(apiResponse.$values)) {
                    const categoriesArrayFromApi = apiResponse.$values; // Używamy pola $values
                    const mappedCats: Category[] = categoriesArrayFromApi.map((c: any) => ({
                        id: c.id.toString(),
                        name: c.name,
                        icon: iconMap[c.name] ?? "🍽️",
                    }));
                    setCategories(mappedCats);
                    console.log("CategoriesSection: Kategorie pomyślnie zmapowane:", mappedCats);
                } else {
                    // Ten komunikat błędu powinien teraz zniknąć, jeśli powyższy warunek jest poprawny
                    console.error("CategoriesSection: Otrzymano nieoczekiwany format danych dla kategorii (oczekiwano obiektu z polem $values będącym tablicą).", apiResponse);
                    setCategories([]);
                }
                // ***** KONIEC POPRAWKI *****
            })
            .catch(err => {
                console.error("CategoriesSection: Błąd podczas pobierania kategorii:", err);
                setCategories([]);
            })
            .finally(() => {
                console.log("CategoriesSection: Zakończono logikę pobierania kategorii.");
                setLoadingCats(false);
            });
    }, []);

    const handlePressCategory = (categoryId: string) => {
        console.log("CategoriesSection: Kliknięto kategorię ID:", categoryId);
        onCategorySelect(categoryId);
    };

    const renderCategoryItem: ListRenderItem<Category> = ({ item }) => (
        <CategoryItem
            item={item}
            isActive={item.id === activeCategoryId}
            onPress={() => handlePressCategory(item.id)}
        />
    );

    const renderListStatus = () => {
        if (loadingCats) {
            return (
                <View style={{ padding: 24, alignItems: "center", justifyContent: "center", height: 100 }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 8, color: COLORS.textSecondary }}>Ładowanie kategorii…</Text>
                </View>
            );
        }
        if (!loadingCats && categories.length === 0) {
            return (
                <Text style={{ paddingHorizontal: 24, paddingVertical: 16, textAlign: "center", color: COLORS.textSecondary }}>
                    Nie znaleziono kategorii.
                </Text>
            );
        }
        return null;
    };

    return (
        <View style={{ marginBottom: 32 }}>
            <SectionHeader title="Kategorie" />
            {renderListStatus()}
            {!loadingCats && categories.length > 0 && (
                <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
                />
            )}
        </View>
    );
}
