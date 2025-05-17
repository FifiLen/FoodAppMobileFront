// frontend/services/productService.ts
import apiClient from "./apiClient";
import type { ProductDto, CreateProductDto, UpdateProductDto } from "./types";

interface GetProductsParams {
  restaurantId?: number | string;
  categoryId?: number | string;
}

export const productService = {
  // GET: api/products
  getAll: async (params?: GetProductsParams): Promise<ProductDto[]> => {
    let endpoint = "/api/products";
    const queryParams = new URLSearchParams();
    if (params?.restaurantId) {
      queryParams.append("restaurantId", String(params.restaurantId));
    }
    if (params?.categoryId) {
      queryParams.append("categoryId", String(params.categoryId));
    }
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }
    return apiClient<ProductDto[]>(endpoint);
  },

  // GET: api/products/{id}
  getById: async (id: number): Promise<ProductDto> => {
    return apiClient<ProductDto>(`/api/products/${id}`);
  },

  // POST: api/products - Admin only
  create: async (data: CreateProductDto, authToken: string): Promise<ProductDto> => {
    return apiClient<ProductDto>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // PUT: api/products/{id} - Admin only
  update: async (id: number, data: UpdateProductDto, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // DELETE: api/products/{id} - Admin only
  delete: async (id: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/products/${id}`, {
      method: "DELETE",
      authToken,
    });
  },
};
