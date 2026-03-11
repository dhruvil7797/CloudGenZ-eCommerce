import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCustomerOrders, updateCustomer } from '../api/woocommerce';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, MapPin, LogOut, ChevronRight, CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react';

const STATUS_MAP = {
    pending: { label: 'Pending Payment', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', Icon: Clock },
    processing: { label: 'Processing', color: 'text-blue-700 bg-blue-50 border-blue-200', Icon: Package },
    'on-hold': { label: 'On Hold', color: 'text-orange-700 bg-orange-50 border-orange-200', Icon: AlertCircle },
    completed: { label: 'Completed', color: 'text-green-700 bg-green-50 border-green-200', Icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'text-red-700 bg-red-50 border-red-200', Icon: AlertCircle },
    shipped: { label: 'Shipped', color: 'text-brand-primary bg-[#e8f5e9] border-[#2e7d32]/20', Icon: Truck },
};

const CANADA_PROVINCES = [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'YT', name: 'Yukon' }
];



const tabs = [
    { id: 'orders', label: 'My Orders', Icon: Package },
    { id: 'profile', label: 'My Profile', Icon: User },
    { id: 'address', label: 'Addresses', Icon: MapPin },
];

export default function Account() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.billing?.email || user?.email || '',
        phone: user?.billing?.phone || ''
    });
    const [addressData, setAddressData] = useState({
        address1: user?.billing?.address_1 || '',
        city: user?.billing?.city || '',
        state: user?.billing?.state || '',
        postcode: user?.billing?.postcode || '',
        country: user?.billing?.country || 'CA'
    });

    useEffect(() => {
        if (!user) { navigate('/auth'); return; }
        const load = async () => {
            setOrdersLoading(true);
            const data = await fetchCustomerOrders(user.id);
            setOrders(data);
            setOrdersLoading(false);
        };
        load();
    }, [user]);

    const handleProfileSave = async () => {
        setSaveLoading(true);
        try {
            const updated = await updateCustomer(user.id, {
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                billing: { ...user.billing, phone: profileData.phone, email: profileData.email }
            });
            login(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (e) {
            console.error(e);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleAddressSave = async () => {
        setSaveLoading(true);
        try {
            const updated = await updateCustomer(user.id, {
                billing: { ...user.billing, address_1: addressData.address1, city: addressData.city, state: addressData.state, postcode: addressData.postcode, country: addressData.country },
                shipping: { ...user.shipping, address_1: addressData.address1, city: addressData.city, state: addressData.state, postcode: addressData.postcode, country: addressData.country }
            });
            login(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (e) {
            console.error(e);
        } finally {
            setSaveLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-[#fefdf8] min-h-screen py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#1e2520]/10">
                    <div>
                        <p className="eyebrow">My Account</p>
                        <h1 className="font-serif text-4xl font-bold text-brand-secondary leading-tight">
                            {user.first_name ? `Welcome back, ${user.first_name}.` : 'My Account'}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <aside className="w-full md:w-56 shrink-0">
                        <nav className="bg-white rounded-xl border border-[#1e2520]/10 overflow-hidden shadow-sm">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-left transition-all border-l-2 ${activeTab === tab.id ? 'border-brand-primary text-brand-primary bg-[#e8f5e9]/50' : 'border-transparent text-[#4a5e4d] hover:text-brand-primary hover:bg-[#f5f8f5]'}`}
                                >
                                    <tab.Icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="flex-1">
                        {/* ORDERS TAB */}
                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-xl border border-[#1e2520]/10 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-[#1e2520]/10">
                                    <h2 className="font-serif text-2xl font-bold text-brand-secondary">Order History</h2>
                                    <p className="text-sm text-[#4a5e4d] mt-1">Track and review all your past purchases.</p>
                                </div>
                                {ordersLoading ? (
                                    <div className="flex justify-center py-16">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Package className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                        <p className="text-[#4a5e4d] font-medium">No orders yet.</p>
                                        <Link to="/" className="text-brand-primary font-bold text-sm hover:underline mt-2 inline-block">Start Shopping →</Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#1e2520]/5">
                                        {orders.map(order => {
                                            const status = STATUS_MAP[order.status] || { label: order.status, color: 'text-gray-700 bg-gray-50 border-gray-200', Icon: Package };
                                            return (
                                                <Link to={`/order/${order.id}`} key={order.id} className="block p-6 hover:bg-[#f5f8f5] transition-all duration-200 group cursor-pointer">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-serif text-lg font-bold text-brand-secondary">Order #{order.id}</span>
                                                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                                                                <status.Icon size={11} /> {status.label}
                                                            </span>
                                                        </div>
                                                        <div className="text-right flex items-center gap-4">
                                                            <div>
                                                                <p className="font-serif text-xl font-bold text-[#d4a017]">${order.total}</p>
                                                                <p className="text-xs text-[#4a5e4d]">{new Date(order.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                            </div>
                                                            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                                View <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                            </div>
                                                            {order.status === 'pending' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        navigate(`/checkout?order=${order.id}`);
                                                                    }}
                                                                    className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-md hover:bg-[#1b5e20] transition-colors whitespace-nowrap"
                                                                >
                                                                    Pay Now
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-xl border border-[#1e2520]/10 shadow-sm p-8">
                                <h2 className="font-serif text-2xl font-bold text-brand-secondary mb-6">Profile Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    {[
                                        { label: 'First Name', key: 'firstName' },
                                        { label: 'Last Name', key: 'lastName' },
                                        { label: 'Email', key: 'email', type: 'email' },
                                        { label: 'Phone', key: 'phone', type: 'tel' }
                                    ].map(({ label, key, type = 'text' }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">{label}</label>
                                            <input
                                                type={type}
                                                value={profileData[key]}
                                                onChange={e => setProfileData({ ...profileData, [key]: e.target.value })}
                                                className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-[#f5f8f5] focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-brand-secondary font-medium text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleProfileSave} disabled={saveLoading} className="btn-primary gap-2 disabled:opacity-60">
                                    {saveLoading ? 'Saving…' : saveSuccess ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Changes'}
                                </button>
                            </div>
                        )}

                        {/* ADDRESS TAB */}
                        {activeTab === 'address' && (
                            <div className="bg-white rounded-xl border border-[#1e2520]/10 shadow-sm p-8">
                                <h2 className="font-serif text-2xl font-bold text-brand-secondary mb-6">Default Address</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    {[
                                        { label: 'Street Address', key: 'address1', full: true },
                                        { label: 'City', key: 'city' },
                                        { label: 'State', key: 'state' },
                                        { label: 'Postcode', key: 'postcode' },
                                        { label: 'Country', key: 'country' }
                                    ].map(({ label, key, full }) => (
                                        <div key={key} className={full ? 'sm:col-span-2' : ''}>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">{label}</label>
                                            {key === 'country' ? (
                                                <select
                                                    disabled
                                                    value="CA"
                                                    className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-gray-100 text-gray-500 font-medium text-sm appearance-none cursor-not-allowed"
                                                >
                                                    <option value="CA">Canada</option>
                                                </select>
                                            ) : key === 'state' ? (
                                                <select
                                                    value={addressData[key]}
                                                    onChange={e => setAddressData({ ...addressData, [key]: e.target.value })}
                                                    className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-[#f5f8f5] focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-brand-secondary font-medium text-sm appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select Province</option>
                                                    {CANADA_PROVINCES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={addressData[key]}
                                                    onChange={e => setAddressData({ ...addressData, [key]: e.target.value })}
                                                    className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-[#f5f8f5] focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-brand-secondary font-medium text-sm"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleAddressSave} disabled={saveLoading} className="btn-primary gap-2 disabled:opacity-60">
                                    {saveLoading ? 'Saving…' : saveSuccess ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Address'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
