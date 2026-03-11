import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOrder } from '../api/woocommerce';
import {
    ArrowLeft, Package, CheckCircle2, Clock, Truck, AlertCircle,
    CreditCard, MapPin, User, Mail, Phone, Hash, Calendar,
    ShieldCheck, FileText, ChevronRight
} from 'lucide-react';

// ─── Status mapping ──────────────────────────────────────────
const STATUS_MAP = {
    pending:    { label: 'Pending Payment', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', accent: '#ca8a04', Icon: Clock },
    processing: { label: 'Processing',     color: 'text-blue-700 bg-blue-50 border-blue-200',     accent: '#2563eb', Icon: Package },
    'on-hold':  { label: 'On Hold',        color: 'text-orange-700 bg-orange-50 border-orange-200', accent: '#ea580c', Icon: AlertCircle },
    completed:  { label: 'Completed',      color: 'text-green-700 bg-green-50 border-green-200',   accent: '#16a34a', Icon: CheckCircle2 },
    cancelled:  { label: 'Cancelled',      color: 'text-red-700 bg-red-50 border-red-200',         accent: '#dc2626', Icon: AlertCircle },
    refunded:   { label: 'Refunded',       color: 'text-purple-700 bg-purple-50 border-purple-200', accent: '#7c3aed', Icon: AlertCircle },
    failed:     { label: 'Failed',         color: 'text-red-700 bg-red-50 border-red-200',         accent: '#dc2626', Icon: AlertCircle },
    shipped:    { label: 'Shipped',        color: 'text-brand-primary bg-[#e8f5e9] border-[#2e7d32]/20', accent: '#2e7d32', Icon: Truck },
};

// ─── Order Progress steps ────────────────────────────────────
const PROGRESS_STEPS = [
    { key: 'pending',    label: 'Ordered' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped',    label: 'Shipped' },
    { key: 'completed',  label: 'Delivered' },
];

function getProgressIndex(status) {
    if (status === 'completed') return 3;
    if (status === 'shipped') return 2;
    if (status === 'processing') return 1;
    return 0;
}

// ─── Info Card component ─────────────────────────────────────
const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-xl border border-[#1e2520]/8 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2520]/6 bg-gradient-to-r from-[#f5f8f5] to-transparent">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Icon size={16} className="text-brand-primary" />
            </div>
            <h3 className="font-serif text-lg font-bold text-brand-secondary">{title}</h3>
        </div>
        <div className="px-6 py-5">{children}</div>
    </div>
);

// ─── Detail Row component ────────────────────────────────────
const DetailRow = ({ label, value, mono }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-dashed border-[#1e2520]/6 last:border-0">
        <span className="text-xs font-bold uppercase tracking-widest text-[#4a5e4d]/70">{label}</span>
        <span className={`text-sm font-semibold text-brand-secondary text-right max-w-[60%] ${mono ? 'font-mono text-xs' : ''}`}>
            {value || '—'}
        </span>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// OrderDetail — full order page with all info
// ═══════════════════════════════════════════════════════════════
export default function OrderDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/auth'); return; }
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchOrder(id);
                if (!data) throw new Error('Order not found');
                setOrder(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user]);

    // ─── Loading state ───────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-[#fefdf8] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-[#4a5e4d] font-medium">Loading order details…</p>
                </div>
            </div>
        );
    }

    // ─── Error state ─────────────────────────────────────────
    if (error || !order) {
        return (
            <div className="bg-[#fefdf8] min-h-screen flex items-center justify-center px-4">
                <div className="text-center bg-white rounded-xl border border-[#1e2520]/10 p-12 shadow-sm max-w-md">
                    <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="font-serif text-2xl font-bold text-brand-secondary mb-2">Order Not Found</h2>
                    <p className="text-[#4a5e4d] text-sm mb-6">{error || 'We couldn\'t find that order.'}</p>
                    <Link to="/account" className="btn-primary">Back to My Orders</Link>
                </div>
            </div>
        );
    }

    const status = STATUS_MAP[order.status] || { label: order.status, color: 'text-gray-700 bg-gray-50 border-gray-200', accent: '#6b7280', Icon: Package };
    const billing = order.billing || {};
    const shipping = order.shipping || {};
    const progressIdx = getProgressIndex(order.status);
    const isCancelledOrFailed = ['cancelled', 'failed', 'refunded'].includes(order.status);

    // Extract Stripe custom fields
    const getMeta = (key) => {
        const m = order.meta_data?.find(m => m.key === key);
        return m?.value || null;
    };

    return (
        <div className="bg-[#fefdf8] min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

                {/* ─── Breadcrumb ──────────────────────────── */}
                <Link to="/account" className="inline-flex items-center text-sm font-semibold text-[#4a5e4d] hover:text-brand-primary transition-colors mb-8 group">
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to My Orders
                </Link>

                {/* ═══ ORDER HEADER ═══════════════════════════ */}
                <div className="bg-white rounded-2xl border border-[#1e2520]/8 shadow-sm overflow-hidden mb-8">
                    {/* Top accent bar */}
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${status.accent}, ${status.accent}88)` }} />

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="eyebrow !mb-2">Order Details</p>
                                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-secondary flex items-center gap-3">
                                    Order #{order.id}
                                </h1>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border ${status.color}`}>
                                    <status.Icon size={14} /> {status.label}
                                </span>
                                <p className="text-xs text-[#4a5e4d] mt-2 flex items-center gap-1 justify-end">
                                    <Calendar size={12} />
                                    {new Date(order.date_created).toLocaleDateString('en-US', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                                {order.status === 'pending' && (
                                    <Link
                                        to={`/checkout?order=${order.id}`}
                                        className="mt-3 inline-block px-5 py-2 bg-brand-primary text-white text-sm font-bold rounded hover:bg-[#1b5e20] transition-colors"
                                    >
                                        Pay Now
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* ─── Progress Tracker ─────────────── */}
                        {!isCancelledOrFailed && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between relative">
                                    {/* Background line */}
                                    <div className="absolute top-5 left-[10%] right-[10%] h-[3px] bg-gray-200 rounded-full" />
                                    <div
                                        className="absolute top-5 left-[10%] h-[3px] rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: `${(progressIdx / (PROGRESS_STEPS.length - 1)) * 80}%`,
                                            background: `linear-gradient(90deg, ${status.accent}, ${status.accent}cc)`,
                                        }}
                                    />

                                    {PROGRESS_STEPS.map((step, idx) => {
                                        const isActive = idx <= progressIdx;
                                        const isCurrent = idx === progressIdx;
                                        return (
                                            <div key={step.key} className="relative z-10 flex flex-col items-center" style={{ width: '25%' }}>
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ${
                                                        isCurrent
                                                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-110'
                                                            : isActive
                                                                ? 'bg-brand-primary border-brand-primary text-white'
                                                                : 'bg-white border-gray-200 text-gray-400'
                                                    }`}
                                                >
                                                    {isActive && idx < progressIdx ? (
                                                        <CheckCircle2 size={18} />
                                                    ) : (
                                                        idx + 1
                                                    )}
                                                </div>
                                                <span className={`text-[11px] font-bold mt-2 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* ═══ MAIN GRID ══════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ─── LEFT: Items + Payment ─────────────── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ORDER ITEMS */}
                        <InfoCard icon={Package} title="Order Items">
                            <div className="divide-y divide-[#1e2520]/5">
                                {order.line_items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f8f5] border border-[#1e2520]/8 shrink-0">
                                            {item.image?.src ? (
                                                <img src={item.image.src} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-brand-secondary text-sm leading-tight line-clamp-2">{item.name}</p>
                                            <p className="text-xs text-[#4a5e4d] mt-1">
                                                Qty: <span className="font-bold">{item.quantity}</span>
                                                {item.sku && <> · SKU: <span className="font-mono">{item.sku}</span></>}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-serif text-lg font-bold text-[#d4a017]">${parseFloat(item.total).toFixed(2)}</p>
                                            {item.quantity > 1 && (
                                                <p className="text-[10px] text-[#4a5e4d]">${parseFloat(item.price).toFixed(2)} each</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-6 pt-4 border-t border-[#1e2520]/10 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#4a5e4d]">Subtotal</span>
                                    <span className="font-semibold">${(parseFloat(order.total) + parseFloat(order.discount_total || 0) - parseFloat(order.total_tax) - parseFloat(order.shipping_total || 0)).toFixed(2)}</span>
                                </div>
                                {parseFloat(order.shipping_total) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#4a5e4d]">Shipping</span>
                                        <span className="font-semibold">${parseFloat(order.shipping_total).toFixed(2)}</span>
                                    </div>
                                )}
                                {parseFloat(order.discount_total) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#4a5e4d]">Discount</span>
                                        <span className="font-semibold text-brand-primary">-${parseFloat(order.discount_total).toFixed(2)}</span>
                                    </div>
                                )}
                                {parseFloat(order.total_tax) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#4a5e4d]">Tax</span>
                                        <span className="font-semibold">${parseFloat(order.total_tax).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-[#1e2520]/10">
                                    <span className="text-base font-bold text-brand-secondary">Total</span>
                                    <span className="font-serif text-2xl font-bold text-[#d4a017]">${parseFloat(order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </InfoCard>

                        {/* PAYMENT INFO - Hide if order is pending (no payment yet) */}
                        {order.status !== 'pending' && (
                            <InfoCard icon={CreditCard} title="Payment Information">
                                <DetailRow label="Method" value={order.payment_method_title || order.payment_method || 'N/A'} />
                                <DetailRow label="Transaction ID" value={order.transaction_id} mono />
                                {order.date_paid && (
                                    <DetailRow label="Paid On" value={new Date(order.date_paid).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })} />
                                )}
                                {/* Stripe Custom Fields */}
                                {getMeta('Stripe Payment ID') && (
                                    <>
                                        <DetailRow label="Card Brand" value={(getMeta('Stripe Card Brand') || '').toUpperCase()} />
                                        <DetailRow label="Card Last 4" value={getMeta('Stripe Card Last 4') ? `•••• ${getMeta('Stripe Card Last 4')}` : null} />
                                    </>
                                )}
                            </InfoCard>
                        )}
                    </div>

                    {/* ─── RIGHT: Billing, Shipping, Notes ──── */}
                    <div className="space-y-6">

                        {/* BILLING */}
                        <InfoCard icon={User} title="Billing Details">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                        <User size={16} className="text-brand-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-brand-secondary text-sm">
                                            {billing.first_name} {billing.last_name}
                                        </p>
                                        {billing.company && (
                                            <p className="text-xs text-[#4a5e4d]">{billing.company}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2">
                                    {billing.email && (
                                        <div className="flex items-center gap-2 text-sm text-[#4a5e4d]">
                                            <Mail size={13} className="text-brand-primary/60 shrink-0" />
                                            <span className="truncate">{billing.email}</span>
                                        </div>
                                    )}
                                    {billing.phone && (
                                        <div className="flex items-center gap-2 text-sm text-[#4a5e4d]">
                                            <Phone size={13} className="text-brand-primary/60 shrink-0" />
                                            <span>{billing.phone}</span>
                                        </div>
                                    )}
                                    {billing.address_1 && (
                                        <div className="flex items-start gap-2 text-sm text-[#4a5e4d]">
                                            <MapPin size={13} className="text-brand-primary/60 shrink-0 mt-0.5" />
                                            <div>
                                                <p>{billing.address_1}</p>
                                                {billing.address_2 && <p>{billing.address_2}</p>}
                                                <p>{[billing.city, billing.state, billing.postcode].filter(Boolean).join(', ')}</p>
                                                <p className="font-medium">{billing.country}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </InfoCard>

                        {/* SHIPPING */}
                        <InfoCard icon={Truck} title="Shipping Address">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                                        <MapPin size={16} className="text-brand-primary" />
                                    </div>
                                    <p className="font-bold text-brand-secondary text-sm">
                                        {shipping.first_name} {shipping.last_name}
                                    </p>
                                </div>

                                {shipping.address_1 ? (
                                    <div className="bg-[#f5f8f5] rounded-lg p-4 text-sm text-[#4a5e4d] leading-relaxed">
                                        <p>{shipping.address_1}</p>
                                        {shipping.address_2 && <p>{shipping.address_2}</p>}
                                        <p>{[shipping.city, shipping.state, shipping.postcode].filter(Boolean).join(', ')}</p>
                                        <p className="font-semibold text-brand-secondary">{shipping.country}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#4a5e4d] italic">Same as billing address</p>
                                )}

                                {/* Shipping method */}
                                {order.shipping_lines?.length > 0 && (
                                    <div className="pt-2 border-t border-[#1e2520]/6">
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#4a5e4d]/70 mb-1">Method</p>
                                        <p className="text-sm font-semibold text-brand-secondary">
                                            {order.shipping_lines[0].method_title}
                                            {parseFloat(order.shipping_lines[0].total) > 0 && (
                                                <span className="text-[#d4a017] ml-2">${parseFloat(order.shipping_lines[0].total).toFixed(2)}</span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </InfoCard>

                        {/* ORDER NOTES / CUSTOMER NOTE */}
                        {order.customer_note && (
                            <InfoCard icon={FileText} title="Order Notes">
                                <div className="bg-[#fffbeb] border border-[#f5c842]/30 rounded-lg p-4 text-sm text-[#4a5e4d]">
                                    <p>{order.customer_note}</p>
                                </div>
                            </InfoCard>
                        )}

                        {/* ACTIONS */}
                        <div className="flex flex-col gap-2">
                            <Link to="/account" className="btn-primary w-full justify-center">
                                <ArrowLeft size={14} /> Back to Orders
                            </Link>
                            <Link to="/" className="btn-secondary w-full justify-center">
                                Continue Shopping <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
