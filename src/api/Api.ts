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


const BASE_URL = "http://192.168.0.13:8081";

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
    async list(): Promise<ApiCategory[]> { const fullUrl = `${BASE_URL}/api/CategoryControler`; try { const res = await fetch(fullUrl); return handleResponse<ApiCategory[]>(res); } catch (error: any) { console.error(`Fetch (Category.list) failed for ${fullUrl}:`, error.message); throw error; } },
    async getById(id: number | string): Promise<ApiCategory> { const fullUrl = `${BASE_URL}/api/CategoryControler/${id}`; try { const res = await fetch(fullUrl); return handleResponse<ApiCategory>(res); } catch (error: any) { console.error(`Fetch by ID (Category.getById) failed for ${fullUrl}:`, error.message); throw error; } },
    async create(payload: { name: string }): Promise<ApiCategory> { const fullUrl = `${BASE_URL}/api/CategoryControler`; try { const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); return handleResponse<ApiCategory>(res); } catch (error: any) { console.error(`Create (Category.create) failed for ${fullUrl}:`, error.message); throw error; } },
    async update(id: number | string, dataToUpdate: { name: string }): Promise<ApiCategory | void> { const fullUrl = `${BASE_URL}/api/CategoryControler/${id}`; const payload: CategoryPayload = { id: typeof id === 'string' ? parseInt(id, 10) : id, name: dataToUpdate.name, }; try { const res = await fetch(fullUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); return handleResponse<ApiCategory | void>(res); } catch (error: any) { console.error(`Update (Category.update) failed for ${fullUrl}:`, error.message); throw error; } },
    async delete(id: number | string): Promise<void> { const fullUrl = `${BASE_URL}/api/CategoryControler/${id}`; try { const res = await fetch(fullUrl, { method: 'DELETE', }); await handleResponse<void>(res); } catch (error: any) { console.error(`Delete (Category.delete) failed for ${fullUrl}:`, error.message); throw error; } }
};

export const RestaurantApi = { /* ... kod bez zmian ... */
    async list(): Promise<ApiRestaurant[]> { const fullUrl = `${BASE_URL}/api/RestaurantControler`; try { const res = await fetch(fullUrl); return handleResponse<ApiRestaurant[]>(res); } catch (error: any) { console.error(`Fetch (Restaurant.list) failed for ${fullUrl}:`, error.message); throw error; } },
    async getById(id: number | string): Promise<ApiRestaurant> { const fullUrl = `${BASE_URL}/api/RestaurantControler/${id}`; try { const res = await fetch(fullUrl); return handleResponse<ApiRestaurant>(res); } catch (error: any) { console.error(`Fetch by ID (Restaurant.getById) failed for ${fullUrl}:`, error.message); throw error; } },
    async create(payload: RestaurantPayload): Promise<ApiRestaurant> { const fullUrl = `${BASE_URL}/api/RestaurantControler`; const { id, ...createPayload } = payload; try { const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createPayload), }); return handleResponse<ApiRestaurant>(res); } catch (error: any) { console.error(`Create (Restaurant.create) failed for ${fullUrl}:`, error.message); throw error; } },
    async update(id: number | string, payload: RestaurantPayload): Promise<ApiRestaurant | void> { const fullUrl = `${BASE_URL}/api/RestaurantControler/${id}`; const payloadToSend: RestaurantPayload = { ...payload, id: typeof id === 'string' ? parseInt(id, 10) : id, }; try { const res = await fetch(fullUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadToSend), }); return handleResponse<ApiRestaurant | void>(res); } catch (error: any) { console.error(`Update (Restaurant.update) failed for ${fullUrl}:`, error.message); throw error; } },
    async delete(id: number | string): Promise<void> { const fullUrl = `${BASE_URL}/api/RestaurantControler/${id}`; try { const res = await fetch(fullUrl, { method: 'DELETE', }); await handleResponse<void>(res); } catch (error: any) { console.error(`Delete (Restaurant.delete) failed for ${fullUrl}:`, error.message); throw error; } }
};

export const DishApi = { /* ... kod bez zmian ... */
    async list(): Promise<ApiDish[]> { const fullUrl = `${BASE_URL}/api/ProductsControler`; try { const res = await fetch(fullUrl); return handleResponse<ApiDish[]>(res); } catch (error: any) { console.error(`Fetch (Dish.list) failed for ${fullUrl}:`, error.message); throw error; } },
    async getById(id: number | string): Promise<ApiDish> { const fullUrl = `${BASE_URL}/api/ProductsControler/${id}`; try { const res = await fetch(fullUrl); return handleResponse<ApiDish>(res); } catch (error: any) { console.error(`Fetch by ID (Dish.getById) failed for ${fullUrl}:`, error.message); throw error; } },
    async create(payload: DishPayload): Promise<ApiDish> { const fullUrl = `${BASE_URL}/api/ProductsControler`; const { id, ...createPayload } = payload; try { const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createPayload), }); return handleResponse<ApiDish>(res); } catch (error: any) { console.error(`Create (Dish.create) failed for ${fullUrl}:`, error.message); throw error; } },
    async update(id: number | string, payload: DishPayload): Promise<ApiDish | void> { const fullUrl = `${BASE_URL}/api/ProductsControler/${id}`; const payloadToSend: DishPayload = { ...payload, id: typeof id === 'string' ? parseInt(id, 10) : id, }; try { const res = await fetch(fullUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadToSend), }); return handleResponse<ApiDish | void>(res); } catch (error: any) { console.error(`Update (Dish.update) failed for ${fullUrl}:`, error.message); throw error; } },
    async delete(id: number | string): Promise<void> { const fullUrl = `${BASE_URL}/api/ProductsControler/${id}`; try { const res = await fetch(fullUrl, { method: 'DELETE', }); await handleResponse<void>(res); } catch (error: any) { console.error(`Delete (Dish.delete) failed for ${fullUrl}:`, error.message); throw error; } }
};

