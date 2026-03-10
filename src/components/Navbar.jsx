import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, Menu, User, LogOut, Search, Heart, X, Tag } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Navbar() {
    const { cart } = useCart();
    const { user, logout } = useAuth();
    const { wishlist } = useWishlist();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0);

    const navLinks = [
        { label: 'Home', to: '/', isLink: true },
        { label: 'Shop', href: '/#store', isLink: false },
        { label: 'New Arrivals', href: '/#store', isLink: false },
        { label: 'Wishlist', to: '/wishlist', isLink: true },
    ];

    return (
        <>
            {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}

            <header className="sticky top-0 z-50 bg-[#fefdf8]/95 backdrop-blur-md border-b border-[#1e2520]/10 shadow-[0_4px_20px_rgba(30,37,32,0.04)]">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[66px] flex items-center justify-between">

                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
                        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="group-hover:scale-110 transition-transform">
                            <path d="M14 4C14 4 8 8 8 16C8 20 10.5 23 14 24C17.5 23 20 20 20 16C20 8 14 4 14 4Z" fill="#2E7D32" />
                            <path d="M14 14L14 26" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <div className="flex items-baseline">
                            <span className="font-serif text-[1.15rem] font-bold text-brand-secondary">ShopGenZ</span>
                            <span className="text-[0.72rem] text-[#4a5e4d] ml-[2px] font-medium">.store</span>
                        </div>
                    </Link>

                    {/* Nav links — desktop */}
                    <nav className="space-x-6 hidden md:flex font-medium text-[0.85rem] text-[#4a5e4d]">
                        <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                        <a href="/#store" className="hover:text-brand-primary transition-colors">Shop</a>
                        <Link to="/wishlist" className="hover:text-brand-primary transition-colors">Wishlist</Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="text-[#4a5e4d] hover:text-brand-primary transition-colors"
                            aria-label="Search"
                        >
                            <Search size={19} />
                        </button>

                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative text-[#4a5e4d] hover:text-brand-primary transition-colors" aria-label="Wishlist">
                            <Heart size={19} />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {/* Auth */}
                        {user ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    to="/account"
                                    className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-brand-secondary border border-[#1e2520]/15 px-3 py-1.5 rounded-full bg-[#f5f8f5] hover:border-brand-primary hover:text-brand-primary transition-all"
                                >
                                    <User size={13} /> {user.first_name || 'Account'}
                                </Link>
                                <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors" title="Logout">
                                    <LogOut size={17} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="hidden sm:flex items-center gap-1.5 text-[0.82rem] font-bold text-brand-primary border border-brand-primary px-3 py-1.5 rounded-full hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <User size={13} /> Sign In
                            </Link>
                        )}

                        {/* Cart */}
                        <Link to="/cart" className="relative flex items-center gap-1.5 bg-brand-primary text-white px-3.5 py-2 rounded-lg font-bold text-sm hover:bg-[#1b5e20] transition-colors shadow-sm" aria-label="Cart">
                            <ShoppingCart size={17} />
                            {cartItemCount > 0 ? (
                                <span className="font-extrabold">{cartItemCount}</span>
                            ) : (
                                <span className="hidden sm:inline">Cart</span>
                            )}
                        </Link>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden text-brand-secondary"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden bg-[#fefdf8] border-t border-[#1e2520]/10 px-4 py-4 flex flex-col gap-3">
                        <Link to="/" onClick={() => setMobileOpen(false)} className="font-semibold text-brand-secondary py-2 border-b border-[#1e2520]/05 hover:text-brand-primary transition-colors">Home</Link>
                        <a href="/#store" onClick={() => setMobileOpen(false)} className="font-semibold text-brand-secondary py-2 border-b border-[#1e2520]/05 hover:text-brand-primary transition-colors">Shop</a>
                        <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="font-semibold text-brand-secondary py-2 border-b border-[#1e2520]/05 hover:text-brand-primary transition-colors">Wishlist</Link>
                        {!user && (
                            <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-primary w-full mt-2 justify-center">Sign In</Link>
                        )}
                    </div>
                )}
            </header>
        </>
    );
}
