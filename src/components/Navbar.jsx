import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, Menu, User, LogOut, Search, Heart, X } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Navbar() {
    const { cart } = useCart();
    const { user, logout } = useAuth();
    const { wishlist } = useWishlist();
    const [searchOpen, setSearchOpen] = useState(false);
    const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0);

    return (
        <>
            {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}

            <header className="sticky top-0 z-50 bg-[#fefdf8]/95 backdrop-blur-md border-b border-[#1e2520]/10 shadow-[0_4px_20px_rgba(30,37,32,0.04)] transition-shadow">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[66px] flex items-center justify-between">

                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="group-hover:scale-110 transition-transform">
                            <path d="M14 4C14 4 8 8 8 16C8 20 10.5 23 14 24C17.5 23 20 20 20 16C20 8 14 4 14 4Z" fill="#2E7D32" />
                            <path d="M14 14L14 26" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <div className="flex items-baseline">
                            <span className="font-serif text-[1.15rem] font-bold text-brand-secondary">NewLife Project</span>
                            <span className="text-[0.72rem] text-[#4a5e4d] ml-[2px] font-medium">Inc.</span>
                        </div>
                    </Link>

                    {/* Nav links */}
                    <nav className="space-x-7 hidden sm:flex font-medium text-[0.85rem] text-[#4a5e4d]">
                        <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                        <a href="/#store" className="hover:text-brand-primary transition-colors">Shop</a>
                        <Link to="/wishlist" className="hover:text-brand-primary transition-colors">Wishlist</Link>
                        <a href="/#impact" className="hover:text-brand-primary transition-colors">Impact</a>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-5">
                        {/* Search trigger */}
                        <button onClick={() => setSearchOpen(true)} className="text-[#4a5e4d] hover:text-brand-primary transition-colors">
                            <Search size={19} />
                        </button>

                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative text-[#4a5e4d] hover:text-brand-primary transition-colors">
                            <Heart size={19} />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#f5c842] text-brand-secondary text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {/* Auth */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link to="/account" className="hidden sm:flex items-center gap-1.5 text-[0.82rem] font-semibold text-brand-secondary border border-[#1e2520]/15 px-3 py-1.5 rounded-full bg-[#f5f8f5] hover:border-brand-primary hover:text-brand-primary transition-all">
                                    <User size={13} /> {user.first_name || 'Account'}
                                </Link>
                                <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors" title="Logout">
                                    <LogOut size={17} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/auth" className="hidden sm:flex items-center gap-1.5 text-[0.82rem] font-bold text-brand-primary border border-brand-primary px-3 py-1.5 rounded-full hover:bg-brand-primary hover:text-white transition-all">
                                <User size={13} /> Sign In
                            </Link>
                        )}

                        {/* Cart */}
                        <Link to="/cart" className="relative text-[#1e2520] hover:text-brand-primary transition-colors">
                            <ShoppingCart size={19} />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-brand-primary text-white text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        <button className="sm:hidden text-brand-secondary"><Menu size={22} /></button>
                    </div>
                </div>
            </header>
        </>
    );
}
