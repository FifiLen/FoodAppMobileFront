// src/api/authorizedFetch.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function authorizedFetch(
    url: string,
    options: RequestInit = {}
) {
    const token = await AsyncStorage.getItem('userToken');

    const headers: HeadersInit = {
        ...(options.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, { ...options, headers });
}
