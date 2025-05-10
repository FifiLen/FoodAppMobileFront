export interface FakeOrderItem {
    id: string; // Użyjemy string ID dla łatwości generowania na frontendzie
    productId: string; // Lub number, jeśli masz ID produktów
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number; // Obliczane: quantity * unitPrice
}

export interface FakeOrder {
    id: string; // Użyjemy string ID
    orderNumber: string; // Np. "ZAM_001"
    orderDate: Date;
    customerName: string; // Uproszczenie, zamiast pełnego userId
    deliveryAddress: string;
    status: 'Nowe' | 'W trakcie realizacji' | 'Wysłane' | 'Dostarczone' | 'Anulowane';
    items: FakeOrderItem[];
    totalAmount?: number; // Obliczane na podstawie items
}