import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/woocommerce';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
    ShoppingCart, Star, RefreshCw, Heart, ArrowRight,
    Truck, ShieldCheck, RotateCcw, Headphones, Zap, Tag
} from 'lucide-react';

// ── WooCommerce API sort options ──────────────────────────────
// Maps dropdown values → { orderby, order } accepted by WC REST v3.
// Supported WC orderby values: date | price | title | popularity | id
const SORT_OPTIONS = [
    { label: 'Featured',            value: 'featured',   orderby: 'date',       order: 'desc' },
    { label: 'Newest First',        value: 'newest',     orderby: 'date',       order: 'desc' },
    { label: 'Price: Low to High',  value: 'price_asc',  orderby: 'price',      order: 'asc'  },
    { label: 'Price: High to Low',  value: 'price_desc', orderby: 'price',      order: 'desc' },
    { label: 'Name: A → Z',         value: 'title_asc',  orderby: 'title',      order: 'asc'  },
    { label: 'Best Selling',        value: 'popularity', orderby: 'popularity', order: 'desc' },
];

export default function Home() {
    const [products, setProducts]         = useState([]);
    const [categories, setCategories]     = useState([]);
    const [loading, setLoading]           = useState(true);
    const [sortLoading, setSortLoading]   = useState(false); // lightweight spinner for sort/filter changes
    const [error, setError]               = useState(null);
    const [heroProduct, setHeroProduct]   = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortKey, setSortKey]           = useState('featured'); // current sort selection
    const [email, setEmail]               = useState('');
    const [subscribed, setSubscribed]     = useState(false);
    const { addToCart }                   = useCart();
    const { wishlist, toggleWishlist }    = useWishlist();

    // ── Load categories once on mount ─────────────────────────
    const loadCategories = async () => {
        try {
            const catData = await fetchCategories();
            if (Array.isArray(catData))
                setCategories(catData.filter(c => c.name !== 'Uncategorized'));
        } catch (err) {
            console.error('loadCategories:', err);
        }
    };

    // ── Load products — called on mount AND whenever sort/category changes ──
    const loadProducts = async ({ orderby = 'date', order = 'desc', category = '' } = {}) => {
        setSortLoading(true);
        setError(null);
        try {
            const prodData = await fetchProducts({
                orderby,
                order,
                ...(category ? { category } : {}),
                perPage: 20,
            });
            if (Array.isArray(prodData)) {
                setProducts(prodData);
                setHeroProduct(prev => {
                    if (prev) return prev; 
                    const latest = prodData.slice(0, 10);
                    return latest.length > 0 ? latest[Math.floor(Math.random() * latest.length)] : null;
                });
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSortLoading(false);
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadCategories();
        loadProducts(); // default: date desc
    }, []);

    // ── Handle sort dropdown change ──────────────────────────
    const handleSortChange = (value) => {
        setSortKey(value);
        const opt = SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0];
        const catParam = activeCategory === 'all' ? '' : activeCategory;
        loadProducts({ orderby: opt.orderby, order: opt.order, category: catParam });
    };

    // ── Handle category tab change ──────────────────────────
    const handleCategoryChange = (catId) => {
        setActiveCategory(catId);
        const opt = SORT_OPTIONS.find(o => o.value === sortKey) || SORT_OPTIONS[0];
        const catParam = catId === 'all' ? '' : catId;
        loadProducts({ orderby: opt.orderby, order: opt.order, category: catParam });
    };

    // filteredProducts is now always the full API-filtered list (no client-side filtering needed)
    const filteredProducts = products;

    const isWishlisted = (id) => wishlist.some(w => w.id === id);

    const features = [
        { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
        { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected checkout' },
        { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
        { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
    ];

    return (
        <main className="w-full bg-[#fefdf8]">

            {/* ── HERO BANNER ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#1e2520] via-[#2a3528] to-[#1b5e20] min-h-[88vh] flex items-center">
                {/* Background decorative blobs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-brand-primary/20 blur-3xl" />
                    <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full bg-[#f5c842]/10 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] border border-white/[0.04]" />
                </div>

                <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
                    {/* Left: copy */}
                    <div className="order-2 lg:order-1">
                        {/* Promo pill */}
                        <div className="inline-flex items-center gap-2 bg-[#f5c842]/15 border border-[#f5c842]/30 px-4 py-2 rounded-full mb-8">
                            <Zap size={13} className="text-[#f5c842]" />
                            <span className="text-[#f5c842] text-xs font-bold uppercase tracking-widest">Summer Sale — Up to 40% Off</span>
                        </div>

                        <h1 className="font-serif text-[clamp(2.8rem,5.5vw,5.5rem)] font-bold leading-[1.04] text-white mb-6">
                            Shop the<br />
                            <span className="text-[#f5c842]">Latest</span><br />
                            Collection.
                        </h1>
                        <p className="text-white/65 text-lg max-w-[480px] mb-10 leading-relaxed">
                            Discover handcrafted, ethically sourced goods. From apparel to home décor — premium quality delivered to your door.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mb-12">
                            <a href="#store" className="btn-primary px-8 py-4 text-[0.95rem] inline-flex items-center gap-2 shadow-[0_8px_32px_rgba(46,125,50,0.4)]">
                                Shop Now <ArrowRight size={16} />
                            </a>
                            <Link to="/wishlist" className="inline-flex items-center gap-2 text-white/80 font-semibold border-b border-white/30 pb-0.5 hover:text-[#f5c842] hover:border-[#f5c842] transition-colors text-sm">
                                View Wishlist <Heart size={14} />
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-6">
                            {['Free Shipping $50+', 'Secure Checkout', '30-Day Returns'].map(b => (
                                <span key={b} className="flex items-center gap-1.5 text-white/50 text-xs font-semibold">
                                    <ShieldCheck size={12} className="text-brand-primary" /> {b}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: product card showcase */}
                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                        {heroProduct ? (
                            <div className="relative w-full max-w-[420px] group cursor-pointer" onClick={() => { document.getElementById('store')?.scrollIntoView({ behavior: 'smooth' }); }}>
                                {/* Main card */}
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-[#2e7d32]/30 to-[#0a3d0a]/50 border border-white/10">
                                    <img
                                        src={heroProduct.images?.[0]?.src || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop'}
                                        alt={heroProduct.name || "Featured Product"}
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    {/* Overlay badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[#f5c842] text-[#1e2520] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow">
                                            {heroProduct.categories?.[0]?.name || 'New Arrival'}
                                        </span>
                                    </div>
                                    {/* Bottom info strip */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-[#1e2520]/80 backdrop-blur-md p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Featured</p>
                                        <p className="text-white font-serif text-xl font-bold line-clamp-1">{heroProduct.name}</p>
                                        <p className="text-[#f5c842] font-bold text-sm mt-1">Starting at ${heroProduct.price || '0.00'}</p>
                                    </div>
                                </div>

                                {/* Floating stat cards */}
                                <div className="absolute left-2 md:-left-12 top-1/3 bg-white rounded-xl p-3 md:p-4 shadow-xl border border-gray-100 min-w-[120px] md:min-w-[130px] group-hover:-translate-y-2 transition-transform duration-500 delay-75 z-10">
                                    <div className="flex items-center gap-1 text-[#f5c842] mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={11} className={i < Math.round(parseFloat(heroProduct.average_rating) || 5) ? "fill-current" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <p className="text-brand-secondary font-bold text-xs md:text-sm">{'4.8'} / 5.0</p>
                                    <p className="text-gray-400 text-[9px] md:text-[10px] font-semibold">{heroProduct.rating_count || Math.floor(Math.random() * 500 + 100)}+ Reviews</p>
                                </div>
                                
                                {heroProduct.sale_price && heroProduct.regular_price && (
                                    <div className="absolute right-2 md:-right-8 bottom-1/4 bg-[#f5c842] rounded-xl p-3 md:p-4 shadow-xl min-w-[90px] md:min-w-[110px] group-hover:-translate-y-2 transition-transform duration-500 delay-150 z-10">
                                        <Tag size={18} className="text-[#1e2520] mb-1" />
                                        <p className="text-[#1e2520] font-extrabold text-base md:text-lg leading-none">
                                            {Math.round(((heroProduct.regular_price - heroProduct.sale_price) / heroProduct.regular_price) * 100)}%
                                        </p>
                                        <p className="text-[#1e2520]/70 text-[9px] md:text-[10px] font-bold uppercase tracking-wide">Sale Off</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-2xl bg-white/5 animate-pulse border border-white/10" />
                        )}
                    </div>
                </div>
            </section>

            {/* ── ANNOUNCEMENT TICKER ──────────────────────────────────── */}
            <div className="bg-brand-primary flex items-center overflow-hidden border-y border-[#1b5e20]">
                <span className="bg-[#f5c842] text-brand-secondary text-[10px] font-extrabold uppercase tracking-widest px-6 py-3 whitespace-nowrap z-10 shrink-0">
                    🔥 Hot Deals
                </span>
                <div className="whitespace-nowrap px-6 py-3 text-white/90 text-sm font-semibold animate-[tickerScroll_28s_linear_infinite]">
                    🚚 Free shipping on orders over $50 &nbsp;·&nbsp; 🎉 New arrivals every week &nbsp;·&nbsp; 💳 Secure & encrypted payments &nbsp;·&nbsp; 🔄 Easy 30-day returns &nbsp;·&nbsp; ⚡ Flash Sale: Extra 15% off with code <strong>SAVE15</strong> &nbsp;·&nbsp; 🌟 Join 10,000+ happy customers
                </div>
            </div>

            {/* ── FEATURES STRIP ───────────────────────────────────────── */}
            <section className="bg-[#f5f8f5] py-10 border-y border-[#1e2520]/05">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Icon size={20} className="text-brand-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-brand-secondary text-sm">{title}</p>
                                    <p className="text-[#4a5e4d] text-xs">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRODUCT GRID ─────────────────────────────────────────── */}
            <section className="bg-[#fefdf8] py-10 lg:py-12" id="store">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Section header */}
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 border-b border-gray-200 pb-6 gap-6">
                        <div className="w-full text-center md:text-left">
                            <span className="eyebrow block mx-auto md:mx-0">Our Store</span>
                            <h2 className="font-serif text-[clamp(2.1rem,4vw,2.8rem)] font-bold text-brand-secondary leading-tight mt-1">
                                All Products
                            </h2>
                        </div>

                        <div className="w-full flex flex-wrap items-center justify-center md:justify-end gap-3">
                            {error && (
                                <button
                                    onClick={() => {
                                        const opt = SORT_OPTIONS.find(o => o.value === sortKey) || SORT_OPTIONS[0];
                                        const catParam = activeCategory === 'all' ? '' : activeCategory;
                                        loadProducts({ orderby: opt.orderby, order: opt.order, category: catParam });
                                    }}
                                    className="flex items-center text-red-600 hover:text-red-800 font-medium text-sm transition"
                                >
                                    <RefreshCw size={14} className="mr-1" /> Retry
                                </button>
                            )}
                            {/* Sort dropdown — each value maps to real WooCommerce API orderby + order params */}
                            <div className="relative">
                                <select
                                    value={sortKey}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    disabled={sortLoading}
                                    className="bg-white border text-sm font-semibold border-gray-300 text-brand-secondary rounded-lg py-2 pl-4 pr-9 outline-none focus:border-brand-primary disabled:opacity-60 appearance-none cursor-pointer"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {/* Custom dropdown arrow / spinner */}
                                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    {sortLoading
                                        ? <RefreshCw size={13} className="animate-spin text-brand-primary" />
                                        : <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-2 gap-2 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all ${activeCategory === 'all' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-brand-secondary border-gray-200 hover:border-brand-primary hover:text-brand-primary'}`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(String(cat.id))}
                                className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all ${activeCategory === String(cat.id) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-brand-secondary border-gray-200 hover:border-brand-primary hover:text-brand-primary'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Loading / error / products */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary" />
                            <p className="text-[#4a5e4d] text-sm font-semibold">Loading products…</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                            <p className="text-red-600 font-semibold">{error}</p>
                            <button
                                onClick={() => {
                                    const opt = SORT_OPTIONS.find(o => o.value === sortKey) || SORT_OPTIONS[0];
                                    const catParam = activeCategory === 'all' ? '' : activeCategory;
                                    loadProducts({ orderby: opt.orderby, order: opt.order, category: catParam });
                                }}
                                className="btn-primary px-6"
                            >Retry</button>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-[#4a5e4d] font-semibold mb-4">No products found in this category.</p>
                            <button onClick={() => handleCategoryChange('all')} className="btn-primary px-6">View All</button>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${sortLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                            {filteredProducts.map(product => (
                                <div key={product.id} className="group bg-white rounded-xl border border-[#1e2520]/10 overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(30,37,32,0.1)] transition-all duration-300 flex flex-col">
                                    <Link to={`/product/${product.id}`} className="relative aspect-[4/5] bg-gray-50 overflow-hidden block">
                                        <img
                                            src={product.images?.[0]?.src || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=600&q=80'}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />
                                        {/* Category badge */}
                                        {product.categories?.[0] && (
                                            <div className="absolute top-3 left-3">
                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur text-brand-secondary px-3 py-1 rounded-full shadow-sm">
                                                    {product.categories[0].name}
                                                </span>
                                            </div>
                                        )}
                                        {/* Status badges */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                            {product.stock_status === 'outofstock' && (
                                                <span className="text-[10px] font-extrabold uppercase bg-red-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                                                    Out of Stock
                                                </span>
                                            )}
                                            {product.stock_status !== 'outofstock' && product.sale_price && (
                                                <span className="text-[10px] font-extrabold uppercase bg-[#f5c842] text-brand-secondary px-2.5 py-1 rounded-full shadow-sm">
                                                    Sale
                                                </span>
                                            )}
                                        </div>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4 gap-2">
                                            <button
                                                disabled={product.stock_status === 'outofstock'}
                                                onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                                className={`w-full font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg text-sm ${product.stock_status === 'outofstock' ? 'bg-gray-800/80 text-white cursor-not-allowed' : 'bg-brand-primary text-white hover:bg-[#1b5e20]'}`}
                                            >
                                                {product.stock_status === 'outofstock' ? 'Out of Stock' : <><ShoppingCart size={16} /> Quick Add</>}
                                            </button>
                                        </div>
                                    </Link>

                                    <div className="p-5 flex-1 flex flex-col">
                                        {/* Stars */}
                                        <div className="flex items-center gap-0.5 mb-2 text-[#f5c842]">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-current" />)}
                                            <span className="text-gray-400 text-[10px] ml-1 font-semibold">(24)</span>
                                        </div>
                                        <Link to={`/product/${product.id}`} className="flex-1">
                                            <h4 className="font-serif text-[1.05rem] font-bold text-brand-secondary mb-1 leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">
                                                {product.name}
                                            </h4>
                                        </Link>
                                        <div className="mt-4 pt-4 border-t border-[#1e2520]/05 flex items-end justify-between">
                                            <div>
                                                {product.sale_price ? (
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="font-serif text-xl font-bold text-brand-primary">${product.sale_price}</span>
                                                        <span className="text-gray-400 text-sm line-through">${product.regular_price}</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-serif text-xl font-bold text-brand-secondary">${product.price || '0.00'}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleWishlist(product)}
                                                    className={`p-1.5 rounded-lg transition-colors ${isWishlisted(product.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400 hover:bg-red-50'}`}
                                                >
                                                    <Heart size={15} className={isWishlisted(product.id) ? 'fill-current' : ''} />
                                                </button>
                                                <button
                                                    disabled={product.stock_status === 'outofstock'}
                                                    onClick={() => addToCart(product)}
                                                    className={`p-1.5 rounded-lg transition-colors ${product.stock_status === 'outofstock' ? 'text-gray-300 cursor-not-allowed' : 'text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                                                >
                                                    <ShoppingCart size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── PROMO BANNER ─────────────────────────────────────────── */}
            <section className="bg-brand-secondary py-16 lg:py-24 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-primary/15 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#f5c842]/10 blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <span className="inline-block bg-[#f5c842]/20 text-[#f5c842] text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                        Limited Time Offer
                    </span>
                    <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] font-bold text-white mb-4">
                        Get 15% Off Your First Order
                    </h2>
                    <p className="text-white/60 mb-8 text-lg max-w-xl mx-auto">
                        Sign up for our newsletter and unlock an exclusive welcome discount plus early access to new arrivals.
                    </p>
                    {subscribed ? (
                        <div className="inline-flex items-center gap-2 bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-6 py-3 rounded-full font-bold">
                            🎉 You're in! Check your inbox.
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                        >
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="flex-1 px-5 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-brand-primary focus:bg-white/15 transition text-sm font-medium"
                            />
                            <button type="submit" className="btn-primary px-6 py-3.5 whitespace-nowrap">
                                Get 15% Off
                            </button>
                        </form>
                    )}
                    <p className="text-white/30 text-xs mt-4">No spam, unsubscribe anytime.</p>
                </div>
            </section>

            {/* Ticker keyframe */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes tickerScroll {
           0% { transform: translateX(100%); }
           100% { transform: translateX(-100%); }
        }
      `
            }} />
        </main>
    );
}
