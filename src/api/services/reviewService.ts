// frontend/services/reviewService.ts
import apiClient from "./apiClient";
import type { ReviewDto, CreateReviewDto, UpdateReviewDto } from "./types";

interface GetReviewsParams {
  restaurantId?: number | string;
  productId?: number | string;
}

export const reviewService = {
  // GET: api/reviews - Gets reviews, filterable by restaurantId or productId
  getReviews: async (params?: GetReviewsParams): Promise<ReviewDto[]> => {
    let endpoint = "/api/reviews";
    const queryParams = new URLSearchParams();
    if (params?.restaurantId) {
      queryParams.append("restaurantId", String(params.restaurantId));
    }
    if (params?.productId) {
      queryParams.append("productId", String(params.productId));
    }
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }
    return apiClient<ReviewDto[]>(endpoint); // Publicly accessible as per Swagger
  },

  // GET: api/reviews/{id} - Gets a specific review
  getReviewById: async (id: number): Promise<ReviewDto> => {
    return apiClient<ReviewDto>(`/api/reviews/${id}`); // Publicly accessible
  },

  // POST: api/reviews - Creates a new review (User)
  createReview: async (data: CreateReviewDto, authToken: string): Promise<ReviewDto> => {
    return apiClient<ReviewDto>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // PUT: api/reviews/{id} - Updates a review (User who owns it)
  updateReview: async (id: number, data: UpdateReviewDto, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // DELETE: api/reviews/{id} - Deletes a review (User who owns it or Admin)
  deleteReview: async (id: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/reviews/${id}`, {
      method: "DELETE",
      authToken,
    });
  },
};
