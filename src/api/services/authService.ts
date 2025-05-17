// frontend/services/authService.ts
import apiClient from "./apiClient";
import type { RegisterDto, LoginDto, LoginResponseDto } from "./types";

export const authService = {
  register: async (data: RegisterDto): Promise<void> => { // Register returns 200 OK, no specific body in Swagger
    return apiClient<void>("/api/AuthControler/register", { // Note: Swagger has "AuthControler"
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginDto): Promise<LoginResponseDto> => {
    return apiClient<LoginResponseDto>("/api/AuthControler/login", { // Note: Swagger has "AuthControler"
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
