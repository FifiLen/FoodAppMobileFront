// frontend/context/CartContext.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from "react-native";

export interface CartItem {
    id: string;          // ID produktu
    name: string;
    price: number;       // Cena jednostkowa jako liczba
    quantity: number;
    image?: any;         // ImageSourcePropType lub string URL
    restaurantId: number; // <<< DODANE: ID restauracji, z której pochodzi produkt
    // Możesz dodać więcej pól, np. restaurantName, jeśli potrzebne w koszyku
}

interface CartContextType {
    cartItems: CartItem[];
    // ZMIANA: addToCart teraz oczekuje obiektu z restaurantId
    addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    totalPrice: number;
    // Opcjonalnie: funkcja do sprawdzenia, czy można dodać produkt z innej restauracji
    canAddToCart: (productRestaurantId: number) => boolean;
    getCartRestaurantId: () => number | null; // Pobiera ID restauracji z koszyka (jeśli jest)
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@FoodApp:cartItems';

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCart = async () => {
            try {
                const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (storedCart) {
                    setCartItems(JSON.parse(storedCart));
                }
            } catch (e) {
                console.error("Failed to load cart from storage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadCart();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const saveCart = async () => {
                try {
                    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
                } catch (e) {
                    console.error("Failed to save cart to storage", e);
                }
            };
            saveCart();
        }
    }, [cartItems, isLoading]);

    const getCartRestaurantId = (): number | null => {
        if (cartItems.length > 0) {
            return cartItems[0].restaurantId;
        }
        return null;
    };

    const canAddToCart = (productRestaurantId: number): boolean => {
        if (cartItems.length === 0) {
            return true; // Koszyk jest pusty, można dodać z dowolnej restauracji
        }
        // Sprawdź, czy produkt jest z tej samej restauracji co istniejące produkty
        return cartItems[0].restaurantId === productRestaurantId;
    };

    const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
        // Sprawdzenie, czy można dodać produkt (z tej samej restauracji)
        if (!canAddToCart(product.restaurantId)) {
            Alert.alert(
                "Inna restauracja",
                "Możesz dodawać produkty tylko z jednej restauracji na raz. Czy chcesz wyczyścić koszyk i dodać ten produkt?",
                [
                    { text: "Anuluj", style: "cancel" },
                    {
                        text: "Wyczyść i dodaj",
                        onPress: () => {
                            setCartItems([{ ...product, quantity }]);
                        }
                    }
                ]
            );
            return;
        }

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === productId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (isLoading) {
        return null;
    }

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                itemCount,
                totalPrice,
                canAddToCart,
                getCartRestaurantId
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
