// src/context/CartContext.jsx
// Manages the shopping cart state for the entire app.
// Cart data lives in memory (resets on page refresh — simple approach for this project).

import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  // Each cart item: { product: {...}, size: 'M', quantity: 2 }
  const [cartItems, setCartItems] = useState([]);

  // Add an item to cart. If the same product+size is already in the cart, increase quantity.
  const addToCart = (product, size, quantity = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.product._id === product._id && item.size === size
      );

      if (existingItem) {
        // Item already in cart — just increase the quantity
        return prev.map((item) =>
          item.product._id === product._id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // New item — add it to the cart
      return [...prev, { product, size, quantity }];
    });
  };

  // Remove a specific product+size combination from cart
  const removeFromCart = (productId, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product._id === productId && item.size === size))
    );
  };

  // Change the quantity of a cart item. If quantity is 0 or less, remove it.
  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product._id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Empty the cart (called after a successful checkout)
  const clearCart = () => setCartItems([]);

  // Derived values — computed from cartItems, not stored separately
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}
