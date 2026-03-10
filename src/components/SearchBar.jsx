import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from '../api/woocommerce';
import { Search, X, Loader2 } from 'lucide-react';

export default function SearchBar({ onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) { setResults([]); return; }
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

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Search input */}
                <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                    <Search size={20} className="text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 text-lg font-medium text-brand-secondary outline-none placeholder:text-gray-300"
                    />
                    {loading && <Loader2 size={18} className="text-brand-primary animate-spin" />}
                    <button onClick={onClose} className="text-gray-400 hover:text-brand-secondary transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {results.map(product => (
                            <li key={product.id}>
                                <button
                                    onClick={() => goToProduct(product.id)}
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f5f8f5] transition-colors text-left group"
                                >
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        <img src={product.images?.[0]?.src} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-brand-secondary text-sm truncate group-hover:text-brand-primary transition-colors">{product.name}</p>
                                        <p className="text-xs text-[#4a5e4d]">{product.categories?.[0]?.name || 'Product'}</p>
                                    </div>
                                    <span className="font-serif font-bold text-brand-secondary shrink-0">${product.price}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {query.length >= 2 && !loading && results.length === 0 && (
                    <div className="p-8 text-center text-gray-400 font-medium">No products found for "{query}"</div>
                )}

                {query.length === 0 && (
                    <div className="p-6 text-center text-gray-400 text-sm">Start typing to search our collections…</div>
                )}
            </div>
        </div>
    );
}
