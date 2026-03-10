import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts, fetchProducts, fetchCategories } from '../api/woocommerce';
import { Search, X, Loader2, ArrowRight, TrendingUp } from 'lucide-react';

export default function SearchBar({ onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // New states for better functionality when empty
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);

    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        inputRef.current?.focus();
        
        // Fetch trending items and categories to show when search is empty
        const fetchInitialData = async () => {
            try {
                const [trending, cats] = await Promise.all([
                    fetchProducts({ perPage: 4, orderby: 'popularity', order: 'desc' }),
                    fetchCategories()
                ]);
                if (Array.isArray(trending)) setTrendingProducts(trending);
                if (Array.isArray(cats)) setCategories(cats.filter(c => c.name !== 'Uncategorized').slice(0, 5));
            } catch (err) {
                console.error("Failed to load initial search data", err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length < 2) { 
                setResults([]); 
                return; 
            }
            setLoading(true);
            const data = await searchProducts(query);
            setResults(data);
            setLoading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, [query]);

    const goToProduct = (id) => {
        navigate(`/product/${id}`);
        onClose?.();
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && query.trim().length > 0) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            onClose?.();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#1e2520]/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 transition-all" onClick={onClose}>
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-4 fade-in duration-300" onClick={e => e.stopPropagation()}>
                {/* Search input header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-white z-10 sticky top-0">
                    <Search size={24} className="text-brand-primary shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleSearchSubmit}
                        placeholder="Search for products, brands, or categories..."
                        className="flex-1 text-xl sm:text-2xl font-serif font-bold text-brand-secondary outline-none placeholder:text-gray-300 placeholder:font-medium"
                    />
                    {loading && <Loader2 size={24} className="text-brand-primary animate-spin" />}
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-gray-50 hover:bg-red-50 rounded-full ml-2">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 bg-white">
                    {/* When typing but no results yet */}
                    {query.length >= 2 && !loading && results.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <p className="text-xl font-bold text-brand-secondary mb-2">No results found</p>
                            <p className="text-gray-500 text-sm">We couldn't find anything matching "{query}". Try checking your spelling or using more general terms.</p>
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <ul className="divide-y divide-gray-50">
                            <div className="px-6 py-3 bg-gray-50/80 text-xs font-bold uppercase tracking-widest text-[#4a5e4d]">Products</div>
                            {results.map(product => (
                                <li key={product.id}>
                                    <button
                                        onClick={() => goToProduct(product.id)}
                                        className="w-full flex items-center gap-5 px-6 py-4 hover:bg-[#f5f8f5] transition-colors text-left group"
                                    >
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-black/5">
                                            <img src={product.images?.[0]?.src} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-serif font-bold text-brand-secondary text-lg truncate group-hover:text-brand-primary transition-colors">{product.name}</p>
                                            <p className="text-sm text-[#4a5e4d]">{product.categories?.[0]?.name || 'Product'}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <span className="font-bold text-brand-secondary inline-block mb-1">${product.price || '0.00'}</span>
                                            <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-primary transition-colors translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </button>
                                </li>
                            ))}
                            <li className="bg-gray-50 p-6">
                                <button
                                    onClick={() => {
                                        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                                        onClose?.();
                                    }}
                                    className="w-full py-4 text-center bg-white border border-brand-primary text-brand-primary rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    View all results for "{query}" 
                                </button>
                            </li>
                        </ul>
                    )}

                    {/* Empty state: Suggestions */}
                    {query.length < 2 && (
                        <div className="p-6 sm:p-8 animate-in fade-in duration-500">
                            <div className="mb-8">
                                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <TrendingUp size={14} /> Popular Categories
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {initialLoading ? (
                                        [...Array(5)].map((_, i) => <div key={i} className="h-10 w-24 bg-gray-100 animate-pulse rounded-full" />)
                                    ) : (
                                        categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    navigate(`/search?q=${encodeURIComponent(cat.name)}`);
                                                    onClose?.();
                                                }}
                                                className="px-5 py-2.5 bg-[#f5f8f5] text-brand-secondary hover:bg-brand-primary hover:text-white border border-[#1e2520]/5 rounded-full text-sm font-bold transition-all hover:shadow-md"
                                            >
                                                {cat.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">
                                    Currently Trending
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {initialLoading ? (
                                        [...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)
                                    ) : (
                                        trendingProducts.map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => goToProduct(product.id)}
                                                className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-brand-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group bg-white"
                                            >
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                                                    <img src={product.images?.[0]?.src} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-serif font-bold text-brand-secondary text-sm line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">{product.name}</p>
                                                    <p className="text-xs font-bold text-gray-500 mt-1">${product.price || '0.00'}</p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
