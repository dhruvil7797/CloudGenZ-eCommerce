import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/woocommerce';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, RefreshCw, ShoppingCart } from 'lucide-react';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [prodData, catData] = await Promise.all([
                fetchProducts(),
                fetchCategories()
            ]);

            if (Array.isArray(prodData)) {
                setProducts(prodData);
            } else {
                throw new Error("Invalid response format");
            }

            if (Array.isArray(catData)) {
                setCategories(catData.filter(c => c.name !== 'Uncategorized'));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <main className="w-full bg-[#fefdf8]">
            {/* HERO — full-bleed split from Design 2 */}
            <header className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 lg:gap-20 items-center px-4 sm:px-6 lg:px-16 py-12 lg:py-0 max-w-[1400px] mx-auto">
                <div className="order-2 lg:order-1 pt-10 lg:pt-0">
                    <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-brand-primary bg-[#e8f5e9] px-4 py-1.5 rounded-full inline-block mb-6">
                        Non-Profit · Ottawa, Canada
                    </div>
                    <h1 className="font-serif text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[1.05] text-brand-secondary mb-6">
                        Empowering <br />
                        <span className="text-brand-primary">Women.</span><br />
                        Transforming <br />
                        Communities.
                    </h1>
                    <p className="text-lg text-[#4a5e4d] max-w-[480px] mb-8 leading-[1.75]">
                        From Sierra Leone to Ottawa — NewLife Project builds economic independence, cultural pride, and community resilience through our social enterprise collections.
                    </p>
                    <div className="flex flex-wrap items-center gap-6 mb-8">
                        <button onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })} className="btn-primary px-8 py-3.5 text-[0.95rem]">
                            Shop Collections
                        </button>
                        <a href="#" className="font-semibold text-brand-secondary border-b-2 border-brand-primary pb-0.5 hover:text-brand-primary transition-colors">
                            Make a Donation &rarr;
                        </a>
                    </div>
                    <div className="flex flex-wrap gap-6 border-t border-gray-200 pt-6">
                        <span className="text-[0.8rem] text-[#4a5e4d] font-bold">✓ Registered Non-Profit</span>
                        <span className="text-[0.8rem] text-[#4a5e4d] font-bold">✓ Impact Driven</span>
                        <span className="text-[0.8rem] text-[#4a5e4d] font-bold">✓ 30+ Years of Mission</span>
                    </div>
                </div>

                <div className="order-1 lg:order-2 relative mt-10 lg:mt-0">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-[#2e7d32] to-[#0a3d0a]">
                        <img
                            src="https://images.unsplash.com/photo-1587614203976-365c74645e83?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Women Empowered"
                            className="w-full h-full object-cover mix-blend-overlay opacity-80"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1e2520]/80 backdrop-blur-md text-white p-5 font-serif italic text-xl">
                            Building Up Women of Virtue
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-[#e8f5e9] rounded-lg p-4 text-center">
                            <span className="block font-serif text-2xl font-bold text-brand-primary">1,000+</span>
                            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#4a5e4d] mt-1 block">Lives Touched</span>
                        </div>
                        <div className="bg-[#f5c842]/20 rounded-lg p-4 text-center">
                            <span className="block font-serif text-2xl font-bold text-[#d4a017]">3</span>
                            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#4a5e4d] mt-1 block">Nations</span>
                        </div>
                        <div className="bg-[#e8f5e9] rounded-lg p-4 text-center">
                            <span className="block font-serif text-2xl font-bold text-brand-primary">100%</span>
                            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#4a5e4d] mt-1 block">Non-Profit</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TICKER */}
            <div className="bg-brand-primary flex items-center overflow-hidden border-y border-[#1b5e20]">
                <span className="bg-[#f5c842] text-brand-secondary text-xs font-extrabold uppercase tracking-widest px-6 py-3 whitespace-nowrap z-10 shrink-0">
                    Latest News
                </span>
                <div className="whitespace-nowrap px-6 py-3 text-white/90 text-sm font-semibold animate-[tickerScroll_22s_linear_infinite]">
                    🌿 100% of proceeds go back to communities &nbsp;·&nbsp; 🎪 Spring African Market Collection Now Available &nbsp;·&nbsp; 🌍 Track our impact in West Africa
                </div>
            </div>

            {/* Main Collections Content */}
            <section className="bg-[#f5f8f5] py-20 lg:py-32" id="store">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-200 pb-6">
                        <div className="max-w-xl">
                            <span className="eyebrow">Social Enterprise</span>
                            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-brand-secondary font-serif leading-tight mt-2 mb-4">
                                Shop with Purpose
                            </h2>
                            <p className="text-[#4a5e4d]">Every purchase directly supports our programs in Ottawa and West Africa. Support the women and communities creating these beautiful items.</p>
                        </div>

                        <div className="mt-8 flex flex-col items-end gap-3">
                            {error && (
                                <button onClick={loadData} className="flex items-center text-red-600 hover:text-red-800 font-medium text-sm transition">
                                    <RefreshCw size={14} className="mr-1" /> Retry Connection
                                </button>
                            )}
                            <div className="flex gap-4">
                                <select className="bg-white border text-sm font-semibold border-gray-300 text-brand-secondary rounded py-2 px-4 outline-none focus:border-brand-primary">
                                    <option>All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <select className="bg-white border text-sm font-semibold border-gray-300 text-brand-secondary rounded py-2 px-4 outline-none focus:border-brand-primary">
                                    <option>Sort by Latest</option>
                                    <option>Sort by Price: Low to High</option>
                                    <option>Sort by Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="group bg-white rounded-lg border border-[#1e2520]/10 overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(30,37,32,0.1)] transition-all duration-300 flex flex-col">
                                    <Link to={`/product/${product.id}`} className="relative aspect-[4/5] bg-gray-50 overflow-hidden block">
                                        <img
                                            src={product.images?.[0]?.src || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=600&q=80"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />
                                        {product.categories?.[0] && (
                                            <div className="absolute top-4 left-4">
                                                <span className="text-[0.65rem] font-bold uppercase tracking-widest bg-white/90 backdrop-blur text-brand-secondary px-3 py-1 rounded-full shadow-sm">
                                                    {product.categories[0].name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Hover quick add overlay */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <button
                                                onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                                className="w-full bg-brand-primary text-white font-bold py-3 rounded flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:bg-[#1b5e20]"
                                            >
                                                <ShoppingCart size={18} /> Quick Add
                                            </button>
                                        </div>
                                    </Link>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-1 mb-2 text-[#f5c842]">
                                            <Star size={12} className="fill-current" />
                                            <Star size={12} className="fill-current" />
                                            <Star size={12} className="fill-current" />
                                            <Star size={12} className="fill-current" />
                                            <Star size={12} className="fill-current" />
                                        </div>
                                        <Link to={`/product/${product.id}`} className="flex-1">
                                            <h4 className="font-serif text-lg font-bold text-brand-secondary mb-1 leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">
                                                {product.name}
                                            </h4>
                                        </Link>
                                        <div className="mt-4 pt-4 border-t border-[#1e2520]/5 flex items-end justify-between">
                                            <div className="font-serif text-xl font-bold text-brand-secondary">
                                                ${product.price || '0.00'}
                                            </div>
                                            <button onClick={(e) => { e.preventDefault(); addToCart(product); }} className="text-brand-primary hover:text-[#1b5e20] p-1">
                                                <ShoppingCart strokeWidth={2.5} size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* IMPACT BENTO - from Design 2 */}
            <section className="bg-[#1b5e20] py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="eyebrow text-white/60">Our Impact</span>
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-white font-serif leading-tight">Numbers That Tell<br />Our Story</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-white col-span-1 md:col-span-2">
                            <span className="block font-serif text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-none mb-2">1,000+</span>
                            <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/50 mb-2 block">Lives Touched Globally</span>
                            <p className="text-sm text-white/70 max-w-sm">Women, men, children, and families across 4 countries over 30 years</p>
                        </div>
                        <div className="bg-[#d4a017] rounded-lg p-8 text-[#1e2520] flex flex-col justify-center">
                            <span className="block font-serif text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-none mb-2">3</span>
                            <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#1e2520]/70 block">West African Nations</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-white">
                            <span className="block font-serif text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-none mb-2">10</span>
                            <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/50 block">Years in Ottawa</span>
                        </div>
                        <div className="bg-white/10 border border-white/10 rounded-lg p-8 text-white">
                            <span className="block font-serif text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-none mb-2">8</span>
                            <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/50 block">Active Programs</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-white flex flex-col justify-center">
                            <span className="block font-serif text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-none mb-2">100%</span>
                            <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/50 block">Community-Driven</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Global CSS for Ticker animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes tickerScroll {
           0% { transform: translateX(100%); }
           100% { transform: translateX(-100%); }
        }
      `}} />
        </main>
    );
}
