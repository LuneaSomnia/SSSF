// Client-side email service that calls the backend API

interface OrderItem {
  name: string;
  category: string;
  categoryDisplay: string;
  quantity: number;
  price: number;
  deliveryOption: 'cleaned' | 'asis';
  cleaningFee: number;
  totalPrice: number;
}

interface OrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryLocation: string;
  items: OrderItem[];
  paymentMethod: 'mpesa' | 'cash';
  totalAmount: number;
  orderType: 'single' | 'bulk';
}

// Main function to send owner notification via API
export const sendOwnerNotification = async (order: OrderData): Promise<void> => {
  try {
    console.log('Sending order notification:', order);
    
    const response = await fetch('http://localhost:3001/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Owner notification email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('Failed to send owner notification email:', error);
    throw error;
  }
};

// Helper function to create order data from cart items
export const createOrderDataFromCart = (
  orderId: string,
  customerName: string,
  customerPhone: string,
  deliveryLocation: string,
  cartItems: any[],
  paymentMethod: 'mpesa' | 'cash',
  customerEmail?: string
): OrderData => {
  const items: OrderItem[] = cartItems.map(cartItem => ({
    name: cartItem.item.name,
    category: cartItem.item.category,
    categoryDisplay: cartItem.item.categoryDisplay,
    quantity: cartItem.quantity,
    price: cartItem.item.price,
    deliveryOption: cartItem.deliveryOption,
    cleaningFee: cartItem.cleaningFee,
    totalPrice: cartItem.totalPrice
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    orderId,
    customerName,
    customerPhone,
    customerEmail,
    deliveryLocation,
    items,
    paymentMethod,
    totalAmount,
    orderType: items.length > 1 ? 'bulk' : 'single'
  };
};

// Helper function to create order data from single item
export const createOrderDataFromSingle = (
  orderId: string,
  customerName: string,
  customerPhone: string,
  deliveryLocation: string,
  item: any,
  quantity: number,
  deliveryOption: 'cleaned' | 'asis',
  paymentMethod: 'mpesa' | 'cash',
  customerEmail?: string
): OrderData => {
  const basePrice = item.price * quantity;
  const cleaningFee = deliveryOption === 'cleaned' ? item.cleaningFee : 0;
  const totalPrice = basePrice + cleaningFee;

  const orderItem: OrderItem = {
    name: item.name,
    category: item.category,
    categoryDisplay: item.categoryDisplay,
    quantity,
    price: item.price,
    deliveryOption,
    cleaningFee,
    totalPrice
  };

  return {
    orderId,
    customerName,
    customerPhone,
    customerEmail,
    deliveryLocation,
    items: [orderItem],
    paymentMethod,
    totalAmount: totalPrice,
    orderType: 'single'
  };
};