import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load cart from Firestore when user logs in
  useEffect(() => {
    async function loadCart() {
      if (currentUser) {
        try {
          const cartRef = doc(db, 'carts', currentUser.uid);
          const cartDoc = await getDoc(cartRef);
          if (cartDoc.exists()) {
            setCart(cartDoc.data().items || []);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      } else {
        setCart([]);
      }
      setLoading(false);
    }
    loadCart();
  }, [currentUser]);

  // Save cart to Firestore whenever it changes
  useEffect(() => {
    async function saveCart() {
      if (currentUser && !loading) {
        try {
          const cartRef = doc(db, 'carts', currentUser.uid);
          await setDoc(cartRef, { items: cart }, { merge: true });
        } catch (error) {
          console.error('Error saving cart:', error);
        }
      }
    }
    saveCart();
  }, [cart, currentUser, loading]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
} 