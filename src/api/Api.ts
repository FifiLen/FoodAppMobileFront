import { authorizedFetch } from './authorizedFetch';

export interface ApiCategory {
    id: number;
    name: string;
    products?: any[];
}

export interface ApiRestaurant {
    id: number;
    name: string;
    address?: string | null;
    phoneNumber?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    favorites?: any[];
    orders?: any[];
    products?: any[];
    reviews?: any[];
}

interface ApiNestedCategoryInDish {
    id: number;
    name: string;
}

interface ApiNestedRestaurantInDish {
    id: number;
    name: string;
}

interface ApiReviewItemForDish {
    id: number;
    rating: number;
    comment?: string;
}

export interface ApiDish {
    id: number;
    name: string;
    description: string | null;
    price: number;
    restaurantId: number;
    categoryId: number;
    category: ApiNestedCategoryInDish | null;
    restaurant: ApiNestedRestaurantInDish | null;
    imageUrl?: string | null;
    reviews?: ApiReviewItemForDish[];
    favorites?: any[];
    orderItems?: any[];
}

export interface ApiReview {
    id: number;
    rating: number;
    comment: string | null;
    reviewDate: string;
    userId: number;
    restaurantId: number | null;
    productId: number | null;
    product?: { id: number; name: string; } | null;
    restaurant?: { id: number; name: string; } | null;
    user?: { id: number; name: string; } | null;
}

export interface ApiUser {
    id: number;
    name: string;
    email: string;
    role?: string;
    isActive?: boolean;
    addresses?: any[];
    favorites?: any[];
    orders?: any[];
    reviews?: any[];
}

export interface ApiFavorite {
    id: number;
    userId: number;
    restaurantId: number | null;
    productId: number | null;
    product?: any | null;
    restaurant?: any | null;
    user?: any | null;
}

export interface CategoryPayload {
    id?: number;
    name: string;
}

export interface RestaurantPayload {
    id?: number;
    name: string;
    address?: string;
    phoneNumber?: string;
    description?: string;
    imageUrl?: string | null;
}

export interface DishPayload {
    id?: number;
    name: string;
    description?: string | null;
    price: number;
    categoryId: number;
    restaurantId: number;
    imageUrl?: string | null;
}

export interface ReviewPayload {
    rating: number;
    comment?: string | null;
    userId: number;
    productId?: number | null;
    restaurantId?: number | null;
}

export interface UserCreatePayload {
    name: string;
    email: string;
    password?: string;
    role?: string;
    isActive?: boolean;
}

export interface UserUpdatePayload {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
}

export interface FavoriteCreatePayload {
    userId: number;
    productId?: number | null;
    restaurantId?: number | null;
    // Poniższe pola są dodawane, aby pasowały do złożonego "Example Value" ze Swaggera
    // Wartości dla nich będą ustawiane na null lub puste struktury
    id?: number; // Backend powinien to zignorować lub ustawić sam
    product?: any | null; // Lub bardziej szczegółowy typ, jeśli znasz
    restaurant?: any | null; // Lub bardziej szczegółowy typ
    user?: any | null; // Lub bardziej szczegółowy typ
}


const BASE_URL = "http://localhost:8081";

async function handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 204) {
        return undefined as T;
    }
    if (!res.ok) {
        const errorText = await res.text().catch(() => `Could not read error text for status ${res.status}`);
        throw new Error(`API error (${res.status}) for ${res.url}: ${errorText}`);
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.toLowerCase().includes("application/json")) {
        try {
            return (await res.json()) as T;
        } catch (e: any) {
            const textResponse = await res.text().catch(() => `Could not read text response after JSON parse failure for URL: ${res.url}`);
            throw new Error(`Failed to parse API response as JSON for ${res.url}. Error: ${e.message}. Response text: ${textResponse}`);
        }
    }
    // Jeśli odpowiedź 200 OK, ale nie JSON (np. text/plain jak w Swaggerze dla POST Favorite)
    if (res.ok && contentType && contentType.toLowerCase().includes("text/plain")) {
        // Próbujemy zwrócić tekst jako T, co może być problematyczne, jeśli T nie jest stringiem.
        // Dla POST Favorite, który zwraca text/plain, a my oczekujemy ApiFavorite, to będzie błąd.
        // Idealnie backend powinien zwracać JSON lub frontend powinien inaczej obsługiwać text/plain.
        // Na razie, jeśli T to obiekt, to rzuci błąd przy próbie rzutowania.
        // Jeśli T to void (np. dla delete), to jest OK.
        console.warn(`API for ${res.url} returned text/plain. Attempting to return as text.`);
        const textData = await res.text();
        return textData as T; // To może rzucić błąd, jeśli T nie jest stringiem
    }
    return undefined as T;
}

