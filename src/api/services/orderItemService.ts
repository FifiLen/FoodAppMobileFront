// frontend/services/orderItemService.ts
import apiClient from "./apiClient";
import type { OrderItemResponseDto, CreateStandaloneOrderItemDto, UpdateOrderItemDto } from "./types";

export const orderItemService = {
  // GET: api/orderitems - (Admin/Debug) Gets all order items
  getAllOrderItems: async (authToken: string): Promise<OrderItemResponseDto[]> => {
    return apiClient<OrderItemResponseDto[]>("/api/orderitems", { authToken });
  },

  // GET: api/orderitems/{id} - Gets a specific order item
  getOrderItemById: async (id: number, authToken: string): Promise<OrderItemResponseDto> => {
    return apiClient<OrderItemResponseDto>(`/api/orderitems/${id}`, { authToken });
  },

  // POST: api/orderitems - Creates a standalone order item (usually items are created with an order)
  createOrderItem: async (data: CreateStandaloneOrderItemDto, authToken: string): Promise<OrderItemResponseDto> => {
    return apiClient<OrderItemResponseDto>("/api/orderitems", {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // PUT: api/orderitems/{id} - Updates quantity of an order item
  updateOrderItem: async (id: number, data: UpdateOrderItemDto, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/orderitems/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // DELETE: api/orderitems/{id} - Removes an order item
  deleteOrderItem: async (id: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/orderitems/${id}`, {
      method: "DELETE",
      authToken,
    });
  },
};
