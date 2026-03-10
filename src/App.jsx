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
import OrderDetail from './pages/OrderDetail'
import Wishlist from './pages/Wishlist'
import Search from './pages/Search'
import ScrollToTop from './components/ScrollToTop'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <ScrollToTop />
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
                  <Route path="/order/:id" element={<OrderDetail />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/search" element={<Search />} />
                </Routes>
              </main>

              {/* Footer — E-Commerce */}
              <footer className="bg-[#1e2520] text-white pt-16 pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                  {/* Top grid */}
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-12 pb-16 border-b border-white/[0.06]">

                    {/* Brand col */}
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                          <path d="M14 4C14 4 8 8 8 16C8 20 10.5 23 14 24C17.5 23 20 20 20 16C20 8 14 4 14 4Z" fill="#2E7D32" />
                          <path d="M14 14L14 26" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="font-serif text-lg font-bold">ShopGenZ<span className="text-white/40 font-normal text-sm">.store</span></span>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xs">
                        Your one-stop shop for premium, ethically sourced products delivered fast and securely.
                      </p>
                      {/* Social icons */}
                      <div className="flex gap-3">
                        {['fb', 'ig', 'tw', 'yt'].map(s => (
                          <a key={s} href="#" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-brand-primary flex items-center justify-center transition-colors text-white/60 hover:text-white text-xs font-bold">
                            {s === 'fb' ? 'F' : s === 'ig' ? 'In' : s === 'tw' ? 'X' : '▶'}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Shop col */}
                    <div className="flex flex-col gap-3">
                      <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-white/35 mb-2">Shop</h5>
                      <a href="/#store" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">All Products</a>
                      <a href="/#store" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">New Arrivals</a>
                      <a href="/#store" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Sale / Deals</a>
                      <a href="/wishlist" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Wishlist</a>
                      <a href="/cart" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Cart</a>
                    </div>

                    {/* Account col */}
                    <div className="flex flex-col gap-3">
                      <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-white/35 mb-2">Account</h5>
                      <a href="/auth" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Sign In</a>
                      <a href="/auth" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Register</a>
                      <a href="/account" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">My Orders</a>
                      <a href="/account" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Profile</a>
                      <a href="/wishlist" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Saved Items</a>
                    </div>

                    {/* Customer Service col */}
                    <div className="flex flex-col gap-3">
                      <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-white/35 mb-2">Support</h5>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Contact Us</a>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">FAQs</a>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Shipping Info</a>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Returns</a>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Track Order</a>
                    </div>

                    {/* Company col */}
                    <div className="flex flex-col gap-3">
                      <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-white/35 mb-2">Company</h5>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">About Us</a>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Blog</a>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Privacy Policy</a>
                      <a href="#" className="text-sm text-white/55 hover:text-[#f5c842] transition-colors">Terms of Service</a>
                    </div>
                  </div>

                  {/* Payment badges + copyright */}
                  <div className="flex flex-col sm:flex-row justify-between items-center py-5 text-[0.78rem] text-white/30 gap-4">
                    <p>© {new Date().getFullYear()} ShopGenZ. All Rights Reserved.</p>
                    <div className="flex items-center gap-2">
                      {['VISA', 'MC', 'AMEX', 'PP', 'APPLE'].map(p => (
                        <span key={p} className="bg-white/10 text-white/50 text-[10px] font-bold px-2.5 py-1 rounded">{p}</span>
                      ))}
                    </div>
                    <p>Built by <strong className="text-white/50">CloudGenZ</strong></p>
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
