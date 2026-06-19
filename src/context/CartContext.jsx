import { createContext, useContext, useState, useEffect } from 'react';
import { mockDeals } from '../data/mockDeals';
import { api } from '../utils/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const defaultOrders = [
  {
    id: 'ORD-A39B22',
    dealId: 'deal-001',
    dealTitle: 'Samsung Galaxy Buds FE — Buy 1 Get 1',
    dealImage: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=400&fit=crop',
    quantity: 1,
    originalPrice: 6999,
    pairleyPrice: 3499,
    totalPaid: 3499,
    status: 'searching',
    date: '2026-06-16',
    matchPartner: null,
    countdownMinutes: 45,
    progressPercent: 50,
    deliveryDetails: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@email.com',
      phone: '+91 98765 43210',
      address: 'Apt 402, Sea Breeze, Marine Drive',
      city: 'Mumbai',
      zipCode: '400002'
    }
  },
  {
    id: 'ORD-B92F11',
    dealId: 'deal-003',
    dealTitle: 'Luxury Spa Day — Couples BOGO Package',
    dealImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop',
    quantity: 1,
    originalPrice: 4500,
    pairleyPrice: 2250,
    totalPaid: 2250,
    status: 'matched',
    date: '2026-06-15',
    matchPartner: {
      name: 'Priya Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      city: 'Delhi',
      matchDate: '2026-06-15'
    },
    countdownMinutes: 0,
    progressPercent: 100,
    deliveryDetails: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@email.com',
      phone: '+91 98765 43210',
      address: 'Apt 402, Sea Breeze, Marine Drive',
      city: 'Mumbai',
      zipCode: '400002'
    }
  },
  {
    id: 'ORD-C88D44',
    dealId: 'deal-002',
    dealTitle: 'Nike Air Max 270 — BOGO Pair Deal',
    dealImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
    quantity: 1,
    originalPrice: 12995,
    pairleyPrice: 6497,
    totalPaid: 6497,
    status: 'delivered',
    date: '2026-05-10',
    matchPartner: {
      name: 'Rahul Krishnan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
      city: 'Bangalore',
      matchDate: '2026-05-10'
    },
    countdownMinutes: 0,
    progressPercent: 100,
    deliveryDetails: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@email.com',
      phone: '+91 98765 43210',
      address: 'Apt 402, Sea Breeze, Marine Drive',
      city: 'Mumbai',
      zipCode: '400002'
    }
  }
];

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const refreshOrders = () => {
    const token = localStorage.getItem('pairley_token');
    if (token) {
      return api.get('/customers/history')
        .then((history) => {
          const statusMapping = {
            'INTERESTED': 'searching',
            'READY_TO_BUY': 'matched',
            'CONTACTED': 'shipped',
            'COMPLETED': 'delivered',
            'CANCELLED': 'delivered'
          };

          const userStr = localStorage.getItem('pairley_user');
          const user = userStr ? JSON.parse(userStr) : null;
          const uName = user?.name || 'Me';
          const uEmail = user?.email || '';
          const uPhone = user?.mobile || '';
          const uAddress = user?.address || 'Customer Address';
          const uCity = user?.city || 'Mumbai';

          const mappedOrders = history.map((item) => ({
            id: `ORD-${item.id.slice(0, 6).toUpperCase()}`,
            dealId: item.offer.id,
            dealTitle: item.offer.title,
            dealImage: item.offer.offer_image || 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=400&fit=crop',
            quantity: 1,
            originalPrice: item.offer.original_price,
            pairleyPrice: item.offer.offer_price,
            totalPaid: item.offer.offer_price,
            status: statusMapping[item.status] || 'searching',
            date: new Date(item.created_at).toISOString().split('T')[0],
            matchPartner: item.status !== 'INTERESTED' ? {
              name: 'Matched Partner',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner',
              city: item.offer.city || uCity,
              matchDate: new Date(item.updated_at).toISOString().split('T')[0]
            } : null,
            countdownMinutes: item.status === 'INTERESTED' ? 120 : 0,
            progressPercent: item.status === 'INTERESTED' ? 50 : 100,
            deliveryDetails: {
              name: uName,
              email: uEmail,
              phone: uPhone,
              address: uAddress,
              city: item.offer.city || uCity,
              zipCode: ''
            }
          }));

          setOrders(mappedOrders);
          sessionStorage.setItem('pairley_orders', JSON.stringify(mappedOrders));
          return mappedOrders;
        })
        .catch((err) => {
          console.error('Failed to load user order history:', err);
          setOrders([]);
          return [];
        });
    } else {
      try {
        const storedOrders = sessionStorage.getItem('pairley_orders');
        const parsed = storedOrders ? JSON.parse(storedOrders) : [];
        setOrders(parsed);
        return Promise.resolve(parsed);
      } catch (e) {
        setOrders([]);
        return Promise.resolve([]);
      }
    }
  };

  // Load cart and orders from session storage or pre-populate
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('pairley_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      console.error('Failed to load cart state:', e);
    }

    refreshOrders();
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    sessionStorage.setItem('pairley_cart', JSON.stringify(items));
  };

  const addToCart = (deal) => {
    const existingIdx = cartItems.findIndex(item => item.id === deal.id);
    if (existingIdx > -1) {
      const nextItems = [...cartItems];
      nextItems[existingIdx].quantity += 1;
      saveCart(nextItems);
    } else {
      const newItem = {
        id: deal.id,
        title: deal.title,
        category: deal.category,
        images: deal.images || [],
        originalPrice: deal.originalPrice,
        pairleyPrice: deal.pairleyPrice,
        mode: deal.mode,
        location: deal.location,
        quantity: 1
      };
      saveCart([...cartItems, newItem]);
    }
  };

  const removeFromCart = (dealId) => {
    saveCart(cartItems.filter(item => item.id !== dealId));
  };

  const updateQuantity = (dealId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dealId);
      return;
    }
    saveCart(
      cartItems.map(item => item.id === dealId ? { ...item, quantity: parseInt(quantity) } : item)
    );
  };

  const clearCart = () => {
    saveCart([]);
  };

  const createOrder = (orderId, items, totalPaid, deliveryDetails) => {
    const newOrders = items.map(item => ({
      id: orderId,
      dealId: item.id,
      dealTitle: item.title,
      dealImage: item.images?.[0] || '',
      quantity: item.quantity,
      originalPrice: item.originalPrice,
      pairleyPrice: item.pairleyPrice,
      totalPaid: totalPaid,
      status: 'searching',
      date: new Date().toISOString().split('T')[0],
      matchPartner: null,
      countdownMinutes: 120,
      progressPercent: 50,
      deliveryDetails: deliveryDetails
    }));

    const nextOrders = [...newOrders, ...orders];
    setOrders(nextOrders);
    sessionStorage.setItem('pairley_orders', JSON.stringify(nextOrders));
  };

  // Pricing calculations
  const cartSubtotalOriginal = cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const cartSubtotalPairley = cartItems.reduce((sum, item) => sum + (item.pairleyPrice * item.quantity), 0);
  const cartSavings = cartSubtotalOriginal - cartSubtotalPairley;
  const cartSavingsPercentage = cartSubtotalOriginal > 0 ? Math.round((cartSavings / cartSubtotalOriginal) * 100) : 0;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartSubtotalOriginal,
      cartSubtotalPairley,
      cartSavings,
      cartSavingsPercentage,
      orders,
      createOrder,
      refreshOrders
    }}>
      {children}
    </CartContext.Provider>
  );
}
