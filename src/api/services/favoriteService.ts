// frontend/services/favoriteService.ts
import apiClient from "./apiClient";
import type { FavoriteItemDto } from "./types";

export const favoriteService = {
  // GET: api/favorites - Gets all favorites for the current user
  getUserFavorites: async (authToken: string): Promise<FavoriteItemDto[]> => {
    return apiClient<FavoriteItemDto[]>("/api/favorites", { authToken });
  },

  // POST: api/favorites/restaurant/{restaurantId} - Add a restaurant to favorites
  addRestaurantFavorite: async (restaurantId: number, authToken: string): Promise<FavoriteItemDto> => {
    return apiClient<FavoriteItemDto>(`/api/favorites/restaurant/${restaurantId}`, {
      method: "POST",
      authToken,
    });
  },

  // DELETE: api/favorites/restaurant/{restaurantId} - Remove a restaurant from favorites
  removeRestaurantFavorite: async (restaurantId: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/favorites/restaurant/${restaurantId}`, {
      method: "DELETE",
      authToken,
    });
  },

  // POST: api/favorites/product/{productId} - Add a product to favorites
  addProductFavorite: async (productId: number, authToken: string): Promise<FavoriteItemDto> => {
    return apiClient<FavoriteItemDto>(`/api/favorites/product/${productId}`, {
      method: "POST",
      authToken,
    });
  },

  // DELETE: api/favorites/product/{productId} - Remove a product from favorites
  removeProductFavorite: async (productId: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/favorites/product/${productId}`, {
      method: "DELETE",
      authToken,
    });
  },
};
