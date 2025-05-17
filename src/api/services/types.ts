// frontend/services/types.ts

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

// --- Address DTOs ---
export interface AddressDto {
  id: number;
  street: string | null;
  apartment: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface CreateAddressDto {
  street: string;
  apartment?: string | null;
  city: string;
  postalCode: string;
  country: string;
}

export interface UpdateAddressDto {
  street?: string | null;
  apartment?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

// --- Auth DTOs ---
export interface RegisterDto {
  name: string;
  email: string;
  password?: string; // Swagger shows password, ensure it's optional if not always sent
}

export interface LoginDto {
  email: string;
  password?: string; // Swagger shows password
}

export interface LoginResponseDto {
  token: string | null;
}

// --- Category DTOs ---
export interface CategoryDto {
  id: number;
  name: string | null;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name: string;
}

// --- Favorite DTOs ---
export interface FavoriteItemDto {
  id: number;
  userId: number;
  restaurantId: number | null;
  restaurantName: string | null;
  productId: number | null;
  productName: string | null;
  productPrice: number | null;
  productImageUrl: string | null;
  productRestaurantName: string | null;
}

// --- Order DTOs ---
export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Failed = "Failed",
}

export interface OrderDto { // Assuming 'Order' in Swagger is OrderDto for responses
  id: number;
  orderDate: string; // date-time
  totalAmount: number;
  status: OrderStatus;
  userId: number;
  restaurantId: number;
  deliveryAddressId: number | null;
  deliveryAddress: AddressDto | null; // Assuming AddressDto structure
  orderItems: OrderItemResponseDto[] | null;
  // restaurant: RestaurantDto | null; // Assuming RestaurantDto structure
  // user: any; // Define ApplicationUserDto if needed
  restaurantName?: string; // Often useful in UI
  userName?: string; // Often useful in UI
}


export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
  expectedUnitPrice?: number | null;
}

export interface CreateOrderDto {
  restaurantId: number;
  deliveryAddressId?: number | null;
  orderItems: CreateOrderItemDto[];
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

// --- OrderItem DTOs ---
export interface OrderItemResponseDto {
  id: number;
  orderId: number;
  productId: number;
  productName: string | null;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalItemPrice: number; // readOnly
}

export interface CreateStandaloneOrderItemDto {
  orderId: number;
  productId: number;
  quantity: number;
}

export interface UpdateOrderItemDto {
  quantity: number;
}

// --- Payment DTOs ---
export interface PaymentDto {
  orderId: number;
  amount: number;
  paymentDate: string; // date-time
  paymentMethod: string | null;
  status: string | null;
}

export interface CreatePaymentDto {
  orderId: number;
  paymentMethod: string;
}

export interface UpdatePaymentStatusDto {
  status: string;
}

// --- Product DTOs ---
export interface ProductDto {
  id: number;
  name: string | null;
  description: string | null;
  price: number;
  imageUrl: string | null;
  restaurantId: number;
  restaurantName: string | null;
  categoryId: number;
  categoryName: string | null;
}

export interface CreateProductDto {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  restaurantId: number;
  categoryId: number;
}

export interface UpdateProductDto {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  restaurantId?: number | null;
  categoryId?: number | null;
}

export interface ProductSummaryDto { // From RestaurantDetailDto
  id: number;
  name: string | null;
  price: number;
  categoryName: string | null;
}


// --- Restaurant DTOs ---
export interface RestaurantDto { // For GET /api/restaurants (list view)
  id: number;
  name: string | null;
  imageUrl?: string | null;      // Often included in list views
  averageRating?: number | null; // Often included in list views
  // If your API sends categoryName or a simple list of category names directly, add them:
  categoryName?: string | null; // If only one primary category is sent
  categories?: { id: number; name: string | null; }[] | null; // If multiple categories are sent
  // Add any other fields your ACTUAL API list endpoint returns for restaurants
  deliveryTime?: string | null; // If API provides this
  distance?: string | null;     // If API provides this
  priceRange?:string | null;
}
export interface RestaurantDetailDto {
  id: number;
  name: string | null;
  imageUrl: string | null;
  products: ProductSummaryDto[] | null;
  reviews: ReviewSummaryDto[] | null;
  averageRating: number | null;
}

export interface CreateRestaurantDto {
  name: string;
}

export interface UpdateRestaurantDto {
  name: string;
}

export interface PopularRestaurantDto {
  id: number;
  name: string | null;
  favoriteCount: number;
  // Consider adding imageUrl, averageRating, cuisineType if API provides them
}


// --- Review DTOs ---
export interface ReviewDto {
  id: number;
  rating: number;
  comment: string | null;
  reviewDate: string; // date-time
  userId: number;
  userName: string | null;
  restaurantId: number | null;
  restaurantName: string | null;
  productId: number | null;
  productName: string | null;
}

export interface CreateReviewDto {
  rating: number;
  comment?: string | null;
  restaurantId?: number | null;
  productId?: number | null;
}

export interface UpdateReviewDto {
  rating: number;
  comment?: string | null;
}

export interface ReviewSummaryDto { // From RestaurantDetailDto
  id: number;
  rating: number;
  comment: string | null;
  reviewDate: string; // date-time
  userName: string | null;
}
