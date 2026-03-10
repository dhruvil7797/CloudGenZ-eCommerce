import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <div className="bg-white border border-[#1e2520]/10 rounded-xl p-16 max-w-2xl mx-auto shadow-sm">
                    <ShoppingBag className="mx-auto h-20 w-20 text-gray-200 mb-6" />
                    <h2 className="font-serif text-3xl font-bold text-brand-secondary mb-4">Your cart is empty.</h2>
                    <p className="text-[#4a5e4d] mb-8 max-w-sm mx-auto">Looks like you haven't added anything yet. Every purchase supports our community programs.</p>
                    <Link to="/" className="btn-primary px-10 py-4 text-base">
                        <ArrowLeft size={16} /> Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fefdf8] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <h1 className="font-serif text-4xl font-bold text-brand-secondary mb-2">Shopping Cart</h1>
                <p className="text-[#4a5e4d] mb-10 pb-6 border-b border-[#1e2520]/10">
                    {cart.reduce((t, i) => t + i.quantity, 0)} item(s) — Every purchase funds a mission.
                </p>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Items */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="group flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-xl border border-[#1e2520]/10 hover:shadow-md transition-shadow">
                                <Link to={`/product/${item.id}`} className="w-full sm:w-28 h-28 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden block">
                                    <img
                                        src={item.images?.[0]?.src}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </Link>

                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase block mb-1">
                                                {item.categories?.[0]?.name || "New Arrival"}
                                            </span>
                                            <Link to={`/product/${item.id}`}>
                                                <h3 className="font-serif text-xl font-bold text-brand-secondary hover:text-brand-primary transition-colors line-clamp-2">
                                                    {item.name}
                                                </h3>
                                            </Link>
                                        </div>
                                        <div className="font-serif text-xl font-bold text-brand-secondary whitespace-nowrap">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-4">
                                        <div className="flex items-center border border-[#1e2520]/20 rounded-md overflow-hidden h-9 w-28 bg-white">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 h-full hover:bg-gray-50 hover:text-brand-primary text-gray-500 transition-colors">
                                                <Minus size={13} />
                                            </button>
                                            <span className="flex-1 text-center font-bold text-sm">{item.quantity}</span>
                                            <button 
                                                disabled={item.stock_quantity !== null && item.stock_quantity !== undefined && item.quantity >= item.stock_quantity}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                                className="px-3 h-full hover:bg-gray-50 hover:text-brand-primary text-gray-500 transition-colors disabled:opacity-50"
                                            >
                                                <Plus size={13} />
                                            </button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t border-[#1e2520]/10">
                            <Link to="/" className="text-brand-primary font-bold text-sm inline-flex items-center hover:underline">
                                <ArrowLeft size={14} className="mr-2" /> Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-brand-secondary text-white rounded-xl p-8 lg:sticky lg:top-28">
                            <h3 className="font-serif text-2xl font-bold mb-6 pb-4 border-b border-white/10">Order Summary</h3>

                            <div className="space-y-4 font-medium">
                                <div className="flex justify-between text-white/70">
                                    <span>Subtotal ({cart.reduce((t, i) => t + i.quantity, 0)} items)</span>
                                    <span className="text-white font-bold">${getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white/70 pb-4 border-b border-white/10">
                                    <span>Shipping</span>
                                    <span className="text-[#f5c842] font-bold">Free</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-xl font-bold">Total</span>
                                    <span className="font-serif text-3xl font-bold text-[#f5c842]">${getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full mt-8 py-4 bg-brand-primary text-white font-bold rounded-md flex justify-center items-center gap-2 hover:bg-[#1b5e20] transition-all duration-300 shadow-lg hover:shadow-xl group"
                            >
                                Proceed to Checkout
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
                                <span>🔒</span> Secure, Encrypted Checkout
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
