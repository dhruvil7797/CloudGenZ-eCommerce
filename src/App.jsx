import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Auth from './pages/Auth'
import Account from './pages/Account'
import Wishlist from './pages/Wishlist'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-[#fefdf8] text-brand-secondary">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Routes>
              </main>

              {/* Footer — Design 2 Style */}
              <footer className="bg-[#1e2520] text-white pt-16 pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-16 pb-16 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                          <path d="M14 4C14 4 8 8 8 16C8 20 10.5 23 14 24C17.5 23 20 20 20 16C20 8 14 4 14 4Z" fill="#2E7D32" />
                          <path d="M14 14L14 26" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="font-serif text-lg font-bold">NewLife Project Inc.</span>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed mb-1">"Building Up Women of Virtue" · Ottawa, Canada</p>
                      <p className="text-white/40 text-sm">Registered Non-Profit Organization · Est. 1994</p>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="flex flex-col gap-3">
                        <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-white/35 mb-1">Shop</h5>
                        <a href="/#store" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Collections</a>
                        <a href="/wishlist" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Wishlist</a>
                        <a href="/cart" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Cart</a>
                      </div>
                      <div className="flex flex-col gap-3">
                        <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-white/35 mb-1">Account</h5>
                        <a href="/auth" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Sign In</a>
                        <a href="/account" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">My Orders</a>
                        <a href="/account" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Profile</a>
                      </div>
                      <div className="flex flex-col gap-3">
                        <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-white/35 mb-1">Help</h5>
                        <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Donate</a>
                        <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Contact</a>
                        <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Volunteer</a>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center py-5 text-[0.78rem] text-white/30 gap-3">
                    <p>© {new Date().getFullYear()} NewLife Project Inc. · All Rights Reserved</p>
                    <p>Designed by <strong className="text-white/50">CloudGenZ</strong></p>
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App
