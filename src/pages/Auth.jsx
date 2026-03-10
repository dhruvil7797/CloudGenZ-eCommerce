import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCustomer, loginCustomer } from '../api/woocommerce';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                if (!formData.email) throw new Error("Please enter your email");
                const userProfile = await loginCustomer(formData.email);
                login(userProfile);
                navigate('/');
            } else {
                if (!formData.email || !formData.password || !formData.firstName) throw new Error("Please fill in all required fields.");
                const newProfile = await registerCustomer({
                    email: formData.email,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    username: formData.email.split('@')[0],
                    billing: { first_name: formData.firstName, last_name: formData.lastName, email: formData.email }
                });
                login(newProfile);
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#fefdf8] min-h-[80vh] flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md">
                {/* Brand mini */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                            <path d="M14 4C14 4 8 8 8 16C8 20 10.5 23 14 24C17.5 23 20 20 20 16C20 8 14 4 14 4Z" fill="#2E7D32" />
                            <path d="M14 14L14 26" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="font-serif text-lg font-bold text-brand-secondary">NewLife Project</span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-brand-secondary mb-2">
                        {isLogin ? "Welcome Back" : "Create an Account"}
                    </h2>
                    <p className="text-[#4a5e4d] text-sm">
                        {isLogin ? "Sign in to access your orders and history" : "Join our community and shop with purpose"}
                    </p>
                </div>

                <div className="bg-white border border-[#1e2520]/10 rounded-xl p-8 shadow-sm">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3 border border-red-100 text-sm">
                            <AlertCircle size={16} className="shrink-0" />
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                                    <input required type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-[#f5f8f5] border border-[#1e2520]/10 rounded-md text-sm font-medium text-brand-secondary focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all" />
                                </div>
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                                    <input required type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-[#f5f8f5] border border-[#1e2520]/10 rounded-md text-sm font-medium text-brand-secondary focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all" />
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <Mail size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-[#f5f8f5] border border-[#1e2520]/10 rounded-md text-sm font-medium text-brand-secondary focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all" />
                        </div>

                        <div className="relative">
                            <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input required type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-[#f5f8f5] border border-[#1e2520]/10 rounded-md text-sm font-medium text-brand-secondary focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all" />
                        </div>

                        {isLogin && (
                            <div className="text-right">
                                <a href="#" className="text-xs text-brand-primary font-semibold hover:underline">Forgot password?</a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-md bg-brand-primary text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-[#1b5e20] transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    {isLogin ? "Sign In" : "Create Account"}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#1e2520]/10 text-center">
                        <p className="text-sm text-[#4a5e4d]">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-brand-primary font-bold hover:underline bg-transparent border-none cursor-pointer">
                                {isLogin ? "Create one" : "Sign In"}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-[#4a5e4d] mt-6 font-medium">
                    By continuing you agree to our terms. Your data is protected securely.
                </p>
            </div>
        </div>
    );
}
