// frontend/services/restaurantService.ts
import apiClient from "./apiClient";
import type {
  RestaurantDto,
  RestaurantDetailDto,
  PopularRestaurantDto,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  TopRatedRestaurantDto,
} from "./types";

export const restaurantService = {
  // GET: api/restaurants
  getAll: async (): Promise<RestaurantDto[]> => {
    return apiClient<RestaurantDto[]>("/api/restaurants");
  },

  // GET: api/restaurants/{id}
  getById: async (id: number): Promise<RestaurantDetailDto> => {
    return apiClient<RestaurantDetailDto>(`/api/restaurants/${id}`);
  },

  // GET: api/restaurants/popular
  getPopular: async (count: number = 5): Promise<PopularRestaurantDto[]> => {
    return apiClient<PopularRestaurantDto[]>(`/api/restaurants/popular?count=${count}`);
  },

  // POST: api/restaurants - Admin only
  create: async (data: CreateRestaurantDto, authToken: string): Promise<RestaurantDto> => {
    return apiClient<RestaurantDto>("/api/restaurants", {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // PUT: api/restaurants/{id} - Admin only
  update: async (id: number, data: UpdateRestaurantDto, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },
  getTopRated: async (count: number = 5): Promise<TopRatedRestaurantDto[]> => {
    return apiClient<TopRatedRestaurantDto[]>(
      `/api/restaurants/top-rated?count=${count}`,
    );
  },

  // DELETE: api/restaurants/{id} - Admin only
  delete: async (id: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/restaurants/${id}`, {
      method: "DELETE",
      authToken,
    });
  },
};
