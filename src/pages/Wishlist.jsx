import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';

export default function Wishlist() {
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (wishlist.length === 0) {
        return (
            <div className="bg-[#fefdf8] min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
                <div className="bg-white border border-[#1e2520]/10 rounded-xl p-16 max-w-lg w-full shadow-sm">
                    <Heart className="mx-auto h-16 w-16 text-gray-200 mb-6" />
                    <h2 className="font-serif text-3xl font-bold text-brand-secondary mb-3">Your wishlist is empty.</h2>
                    <p className="text-[#4a5e4d] mb-8 text-sm">When you heart a product, it will appear here.</p>
                    <Link to="/" className="btn-primary px-8 py-3.5 text-base">
                        <ArrowLeft size={16} /> Explore Collections
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fefdf8] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <h1 className="font-serif text-4xl font-bold text-brand-secondary mb-2">My Wishlist</h1>
                <p className="text-[#4a5e4d] mb-10 pb-6 border-b border-[#1e2520]/10">
                    {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlist.map(product => (
                        <div key={product.id} className="group bg-white rounded-xl border border-[#1e2520]/10 overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(30,37,32,0.1)] transition-all duration-300 flex flex-col">
                            <Link to={`/product/${product.id}`} className="relative aspect-[3/4] bg-gray-50 overflow-hidden block">
                                <img
                                    src={product.images?.[0]?.src || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=600&q=80"}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <button
                                    onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Heart size={16} className="fill-current" />
                                </button>
                            </Link>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-primary mb-1">
                                        {product.categories?.[0]?.name || 'Product'}
                                    </p>
                                    <Link to={`/product/${product.id}`}>
                                        <h3 className="font-serif text-lg font-bold text-brand-secondary line-clamp-2 hover:text-brand-primary transition-colors mb-3">
                                            {product.name}
                                        </h3>
                                    </Link>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-serif text-xl font-bold text-brand-secondary">${product.price || '0.00'}</span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="flex items-center gap-1.5 text-xs font-bold bg-brand-primary text-white px-3 py-2 rounded-md hover:bg-[#1b5e20] transition-colors"
                                    >
                                        <ShoppingCart size={13} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
