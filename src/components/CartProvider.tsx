import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SeafoodItem } from './CatalogPage';

export interface CartItem {
  id: string;
  item: SeafoodItem;
  quantity: number;
  deliveryOption: 'cleaned' | 'asis';
  basePrice: number;
  cleaningFee: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: SeafoodItem, quantity: number, deliveryOption: 'cleaned' | 'asis') => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number, deliveryOption: 'cleaned' | 'asis') => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: SeafoodItem, quantity: number, deliveryOption: 'cleaned' | 'asis') => {
    const basePrice = item.price * quantity;
    const cleaningFee = deliveryOption === 'cleaned' ? item.cleaningFee : 0;
    const totalPrice = basePrice + cleaningFee;

    const cartItem: CartItem = {
      id: `${item.id}-${deliveryOption}-${Date.now()}`,
      item,
      quantity,
      deliveryOption,
      basePrice,
      cleaningFee,
      totalPrice,
    };

    setItems(prev => [...prev, cartItem]);
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateCartItem = (id: string, quantity: number, deliveryOption: 'cleaned' | 'asis') => {
    setItems(prev => prev.map(cartItem => {
      if (cartItem.id === id) {
        const basePrice = cartItem.item.price * quantity;
        const cleaningFee = deliveryOption === 'cleaned' ? cartItem.item.cleaningFee : 0;
        const totalPrice = basePrice + cleaningFee;
        
        return {
          ...cartItem,
          quantity,
          deliveryOption,
          basePrice,
          cleaningFee,
          totalPrice,
        };
      }
      return cartItem;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.length;
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      getTotalItems,
      getTotalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;