export const CategoryApi = { /* ... kod bez zmian ... */
    async list(): Promise<ApiCategory[]> { const fullUrl = `${BASE_URL}/api/categories`; try { const res = await fetch(fullUrl); return handleResponse<ApiCategory[]>(res); } catch (error: any) { console.error(`Fetch (Category.list) failed for ${fullUrl}:`, error.message); throw error; } },
    async getById(id: number | string): Promise<ApiCategory> { const fullUrl = `${BASE_URL}/api/categories/${id}`; try { const res = await fetch(fullUrl); return handleResponse<ApiCategory>(res); } catch (error: any) { console.error(`Fetch by ID (Category.getById) failed for ${fullUrl}:`, error.message); throw error; } },
    async create(payload: { name: string }): Promise<ApiCategory> {
        const fullUrl = `${BASE_URL}/api/categories`;
        try {
            const res = await authorizedFetch(fullUrl, {          // <-- tu
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            return handleResponse<ApiCategory>(res);
        } catch (err: any) {
            console.error(`Create (Category.create) failed for ${fullUrl}:`, err.message);
            throw err;
        }
    },    // async update(id: number | string, dataToUpdate: { name: string }): Promise<ApiCategory | void> { const fullUrl = `${BASE_URL}/api/categories/${id}`; const payload: CategoryPayload = { id: typeof id === 'string' ? parseInt(id, 10) : id, name: dataToUpdate.name, }; try { const res = await fetch(fullUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); return handleResponse<ApiCategory | void>(res); } catch (error: any) { console.error(`Update (Category.update) failed for ${fullUrl}:`, error.message); throw error; } },
    async update(id: string | number, payload: CategoryPayload) {
        const res = await authorizedFetch(`${BASE_URL}/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return handleResponse<ApiCategory | void>(res);
    },
    async delete(id: number | string): Promise<void> {
        const url = `${BASE_URL}/api/categories/${id}`;
        try {
            const res = await authorizedFetch(url, {   // ⬅️ tu
                method: 'DELETE',
            });
            await handleResponse<void>(res);
        } catch (err: any) {
            console.error(`Delete (Category.delete) failed for ${url}:`, err.message);
            throw err;
        }}};

export const RestaurantApi = {
    /* ---------- PUBLIC ---------- */

    async list(): Promise<ApiRestaurant[]> {
        const url = `${BASE_URL}/api/restaurants`;
        const res = await authorizedFetch(url);             // token nie przeszkadza, może zostać
        return handleResponse<ApiRestaurant[]>(res);
    },

    async getById(id: string | number): Promise<ApiRestaurant> {
        const url = `${BASE_URL}/api/restaurants/${id}`;
        const res = await authorizedFetch(url);
        return handleResponse<ApiRestaurant>(res);
    },

    async listPopular(count?: number): Promise<ApiRestaurant[]> {
        const url = `${BASE_URL}/api/restaurants/popular` + (count ? `?count=${count}` : '');
        const res = await authorizedFetch(url);
        return handleResponse<ApiRestaurant[]>(res);
    },

    /* ---------- WYMAGAJĄ TOKENU ---------- */

    async create(payload: RestaurantPayload): Promise<ApiRestaurant> {
        const url = `${BASE_URL}/api/restaurants`;
        const { id, ...data } = payload;                    // backend sam nada ID
        const res = await authorizedFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse<ApiRestaurant>(res);
    },

    async update(id: string | number, payload: RestaurantPayload): Promise<ApiRestaurant | void> {
        const url = `${BASE_URL}/api/restaurants/${id}`;
        const res = await authorizedFetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, id: Number(id) }),
        });
        return handleResponse<ApiRestaurant | void>(res);
    },

    async delete(id: string | number): Promise<void> {
        const url = `${BASE_URL}/api/restaurants/${id}`;
        const res = await authorizedFetch(url, { method: 'DELETE' });
        await handleResponse<void>(res);
    },
};

export const DishApi = {
    /* ---------- PUBLIC ---------- */

    /**
     * Pobierz listę dań.
     * Możesz opcjonalnie filtrować po restauracji i/lub kategorii
     */
    async list(params?: { restaurantId?: number; categoryId?: number }): Promise<ApiDish[]> {
        const qs =
            params && (params.restaurantId || params.categoryId)
                ? '?' +
                new URLSearchParams({
                    ...(params.restaurantId ? { restaurantId: String(params.restaurantId) } : {}),
                    ...(params.categoryId ? { categoryId: String(params.categoryId) } : {}),
                }).toString()
                : '';

        const url = `${BASE_URL}/api/products${qs}`;
        const res = await authorizedFetch(url);
        return handleResponse<ApiDish[]>(res);
    },

    async getById(id: string | number): Promise<ApiDish> {
        const url = `${BASE_URL}/api/products/${id}`;
        const res = await authorizedFetch(url);
        return handleResponse<ApiDish>(res);
    },

    /* ---------- WYMAGAJĄ TOKENU ---------- */

    async create(payload: DishPayload): Promise<ApiDish> {
        const url = `${BASE_URL}/api/products`;
        const { id, ...data } = payload;                // backend sam nada ID
        const res = await authorizedFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse<ApiDish>(res);
    },

    async update(id: string | number, payload: DishPayload): Promise<ApiDish | void> {
        const url = `${BASE_URL}/api/products/${id}`;
        const res = await authorizedFetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, id: Number(id) }),
        });
        return handleResponse<ApiDish | void>(res);
    },

    async delete(id: string | number): Promise<void> {
        const url = `${BASE_URL}/api/products/${id}`;
        const res = await authorizedFetch(url, { method: 'DELETE' });
        await handleResponse<void>(res);
    },
};

export const ReviewApi = {
    /**
     * Pobierz recenzje; opcjonalnie przefiltruj po restauracji lub produkcie
     */
    async list(params?: { restaurantId?: number; productId?: number }): Promise<ApiReview[]> {
        const qs =
            params && (params.restaurantId || params.productId)
                ? '?' +
                new URLSearchParams({
                    ...(params.restaurantId ? { restaurantId: String(params.restaurantId) } : {}),
                    ...(params.productId ? { productId: String(params.productId) } : {}),
                }).toString()
                : '';

        const url = `${BASE_URL}/api/reviews${qs}`;
        const res = await authorizedFetch(url);
        return handleResponse<ApiReview[]>(res);
    },

    /**
     * Dodaj recenzję (wymaga zalogowania)
     */
    async create(payload: ReviewPayload): Promise<ApiReview> {
        const url = `${BASE_URL}/api/reviews`;
        const res = await authorizedFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return handleResponse<ApiReview>(res);
    },

    /**
     * Usuń recenzję (wymaga uprawnień do kasowania)
     */
    async delete(id: number | string): Promise<void> {
        const url = `${BASE_URL}/api/reviews/${id}`;
        const res = await authorizedFetch(url, { method: 'DELETE' });
        await handleResponse<void>(res);
    },
};

export const UserApi = { /* ... kod bez zmian ... */
    async list(): Promise<ApiUser[]> { const fullUrl = `${BASE_URL}/api/User`; try { const res = await fetch(fullUrl); return handleResponse<ApiUser[]>(res); } catch (error: any) { console.error(`Fetch (User.list) failed for ${fullUrl}:`, error.message); throw error; } },
    async getById(id: number | string): Promise<ApiUser> { const fullUrl = `${BASE_URL}/api/User/${id}`; try { const res = await fetch(fullUrl); return handleResponse<ApiUser>(res); } catch (error: any) { console.error(`Fetch by ID (User.getById) failed for ${fullUrl}:`, error.message); throw error; } },
    async create(payload: UserCreatePayload): Promise<ApiUser> { const fullUrl = `${BASE_URL}/api/User`; try { const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); return handleResponse<ApiUser>(res); } catch (error: any) { console.error(`Create (User.create) failed for ${fullUrl}:`, error.message); throw error; } },
    async update(id: number | string, payload: UserUpdatePayload): Promise<ApiUser | void> { const fullUrl = `${BASE_URL}/api/User/${id}`; const payloadToSend: UserUpdatePayload = { ...payload, id: typeof id === 'string' ? parseInt(id, 10) : id, }; try { const res = await fetch(fullUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadToSend), }); return handleResponse<ApiUser | void>(res); } catch (error: any) { console.error(`Update (User.update) failed for ${fullUrl}:`, error.message); throw error; } },
    async delete(id: number | string): Promise<void> { const fullUrl = `${BASE_URL}/api/User/${id}`; try { const res = await fetch(fullUrl, { method: 'DELETE', }); await handleResponse<void>(res); } catch (error: any) { console.error(`Delete (User.delete) failed for ${fullUrl}:`, error.message); throw error; } }
};

export const FavoriteApi = {
    async list(): Promise<ApiFavorite[]> {
        const fullUrl = `${BASE_URL}/api/Favorite`;
        try {
            const res = await fetch(fullUrl);
            return handleResponse<ApiFavorite[]>(res);
        } catch (error: any) {
            console.error(`Fetch (Favorite.list) failed for ${fullUrl}:`, error.message);
            throw error;
        }
    },
    async getById(id: number | string): Promise<ApiFavorite> {
        const fullUrl = `${BASE_URL}/api/Favorite/${id}`;
        try {
            const res = await fetch(fullUrl);
            return handleResponse<ApiFavorite>(res);
        } catch (error: any) {
            console.error(`Fetch by ID (Favorite.getById) failed for ${fullUrl}:`, error.message);
            throw error;
        }
    },
    async create(payload: FavoriteCreatePayload): Promise<ApiFavorite> {
        const fullUrl = `${BASE_URL}/api/Favorite`;
        const actualPayload = {
            id: 0, // Backend powinien to zignorować lub ustawić sam
            userId: payload.userId,
            productId: payload.productId || null,
            restaurantId: payload.restaurantId || null,
            product: null, // Zgodnie z "Example Value"
            restaurant: payload.restaurantId ? { id: payload.restaurantId, name: null, favorites: [], orders: [], products: [], reviews: [] } : null,
            user: payload.userId ? { id: payload.userId, name: null, email: null, addresses: [], favorites: [], orders: [], reviews: [] } : null,
        };
        try {
            const res = await fetch(fullUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actualPayload),
            });
            // Uwaga na odpowiedź text/plain z POST /api/Favorite (ze Swaggera)
            // handleResponse może wymagać dostosowania, jeśli backend nie zwraca JSON
            return handleResponse<ApiFavorite>(res);
        } catch (error: any) {
            console.error(`Create (Favorite.create) failed for ${fullUrl}:`, error.message);
            throw error;
        }
    },
    async delete(id: number | string): Promise<void> {
        const fullUrl = `${BASE_URL}/api/Favorite/${id}`;
        try {
            const res = await fetch(fullUrl, {
                method: 'DELETE',
            });
            await handleResponse<void>(res);
        } catch (error: any) {
            console.error(`Delete (Favorite.delete) failed for ${fullUrl}:`, error.message);
            throw error;
        }
    }
};
