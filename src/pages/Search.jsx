import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/woocommerce';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
    ShoppingCart, Star, RefreshCw, Heart, Search as SearchIcon
} from 'lucide-react';

const SORT_OPTIONS = [
    { label: 'Relevance',           value: 'relevance',  orderby: 'relevance',  order: 'desc' },
    { label: 'Newest First',        value: 'newest',     orderby: 'date',       order: 'desc' },
    { label: 'Price: Low to High',  value: 'price_asc',  orderby: 'price',      order: 'asc'  },
    { label: 'Price: High to Low',  value: 'price_desc', orderby: 'price',      order: 'desc' },
    { label: 'Name: A → Z',         value: 'title_asc',  orderby: 'title',      order: 'asc'  },
    { label: 'Best Selling',        value: 'popularity', orderby: 'popularity', order: 'desc' },
];

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [products, setProducts]         = useState([]);
    const [categories, setCategories]     = useState([]);
    const [loading, setLoading]           = useState(true);
    const [sortLoading, setSortLoading]   = useState(false);
    const [error, setError]               = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortKey, setSortKey]           = useState('relevance');
    const { addToCart }                   = useCart();
    const { wishlist, toggleWishlist }    = useWishlist();

    const loadCategories = async () => {
        try {
            const catData = await fetchCategories();
            if (Array.isArray(catData))
                setCategories(catData.filter(c => c.name !== 'Uncategorized'));
        } catch (err) {
            console.error('loadCategories:', err);
        }
    };

    const loadProducts = async ({ orderby = 'relevance', order = 'desc', category = '' } = {}) => {
        if (!query.trim()) {
            setProducts([]);
            setLoading(false);
            return;
        }

        setSortLoading(true);
        setError(null);
        try {
            const fetchOrderby = orderby === 'relevance' ? undefined : orderby; // Use API default for relevance
            const prodData = await fetchProducts({
                search: query.trim(),
                orderby: fetchOrderby,
                order,
                ...(category ? { category } : {}),
                perPage: 40,
            });
            if (Array.isArray(prodData)) setProducts(prodData);
            else throw new Error('Invalid response format');
        } catch (err) {
            setError(err.message);
        } finally {
            setSortLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        setLoading(true);
        setActiveCategory('all');
        setSortKey('relevance');
        // Reset and load products when query changes
        loadProducts();
    }, [query]);

    const handleSortChange = (value) => {
        setSortKey(value);
        const opt = SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0];
        const catParam = activeCategory === 'all' ? '' : activeCategory;
        loadProducts({ orderby: opt.orderby, order: opt.order, category: catParam });
    };

    const handleCategoryChange = (catId) => {
        setActiveCategory(catId);
        const opt = SORT_OPTIONS.find(o => o.value === sortKey) || SORT_OPTIONS[0];
        const catParam = catId === 'all' ? '' : catId;
        loadProducts({ orderby: opt.orderby, order: opt.order, category: catParam });
    };

    const filteredProducts = products;
    const isWishlisted = (id) => wishlist.some(w => w.id === id);

    return (
        <main className="w-full bg-[#fefdf8] min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-brand-secondary mb-3">
                        Search Results
                    </h1>
                    <p className="text-[#4a5e4d] text-lg">
                        {query ? (
                            <>Showing results for <span className="font-semibold text-brand-primary">"{query}"</span></>
                        ) : (
                            "Please enter a search query."
                        )}
                    </p>
                </div>

                {query && (
                    <>
                        {/* Filters and Sort Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-6 gap-6">
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleCategoryChange('all')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${activeCategory === 'all' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-brand-secondary border-gray-200 hover:border-brand-primary hover:text-brand-primary'}`}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryChange(String(cat.id))}
                                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${activeCategory === String(cat.id) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-brand-secondary border-gray-200 hover:border-brand-primary hover:text-brand-primary'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
                                <div className="relative w-full md:w-auto">
                                    <select
                                        value={sortKey}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        disabled={sortLoading}
                                        className="w-full md:w-auto bg-white border text-sm font-semibold border-gray-300 text-brand-secondary rounded-lg py-2 pl-4 pr-9 outline-none focus:border-brand-primary disabled:opacity-60 appearance-none cursor-pointer"
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        {sortLoading
                                            ? <RefreshCw size={13} className="animate-spin text-brand-primary" />
                                            : <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary" />
                                <p className="text-[#4a5e4d] text-sm font-semibold">Searching products…</p>
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
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <SearchIcon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-brand-secondary mb-2">No results found</h3>
                                <p className="text-[#4a5e4d] mb-6">We couldn't find any products matching "{query}"{activeCategory !== 'all' ? ' in this category' : ''}.</p>
                                {activeCategory !== 'all' && (
                                    <button onClick={() => handleCategoryChange('all')} className="btn-primary px-6 py-2.5 text-sm">
                                        Search In All Categories
                                    </button>
                                )}
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
                                            {product.categories?.[0] && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur text-brand-secondary px-3 py-1 rounded-full shadow-sm">
                                                        {product.categories[0].name}
                                                    </span>
                                                </div>
                                            )}
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
                    </>
                )}
            </div>
        </main>
    );
}
