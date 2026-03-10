import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, validateCoupon } from '../api/woocommerce';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Tag, X } from 'lucide-react';

const InputField = ({ label, name, type = 'text', value, onChange, required }) => (
    <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">{label}</label>
        <input
            required={required}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-[#f5f8f5] focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-brand-secondary font-medium placeholder:text-gray-400 text-sm"
        />
    </div>
);

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    // Pre-fill form from logged-in user's saved WooCommerce profile
    const [formData, setFormData] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.billing?.email || user?.email || '',
        phone: user?.billing?.phone || '',
        address1: user?.billing?.address_1 || '',
        city: user?.billing?.city || '',
        state: user?.billing?.state || '',
        postcode: user?.billing?.postcode || '',
        country: user?.billing?.country || 'US'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const getDiscount = () => {
        if (!coupon) return 0;
        if (coupon.discount_type === 'percent') return (getCartTotal() * parseFloat(coupon.amount)) / 100;
        return parseFloat(coupon.amount) || 0;
    };

    const getFinalTotal = () => Math.max(0, getCartTotal() - getDiscount());

    const handleCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const result = await validateCoupon(couponCode.trim());
            setCoupon(result);
        } catch (err) {
            setCouponError(err.message);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setLoading(true);
        setError(null);

        const orderData = {
            payment_method: 'bacs',
            payment_method_title: 'Direct Bank Transfer',
            set_paid: false,
            // ✅ KEY FIX: attach customer_id so the order appears in My Account
            ...(user?.id ? { customer_id: user.id } : {}),
            billing: {
                first_name: formData.firstName, last_name: formData.lastName,
                address_1: formData.address1, city: formData.city,
                state: formData.state, postcode: formData.postcode,
                country: formData.country, email: formData.email, phone: formData.phone
            },
            shipping: {
                first_name: formData.firstName, last_name: formData.lastName,
                address_1: formData.address1, city: formData.city,
                state: formData.state, postcode: formData.postcode, country: formData.country
            },
            line_items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
            ...(coupon ? { coupon_lines: [{ code: couponCode }] } : {})
        };

        try {
            await createOrder(orderData);
            setSuccess(true);
            clearCart();
        } catch (err) {
            setError(err.message || 'Failed to process order.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <div className="bg-white border border-[#1e2520]/10 rounded-xl p-16 shadow-sm max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={42} className="text-brand-primary" />
                    </div>
                    <h2 className="font-serif text-4xl font-bold text-brand-secondary mb-4">Order Confirmed!</h2>
                    <p className="text-[#4a5e4d] text-lg mb-2">Thank you! Your order has been received.</p>
                    <p className="text-[#4a5e4d] mb-10 max-w-md mx-auto text-sm">Check your email for a confirmation. Your purchase directly funds our community programs. 🌱</p>
                    <Link to="/" className="btn-primary px-10 py-4 text-base">Continue Shopping</Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                <h2 className="font-serif text-3xl font-bold text-brand-secondary mb-4">Your cart is empty</h2>
                <Link to="/" className="text-brand-primary font-bold underline">Return to Shop</Link>
            </div>
        );
    }

    return (
        <div className="bg-[#fefdf8] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <Link to="/cart" className="inline-flex items-center text-sm font-semibold text-[#4a5e4d] hover:text-brand-primary transition-colors mb-10 group">
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Return to Cart
                </Link>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Billing Form */}
                    <div className="w-full lg:w-3/5">
                        <h2 className="font-serif text-3xl font-bold text-brand-secondary mb-8">Billing Details</h2>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-5 rounded-xl mb-8 flex items-start gap-3 border border-red-100">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm mb-1">Could not process order</p>
                                    <p className="text-sm opacity-90">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="bg-white p-8 border border-[#1e2520]/10 rounded-xl shadow-sm space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                                <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                            <InputField label="Street Address" name="address1" value={formData.address1} onChange={handleChange} required />
                            <div className="grid grid-cols-2 gap-6">
                                <InputField label="City" name="city" value={formData.city} onChange={handleChange} required />
                                <InputField label="State / Province" name="state" value={formData.state} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <InputField label="Postcode" name="postcode" value={formData.postcode} onChange={handleChange} required />
                                <InputField label="Country" name="country" value={formData.country} onChange={handleChange} required />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 rounded-md bg-brand-primary text-white font-bold text-lg hover:bg-[#1b5e20] transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> Processing...</>
                                ) : `Complete Order · $${getFinalTotal().toFixed(2)}`}
                            </button>
                            <p className="text-center text-xs text-gray-400 font-medium">🔒 Secure checkout · Tax receipts issued</p>
                        </form>
                    </div>

                    {/* Summary Panel */}
                    <div className="w-full lg:w-2/5">
                        <h2 className="font-serif text-3xl font-bold text-brand-secondary mb-6">Your Order</h2>

                        <div className="bg-brand-secondary rounded-xl p-6 text-white mb-4">
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-1 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-700 shrink-0">
                                            <img src={item.images?.[0]?.src} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-semibold text-sm block leading-tight line-clamp-1">{item.name}</span>
                                            <span className="text-white/50 text-xs mt-0.5 block">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="font-serif font-bold text-[#f5c842] shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon */}
                            <div className="border-t border-white/10 pt-5 mb-5">
                                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Promo Code</label>
                                {coupon ? (
                                    <div className="flex items-center justify-between bg-[#2e7d32]/30 border border-[#2e7d32]/50 rounded-md px-4 py-2.5">
                                        <span className="flex items-center gap-2 text-sm font-bold text-[#f5c842]">
                                            <Tag size={14} /> {coupon.code} — {coupon.discount_type === 'percent' ? `${coupon.amount}% Off` : `$${coupon.amount} Off`}
                                        </span>
                                        <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="text-white/40 hover:text-white/80">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="Enter coupon code"
                                                className="flex-1 bg-white/10 border border-white/20 rounded-md px-4 py-2.5 text-white text-sm outline-none focus:border-[#f5c842] placeholder:text-white/30 font-medium"
                                            />
                                            <button type="button" onClick={handleCoupon} disabled={couponLoading} className="bg-[#f5c842] text-brand-secondary font-bold text-sm px-4 py-2.5 rounded-md hover:bg-[#d4a017] transition-colors disabled:opacity-60">
                                                {couponLoading ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                        {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
                                    </>
                                )}
                            </div>

                            <div className="border-t border-white/10 pt-5 space-y-3">
                                <div className="flex justify-between text-white/70 text-sm font-medium">
                                    <span>Subtotal</span><span>${getCartTotal().toFixed(2)}</span>
                                </div>
                                {coupon && (
                                    <div className="flex justify-between text-[#f5c842] text-sm font-medium">
                                        <span>Discount ({coupon.code})</span><span>-${getDiscount().toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-white/70 text-sm font-medium">
                                    <span>Shipping</span><span className="text-[#f5c842]">Free</span>
                                </div>
                                <div className="flex justify-between items-end pt-2 border-t border-white/10">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="font-serif text-3xl font-bold text-[#f5c842]">${getFinalTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-[#4a5e4d] text-center font-medium">Your purchase supports our mission in Ottawa and West Africa. 🌍</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
