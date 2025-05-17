// frontend/services/apiClient.ts
import { API_URL } from "@/app/constants";

interface ApiClientOptions extends RequestInit {
  authToken?: string | null;
}

// Helper to unwrap { "$values": [...] } if present
function unwrapValues<T>(data: any): T {
  if (
    data &&
    typeof data === "object" &&
    "$values" in data &&
    Array.isArray(data.$values)
  ) {
    return data.$values as T;
  }
  return data as T;
}

async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { authToken, headers: optionHeaders, ...fetchOptions } = options;

  // Initialize Headers object
  const finalHeaders = new Headers();

  // Set default headers
  finalHeaders.set("Accept", "application/json");
  finalHeaders.set("Content-Type", "application/json");

  // Merge headers from options if they exist
  if (optionHeaders) {
    // The Headers constructor can take HeadersInit, normalizing it
    const providedHeaders = new Headers(optionHeaders);
    providedHeaders.forEach((value, key) => {
      finalHeaders.set(key, value);
    });
  }

  // Set Authorization header if authToken is provided
  if (authToken) {
    finalHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  const url = `${API_URL}${endpoint}`;
  // console.log(`API Request: ${options.method || "GET"} ${url}`, finalHeaders.get("Authorization")); // For debugging

  const response = await fetch(url, {
    ...fetchOptions,
    headers: finalHeaders, // Pass the constructed Headers object
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      try {
        errorData = await response.text();
      } catch (textErr) {
        errorData = `Status ${response.status} with no error body.`;
      }
    }
    console.error(
      `API Error (${response.status}) for ${url}:`,
      errorData,
    );
    const message =
      (typeof errorData === "object" && errorData?.title) ||
      (typeof errorData === "object" && errorData?.detail) ||
      (typeof errorData === "string" && errorData.substring(0, 200)) ||
      `Request failed: ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const rawData = await response.json();
  return unwrapValues<T>(rawData);
}

export default apiClient;
