import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, updateOrder, validateCoupon } from '../api/woocommerce';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Tag, X, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

// ─── Stripe init (loads once, reused) ────────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// ─── Input component ────────────────────────────────────────
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

// ─── Stripe Split Element custom styling ─────────────────────
const ELEMENT_STYLE = {
    style: {
        base: {
            fontSize: '15px',
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            color: '#1e2520',
            '::placeholder': { color: '#9ca3af' },
            fontWeight: '500',
            lineHeight: '24px',
        },
        invalid: {
            color: '#dc2626',
            iconColor: '#dc2626',
        },
    },
};

const CARD_NUMBER_OPTIONS = {
    ...ELEMENT_STYLE,
    showIcon: true,  // Shows Visa / MC / Amex icon inline
    iconStyle: 'solid',
};

const CARD_EXPIRY_OPTIONS = { ...ELEMENT_STYLE };
const CARD_CVC_OPTIONS = { ...ELEMENT_STYLE };

// ─── Country list (ISO 3166-1 alpha-2) ───────────────────────
const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'AT', name: 'Austria' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'IE', name: 'Ireland' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'SG', name: 'Singapore' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'CN', name: 'China' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'PH', name: 'Philippines' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'RO', name: 'Romania' },
    { code: 'HU', name: 'Hungary' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GR', name: 'Greece' },
    { code: 'TR', name: 'Turkey' },
    { code: 'IL', name: 'Israel' },
    { code: 'RU', name: 'Russia' },
    { code: 'UA', name: 'Ukraine' },
].sort((a, b) => a.name.localeCompare(b.name));

