export interface Category {
    id: string
    name: string
    icon: string
}

export interface DietaryOption {
    id: string
    name: string
}

export interface Restaurant {
    id: string
    name: string
    image: string
    rating: number
    time: string
    tags: string[]
    promo: string | null
    priceRange: "$" | "$$" | "$$$"
    distance: string
}

export interface Product {
    id: string
    name: string
    restaurant: string
    image: string
    price: string
    rating: number
    category: string
    dietary: string[]
}

export type SortByOption = "recommended" | "rating" | "delivery_time" | "distance"

export type PriceRangeOption = "all" | "$" | "$$" | "$$$"
