// frontend/services/addressService.ts
import apiClient from "./apiClient";
import type { AddressDto, CreateAddressDto, UpdateAddressDto } from "./types";

export const addressService = {
  // GET: api/address - Gets addresses for the CURRENT user
  getMyAddresses: async (authToken: string): Promise<AddressDto[]> => {
    return apiClient<AddressDto[]>("/api/address", { authToken });
  },

  // GET: api/address/{id} - Gets a specific address IF owned by the current user
  getAddressById: async (id: number, authToken: string): Promise<AddressDto> => {
    return apiClient<AddressDto>(`/api/address/${id}`, { authToken });
  },

  // POST: api/address - Creates a new address for the CURRENT user
  createAddress: async (data: CreateAddressDto, authToken: string): Promise<AddressDto> => {
    return apiClient<AddressDto>("/api/address", {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // PUT: api/address/{id} - Updates an address IF owned by the current user
  updateAddress: async (id: number, data: UpdateAddressDto, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/address/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },

  // DELETE: api/address/{id} - Deletes an address IF owned by the current user
  deleteAddress: async (id: number, authToken: string): Promise<void> => {
    return apiClient<void>(`/api/address/${id}`, {
      method: "DELETE",
      authToken,
    });
  },
};
