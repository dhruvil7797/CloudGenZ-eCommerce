import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        // Load from local storage if available
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [popupMsg, setPopupMsg] = useState(null);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const showPopup = (msg) => {
        setPopupMsg(msg);
        setTimeout(() => setPopupMsg(null), 4000); // auto clear after 4s
    };

    const addToCart = (product, quantity = 1) => {
        if (product.stock_status === 'outofstock') {
            showPopup('This product is currently out of stock.');
            return;
        }

        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = currentQty + quantity;

            if (product.stock_quantity !== null && product.stock_quantity !== undefined) {
                if (newQty > product.stock_quantity) {
                    showPopup(`Cannot add that amount to the cart — we have ${product.stock_quantity} in stock and you already have ${currentQty} in your cart.`);
                    return prevCart;
                }
            }

            if (existing) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: newQty } : item
                );
            }
            return [...prevCart, { ...product, quantity: newQty }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart => {
            const item = prevCart.find(i => i.id === productId);
            if (item && item.stock_quantity !== null && item.stock_quantity !== undefined) {
                if (quantity > item.stock_quantity) {
                    showPopup(`Sorry, we only have ${item.stock_quantity} of this item in stock.`);
                    return prevCart;
                }
            }
            return prevCart.map(i =>
                i.id === productId ? { ...i, quantity } : i
            );
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal
        }}>
            {children}
            
            {/* Custom Popup Toast */}
            {popupMsg && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-red-50 text-red-800 border fill-red-800 border-red-200 px-5 py-3 rounded-xl shadow-[0_12px_40px_rgba(220,38,38,0.15)] animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-sm sm:max-w-md">
                    <AlertCircle size={22} className="text-red-500 flex-shrink-0 mt-0.5 self-start" />
                    <p className="text-sm font-semibold leading-relaxed flex-1">{popupMsg}</p>
                    <button 
                        onClick={() => setPopupMsg(null)} 
                        className="text-red-400 hover:text-red-600 hover:bg-red-100 p-1.5 rounded-lg transition self-start"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
