// frontend/services/paymentService.ts
import apiClient from "./apiClient";
import type { PaymentDto, CreatePaymentDto, UpdatePaymentStatusDto } from "./types";

export const paymentService = {
  // GET: api/payments - (Admin) Gets all payments
  getAllPayments: async (authToken: string): Promise<PaymentDto[]> => {
    return apiClient<PaymentDto[]>("/api/payments", { authToken });
  },

  // GET: api/payments/order/{orderId} - Gets payment for a specific order
  getPaymentByOrderId: async (orderId: number, authToken: string): Promise<PaymentDto> => {
    return apiClient<PaymentDto>(`/api/payments/order/${orderId}`, { authToken });
  },

  // POST: api/payments - Creates a new payment
  createPayment: async (data: CreatePaymentDto, authToken: string): Promise<PaymentDto> => {
    return apiClient<PaymentDto>("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // PUT: api/payments/{orderId}/status - Updates payment status (Admin)
  updatePaymentStatus: async (orderId: number, data: UpdatePaymentStatusDto, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/payments/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },
};