export const ReviewApi = { /* ... kod bez zmian ... */
    async list(): Promise<ApiReview[]> { const fullUrl = `${BASE_URL}/api/ReviewControler`; try { const res = await fetch(fullUrl); return handleResponse<ApiReview[]>(res); } catch (error: any) { console.error(`Fetch (Review.list) failed for ${fullUrl}:`, error.message); throw error; } },
    async create(payload: ReviewPayload): Promise<ApiReview> { const fullUrl = `${BASE_URL}/api/ReviewControler`; try { const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); return handleResponse<ApiReview>(res); } catch (error: any) { console.error(`Create (Review.create) failed for ${fullUrl}:`, error.message); throw error; } },
    async delete(id: number | string): Promise<void> { const fullUrl = `${BASE_URL}/api/ReviewControler/${id}`; try { const res = await fetch(fullUrl, { method: 'DELETE', }); await handleResponse<void>(res); } catch (error: any) { console.error(`Delete (Review.delete) failed for ${fullUrl}:`, error.message); throw error; } }
};

export const UserApi = { /* ... kod bez zmian ... */
    async list(): Promise<ApiUser[]> { const fullUrl = `${BASE_URL}/api/UserControler`; try { const res = await fetch(fullUrl); return handleResponse<ApiUser[]>(res); } catch (error: any) { console.error(`Fetch (User.list) failed for ${fullUrl}:`, error.message); throw error; } },
    async getById(id: number | string): Promise<ApiUser> { const fullUrl = `${BASE_URL}/api/UserControler/${id}`; try { const res = await fetch(fullUrl); return handleResponse<ApiUser>(res); } catch (error: any) { console.error(`Fetch by ID (User.getById) failed for ${fullUrl}:`, error.message); throw error; } },
    async create(payload: UserCreatePayload): Promise<ApiUser> { const fullUrl = `${BASE_URL}/api/UserControler`; try { const res = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); return handleResponse<ApiUser>(res); } catch (error: any) { console.error(`Create (User.create) failed for ${fullUrl}:`, error.message); throw error; } },
    async update(id: number | string, payload: UserUpdatePayload): Promise<ApiUser | void> { const fullUrl = `${BASE_URL}/api/UserControler/${id}`; const payloadToSend: UserUpdatePayload = { ...payload, id: typeof id === 'string' ? parseInt(id, 10) : id, }; try { const res = await fetch(fullUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadToSend), }); return handleResponse<ApiUser | void>(res); } catch (error: any) { console.error(`Update (User.update) failed for ${fullUrl}:`, error.message); throw error; } },
    async delete(id: number | string): Promise<void> { const fullUrl = `${BASE_URL}/api/UserControler/${id}`; try { const res = await fetch(fullUrl, { method: 'DELETE', }); await handleResponse<void>(res); } catch (error: any) { console.error(`Delete (User.delete) failed for ${fullUrl}:`, error.message); throw error; } }
};

export const FavoriteApi = {
    async list(): Promise<ApiFavorite[]> {
        const fullUrl = `${BASE_URL}/api/FavoriteControler`;
        try {
            const res = await fetch(fullUrl);
            return handleResponse<ApiFavorite[]>(res);
        } catch (error: any) {
            console.error(`Fetch (Favorite.list) failed for ${fullUrl}:`, error.message);
            throw error;
        }
    },
    async getById(id: number | string): Promise<ApiFavorite> {
        const fullUrl = `${BASE_URL}/api/FavoriteControler/${id}`;
        try {
            const res = await fetch(fullUrl);
            return handleResponse<ApiFavorite>(res);
        } catch (error: any) {
            console.error(`Fetch by ID (Favorite.getById) failed for ${fullUrl}:`, error.message);
            throw error;
        }
    },
    async create(payload: FavoriteCreatePayload): Promise<ApiFavorite> {
        const fullUrl = `${BASE_URL}/api/FavoriteControler`;
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
            // Uwaga na odpowiedź text/plain z POST /api/FavoriteControler (ze Swaggera)
            // handleResponse może wymagać dostosowania, jeśli backend nie zwraca JSON
            return handleResponse<ApiFavorite>(res);
        } catch (error: any) {
            console.error(`Create (Favorite.create) failed for ${fullUrl}:`, error.message);
            throw error;
        }
    },
    async delete(id: number | string): Promise<void> {
        const fullUrl = `${BASE_URL}/api/FavoriteControler/${id}`;
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
