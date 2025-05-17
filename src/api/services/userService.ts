// frontend/services/userService.ts
import apiClient from "./apiClient";
import type {
  UserProfileDto,
  UpdateUserProfileDto,
  ChangePasswordDto,
} from "./types"; // Make sure the path to your types is correct

const API_BASE_PATH = "/api/users"; // Base path for the UserController

export const userService = {
  /**
   * Gets the current user's profile.
   */
  getMyProfile: async (authToken: string): Promise<UserProfileDto> => {
    return apiClient<UserProfileDto>(`${API_BASE_PATH}/me`, {
      method: "GET",
      authToken,
    });
  },

  /**
   * Updates the current user's profile.
   */
  updateMyProfile: async (
    data: UpdateUserProfileDto,
    authToken: string,
  ): Promise<UserProfileDto> => {
    // Backend returns the updated UserProfileDto
    return apiClient<UserProfileDto>(`${API_BASE_PATH}/me`, {
      method: "PUT",
      body: JSON.stringify(data),
      authToken,
    });
  },

  /**
   * Changes the current user's password.
   */
  changeMyPassword: async (
    data: ChangePasswordDto,
    authToken: string,
  ): Promise<void> => {
    return apiClient<void>(`${API_BASE_PATH}/me/change-password`, {
      method: "POST",
      body: JSON.stringify(data),
      authToken,
    });
  },
};
