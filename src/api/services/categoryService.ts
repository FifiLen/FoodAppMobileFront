// frontend/services/categoryService.ts
import apiClient from "./apiClient";
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from "./types";

export const categoryService = {
  // GET: api/categories - Publicly accessible
  getAll: async (): Promise<CategoryDto[]> => {
    return apiClient<CategoryDto[]>("/api/categories");
  },

  // GET: api/categories/{id} - Publicly accessible
  getById: async (id: number): Promise<CategoryDto> => {
    return apiClient<CategoryDto>(`/api/categories/${id}`);
  },

  // POST: api/categories - Admin only
  create: async (data: CreateCategoryDto, authToken: string): Promise<CategoryDto> => {
    return apiClient<CategoryDto>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // PUT: api/categories/{id} - Admin only
  update: async (id: number, data: UpdateCategoryDto, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // DELETE: api/categories/{id} - Admin only
  delete: async (id: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/categories/${id}`, {
      method: "DELETE",
      authToken,
    });
  },
};
