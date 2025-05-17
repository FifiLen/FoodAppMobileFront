// frontend/services/orderService.ts
import apiClient from "./apiClient";
import type { OrderDto, CreateOrderDto, UpdateOrderStatusDto } from "./types";

export const orderService = {
  // GET: api/orders - Gets orders for the current user (or all if admin)
  getOrders: async (authToken: string): Promise<OrderDto[]> => {
    return apiClient<OrderDto[]>("/api/orders", { authToken });
  },

  // GET: api/orders/{id} - Gets a specific order
  getOrderById: async (id: number, authToken: string): Promise<OrderDto> => {
    return apiClient<OrderDto>(`/api/orders/${id}`, { authToken });
  },

  // POST: api/orders - Creates a new order
  createOrder: async (data: CreateOrderDto, authToken: string): Promise<OrderDto> => {
    return apiClient<OrderDto>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // PUT: api/orders/{id}/status - Updates order status (Admin)
  updateOrderStatus: async (id: number, data: UpdateOrderStatusDto, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // DELETE: api/orders/{id}/cancel - Cancels an order (User or Admin)
  cancelOrder: async (id: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/orders/${id}/cancel`, {
      method: "DELETE",
      authToken,
    });
  },
};