// ═══════════════════════════════════════════════════════════════
// StripePaymentForm — inner component that has access to Stripe
// ═══════════════════════════════════════════════════════════════
function StripePaymentForm({ orderData, pendingOrder, finalTotal, onSuccess, onError, onBack }) {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [cardError, setCardError] = useState('');
    // Track completion of each split field
    const [fieldStatus, setFieldStatus] = useState({ number: false, expiry: false, cvc: false });
    const cardComplete = fieldStatus.number && fieldStatus.expiry && fieldStatus.cvc;

    const handleFieldChange = (field) => (e) => {
        setFieldStatus(prev => ({ ...prev, [field]: e.complete }));
        if (e.error) setCardError(e.error.message);
        else setCardError('');
    };

    const handlePay = async () => {
        if (!stripe || !elements || !pendingOrder) return;
        setPaying(true);
        setCardError('');

        try {
            // ─── Step 2: Create Stripe PaymentMethod from card ───────────
            const cardNumberElement = elements.getElement(CardNumberElement);
            const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardNumberElement,
                billing_details: {
                    name: `${orderData.billing.first_name} ${orderData.billing.last_name}`,
                    email: orderData.billing.email,
                    phone: orderData.billing.phone,
                    address: {
                        line1: orderData.billing.address_1,
                        city: orderData.billing.city,
                        state: orderData.billing.state,
                        postal_code: orderData.billing.postcode,
                        country: orderData.billing.country,
                    },
                },
            });

            if (pmError) {
                // Order already created — mark as failed
                await updateOrder(pendingOrder.id, {
                    status: 'failed',
                    meta_data: [{ key: '_stripe_error', value: pmError.message }],
                }).catch(() => {});
                throw new Error(pmError.message);
            }

            // ─── Step 3: Update WooCommerce order → processing ───────────
            // NOTE: In production, you should create a PaymentIntent on your backend,
            // get the client_secret, and use stripe.confirmCardPayment() to complete payment.
            // For this demo without a backend, we treat PaymentMethod creation as success.
            
            // Generate a reference ID for tracking
            const orderReference = `ORD-${pendingOrder.id}-${Date.now()}`;
            
            const updatedOrder = await updateOrder(pendingOrder.id, {
                status: 'processing',
                set_paid: true,
                transaction_id: paymentMethod.id, // This shows in WooCommerce as transaction ID
                meta_data: [
                    // Keys WITHOUT '_' prefix → visible as Custom Fields in WooCommerce Admin
                    { key: 'Stripe Payment ID', value: paymentMethod.id },
                    { key: 'Stripe Payment Type', value: paymentMethod.type },
                    { key: 'Stripe Card Brand', value: paymentMethod.card?.brand || 'unknown' },
                    { key: 'Stripe Card Last 4', value: paymentMethod.card?.last4 || '' },
                    { key: 'Stripe Customer Email', value: orderData.billing.email },
                    { key: 'Payment Reference', value: orderReference },
                    { key: 'Payment Date', value: new Date().toISOString() },
                ],
            });

            onSuccess(updatedOrder);

        } catch (err) {
            console.error('Stripe payment error:', err);
            setCardError(err.message || 'Payment failed. Please try again.');
            onError(err.message);
        } finally {
            setPaying(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                <h3 className="font-serif text-2xl font-bold text-brand-secondary">Payment Details</h3>
            </div>

            <div className="bg-white p-8 border border-[#1e2520]/10 rounded-xl shadow-sm">
                {/* Security badge */}
                <div className="flex items-center gap-2 mb-6 bg-[#e8f5e9] rounded-lg px-4 py-3">
                    <ShieldCheck size={18} className="text-brand-primary" />
                    <span className="text-sm font-semibold text-brand-primary">Secure payment powered by Stripe</span>
                </div>

                {/* Card Number */}
                <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">
                        Card Number
                    </label>
                    <div className="border border-[#1e2520]/15 rounded-lg px-4 py-3.5 bg-[#f5f8f5] focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-transparent transition-all">
                        <CardNumberElement
                            options={CARD_NUMBER_OPTIONS}
                            onChange={handleFieldChange('number')}
                        />
                    </div>
                </div>

                {/* Expiry + CVC side by side */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">
                            Expiry Date
                        </label>
                        <div className="border border-[#1e2520]/15 rounded-lg px-4 py-3.5 bg-[#f5f8f5] focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-transparent transition-all">
                            <CardExpiryElement
                                options={CARD_EXPIRY_OPTIONS}
                                onChange={handleFieldChange('expiry')}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">
                            CVC
                        </label>
                        <div className="border border-[#1e2520]/15 rounded-lg px-4 py-3.5 bg-[#f5f8f5] focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-transparent transition-all">
                            <CardCvcElement
                                options={CARD_CVC_OPTIONS}
                                onChange={handleFieldChange('cvc')}
                            />
                        </div>
                    </div>
                </div>

                {/* Card error */}
                {cardError && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-5 flex items-center gap-3 border border-red-100 text-sm">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="font-semibold">{cardError}</span>
                    </div>
                )}

                {/* Accepted cards row */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Accepted:</span>
                    {['VISA', 'MC', 'AMEX', 'DISC'].map(c => (
                        <span key={c} className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">{c}</span>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={paying}
                        className="sm:w-auto px-6 py-3 rounded-md border border-[#1e2520]/15 text-brand-secondary font-semibold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                        <ArrowLeft size={14} /> Edit Billing
                    </button>

                    <button
                        type="button"
                        onClick={handlePay}
                        disabled={paying || !stripe || !cardComplete}
                        className="flex-1 py-4 rounded-md bg-brand-primary text-white font-bold text-base hover:bg-[#1b5e20] transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {paying ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                Processing Payment...
                            </>
                        ) : (
                            <>
                                <Lock size={16} />
                                Pay ${finalTotal}
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center text-xs text-gray-400 font-medium mt-4">
                    🔒 Your payment info is encrypted and never stored on our servers.
                </p>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Main Checkout — orchestrates Billing → Payment → Success
// ═══════════════════════════════════════════════════════════════
export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Flow steps: 'billing' → 'payment' → 'success'
    const [step, setStep] = useState('billing');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    // Coupon
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    // Pre-fill form from logged-in user profile
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

    // ─── Billing form submit → create pending order → proceed to payment ────────────
    const handleBillingSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsCreatingOrder(true);

        try {
            const orderData = buildOrderData();
            // Step 1: Create WooCommerce order with status = 'pending'
            const wcOrder = await createOrder({
                ...orderData,
                status: 'pending',
                payment_method: 'stripe',
                payment_method_title: 'Credit Card (Stripe)',
                set_paid: false,
            });

            if (!wcOrder || !wcOrder.id) {
                throw new Error('Failed to create order in WooCommerce.');
            }

            setPendingOrder(wcOrder);
            setStep('payment');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.message || 'Failed to initialize payment.');
        } finally {
            setIsCreatingOrder(false);
        }
    };

    // Build order data to pass to Stripe form
    const buildOrderData = () => {
        return {
        ...(user?.id ? { customer_id: user.id } : {}),
        billing: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            address_1: formData.address1,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
            email: formData.email,
            phone: formData.phone,
        },
        shipping: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            address_1: formData.address1,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
        },
        line_items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
        ...(coupon ? { coupon_lines: [{ code: couponCode }] } : {}),
    };
    };

    // ─── Success callback from StripePaymentForm ─────────────
    const handlePaymentSuccess = (wcOrder) => {
        setCompletedOrder(wcOrder);
        setStep('success');
        clearCart();
    };

    // Extract payment reference from order meta data
    const getPaymentReference = () => {
        if (!completedOrder?.meta_data) return null;
        const refMeta = completedOrder.meta_data.find(m => m.key === 'Stripe Payment ID');
        return refMeta?.value || null;
    };

    // ══════════════════════════════════════════════════════════
    // RENDER: Success State
    // ══════════════════════════════════════════════════════════
    if (step === 'success') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <div className="bg-white border border-[#1e2520]/10 rounded-xl p-12 sm:p-16 shadow-sm max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={42} className="text-brand-primary" />
                    </div>
                    <h2 className="font-serif text-4xl font-bold text-brand-secondary mb-4">Payment Confirmed!</h2>
                    <p className="text-[#4a5e4d] text-lg mb-2">Thank you! Your order has been placed successfully.</p>
                    {completedOrder?.id && (
                        <p className="text-brand-primary font-bold text-sm mb-2">Order #{completedOrder.id}</p>
                    )}
                    {getPaymentReference() && (
                        <p className="text-gray-500 text-xs mb-2">Payment Reference: {getPaymentReference()}</p>
                    )}
                    <p className="text-[#4a5e4d] mb-10 max-w-md mx-auto text-sm">
                        A confirmation email has been sent to <strong>{formData.email}</strong>. Your order is now being processed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/" className="btn-primary px-10 py-4 text-base">Continue Shopping</Link>
                        {completedOrder?.id && (
                            <Link to={`/order/${completedOrder.id}`} className="btn-secondary px-8 py-4 text-base">View Order Details</Link>
                        )}
                        {user && (
                            <Link to="/account" className="inline-flex items-center justify-center gap-2 border border-[#1e2520]/15 text-brand-secondary py-4 px-8 rounded-md font-semibold text-base transition-all duration-200 hover:bg-gray-50">All Orders</Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════
    // RENDER: Empty Cart
    // ══════════════════════════════════════════════════════════
    if (cart.length === 0 && step !== 'success') {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                <h2 className="font-serif text-3xl font-bold text-brand-secondary mb-4">Your cart is empty</h2>
                <Link to="/" className="text-brand-primary font-bold underline">Return to Shop</Link>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════
    // RENDER: Checkout (billing + payment steps)
    // ══════════════════════════════════════════════════════════
    return (
        <div className="bg-[#fefdf8] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <Link to="/cart" className="inline-flex items-center text-sm font-semibold text-[#4a5e4d] hover:text-brand-primary transition-colors mb-8 group">
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Return to Cart
                </Link>

                {/* ── Step indicator bar ──────────────────────── */}
                <div className="flex items-center gap-4 mb-10">
                    <div className={`flex items-center gap-2 ${step === 'billing' ? 'text-brand-primary' : 'text-brand-primary'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'billing' ? 'bg-brand-primary text-white' : 'bg-[#e8f5e9] text-brand-primary'}`}>1</div>
                        <span className="text-sm font-bold">Billing</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-gray-200"><div className={`h-full bg-brand-primary transition-all duration-500 ${step === 'payment' ? 'w-full' : 'w-0'}`} /></div>
                    <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-brand-primary' : 'text-gray-400'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
                        <span className="text-sm font-bold">Payment</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* ═══ LEFT COLUMN: Billing / Payment Form ═══════ */}
                    <div className="w-full lg:w-3/5">

                        {error && (
                            <div className="bg-red-50 text-red-700 p-5 rounded-xl mb-8 flex items-start gap-3 border border-red-100">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm mb-1">Could not process order</p>
                                    <p className="text-sm opacity-90">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 1: Billing Details ────────── */}
                        {step === 'billing' && (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                                    <h2 className="font-serif text-2xl font-bold text-brand-secondary">Billing Details</h2>
                                </div>

                                <form onSubmit={handleBillingSubmit} className="bg-white p-8 border border-[#1e2520]/10 rounded-xl shadow-sm space-y-6">
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
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">Country</label>
                                            <select
                                                required
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-[#f5f8f5] focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-brand-secondary font-medium text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Country</option>
                                                {COUNTRIES.map(c => (
                                                    <option key={c.code} value={c.code}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isCreatingOrder}
                                        className="w-full py-4 rounded-md bg-brand-primary text-white font-bold text-base hover:bg-[#1b5e20] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mt-4 group disabled:opacity-60"
                                    >
                                        {isCreatingOrder ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                                Creating Order...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={18} />
                                                Continue to Payment
                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-gray-400 font-medium">🔒 Secure checkout · All data encrypted</p>
                                </form>
                            </>
                        )}

                        {/* ─── STEP 2: Stripe Payment ────────── */}
                        {step === 'payment' && pendingOrder && (
                            <Elements stripe={stripePromise}>
                                <StripePaymentForm
                                    orderData={buildOrderData()}
                                    pendingOrder={pendingOrder}
                                    finalTotal={getFinalTotal().toFixed(2)}
                                    onSuccess={handlePaymentSuccess}
                                    onError={(msg) => setError(msg)}
                                    onBack={() => { setStep('billing'); setError(null); }}
                                />
                            </Elements>
                        )}
                    </div>

                    {/* ═══ RIGHT COLUMN: Order Summary ═══════════════ */}
                    <div className="w-full lg:w-2/5">
                        <h2 className="font-serif text-2xl font-bold text-brand-secondary mb-6">Your Order</h2>

                        <div className="bg-brand-secondary rounded-xl p-6 text-white mb-4">
                            {/* Cart items */}
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

                            {/* Totals */}
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

                        {/* Payment method indicator */}
                        <div className="bg-white border border-[#1e2520]/10 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#635bff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CreditCard size={20} className="text-[#635bff]" />
                            </div>
                            <div>
                                <p className="font-bold text-brand-secondary text-sm">Paying with Stripe</p>
                                <p className="text-xs text-[#4a5e4d]">Visa, Mastercard, Amex, Discover</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
