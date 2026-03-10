import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProduct, fetchProductReviews, submitReview, fetchRelatedProducts, fetchVariations } from '../api/woocommerce';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Minus, Plus, ShoppingCart, ArrowLeft, Star, Heart, CheckCircle2, Share2, Send } from 'lucide-react';

export default function ProductDetails() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [variations, setVariations] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedVariation, setSelectedVariation] = useState(null);

    // Review form state
    const [reviewForm, setReviewForm] = useState({ name: user?.first_name || '', email: user?.billing?.email || '', review: '', rating: 5 });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true); setError(null);
            try {
                const data = await fetchProduct(id);
                if (!data?.id) throw new Error('Product not found');
                setProduct(data);
                const [rev, vars] = await Promise.all([
                    fetchProductReviews(id),
                    data.type === 'variable' ? fetchVariations(id) : Promise.resolve([]),
                ]);
                setReviews(rev || []);
                setVariations(vars || []);
                if (data.categories?.[0]?.id) {
                    const rel = await fetchRelatedProducts(data.categories[0].id, id);
                    setRelated(rel);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = () => {
        const targetStockStatus = selectedVariation ? (selectedVariation.stock_status || product.stock_status) : product.stock_status;
        if (targetStockStatus === 'outofstock') return;

        let targetStockQuantity = selectedVariation ? selectedVariation.stock_quantity : product.stock_quantity;
        if (selectedVariation && (selectedVariation.stock_quantity === null || selectedVariation.stock_quantity === undefined)) {
            targetStockQuantity = product.stock_quantity;
        }

        const cartProduct = selectedVariation ? { 
            ...product, 
            id: selectedVariation.id,
            parent_id: product.id,
            name: `${product.name} - ${selectedVariation.attributes.map(a => a.option).join(', ')}`,
            price: selectedVariation.price, 
            images: selectedVariation.image ? [selectedVariation.image] : product.images,
            stock_status: targetStockStatus,
            stock_quantity: targetStockQuantity
        } : product;
        addToCart(cartProduct, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        try {
            const newReview = await submitReview({ productId: id, reviewerName: reviewForm.name, reviewerEmail: reviewForm.email, review: reviewForm.review, rating: reviewForm.rating });
            setReviews(prev => [newReview, ...prev]);
            setReviewSuccess(true);
            setReviewForm({ ...reviewForm, review: '', rating: 5 });
        } catch (e) { console.error(e); }
        finally { setReviewLoading(false); }
    };

    const displayPrice = selectedVariation ? selectedVariation.price : product?.price;

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div></div>;
    if (error || !product) return (
        <div className="flex flex-col justify-center items-center min-h-[60vh] px-4 text-center">
            <h3 className="font-serif text-3xl font-bold text-brand-secondary mb-4">Product Not Found</h3>
            <Link to="/" className="btn-primary mt-4"><ArrowLeft size={16} /> Back to Collections</Link>
        </div>
    );

    const images = product.images?.length > 0 ? product.images : [{ src: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=800&q=80" }];
    const avgRating = reviews.length ? Math.round(reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 5;

    return (
        <div className="bg-[#fefdf8] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="py-6">
                    <Link to="/" className="inline-flex items-center text-sm font-semibold text-[#4a5e4d] hover:text-brand-primary transition-colors group">
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Collections
                    </Link>
                    {product.categories?.[0] && <span className="text-[#4a5e4d] mx-2">/</span>}
                    {product.categories?.[0] && <span className="text-sm text-[#4a5e4d]">{product.categories[0].name}</span>}
                </div>

                {/* Main Product Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pb-20">
                    {/* Gallery */}
                    <div>
                        <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(30,37,32,0.12)] relative">
                            <img src={images[activeImg]?.src} alt={product.name} className="w-full h-full object-cover" />
                            {product.on_sale && <div className="absolute top-4 left-4 bg-[#d4a017] text-brand-secondary text-xs font-extrabold px-3 py-1.5 rounded tracking-widest uppercase">Sale</div>}
                            <button
                                onClick={() => toggleWishlist(product)}
                                className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-all ${isWishlisted(product.id) ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur text-brand-secondary hover:text-red-500'}`}
                            >
                                <Heart size={18} className={isWishlisted(product.id) ? 'fill-current' : ''} />
                            </button>
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-3 mt-3">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-brand-primary shadow' : 'border-transparent hover:border-gray-300'}`}>
                                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        <span className="eyebrow">{product.categories?.[0]?.name || 'New Arrival'}</span>
                        <h1 className={`font-serif font-bold text-brand-secondary leading-tight mb-4 ${
                            product.name.length > 50 ? 'text-[clamp(1.5rem,2.5vw,2rem)]' : 
                            product.name.length > 30 ? 'text-[clamp(1.65rem,3vw,2.5rem)]' : 
                            'text-[clamp(1.8rem,3.5vw,3rem)]'
                        }`}>{product.name}</h1>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex gap-0.5 text-[#f5c842]">
                                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < avgRating ? "fill-current" : "text-gray-300"} />)}
                            </div>
                            <span className="text-sm text-[#4a5e4d] font-medium">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-[#1e2520]/10">
                            <span className="font-serif text-4xl font-bold text-brand-secondary">${displayPrice || '0.00'}</span>
                            {product.regular_price && product.sale_price && <span className="text-xl text-gray-400 line-through">${product.regular_price}</span>}
                        </div>

                        {/* Variations */}
                        {variations.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-3">Options</p>
                                <div className="flex flex-wrap gap-2">
                                    {variations.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariation(v.id === selectedVariation?.id ? null : v)}
                                            className={`px-4 py-2 rounded-md text-sm font-semibold border-2 transition-all ${selectedVariation?.id === v.id ? 'border-brand-primary text-brand-primary bg-[#e8f5e9]' : 'border-[#1e2520]/15 text-brand-secondary hover:border-brand-primary'}`}
                                        >
                                            {v.attributes?.map(a => a.option).join(' / ')}
                                            {v.price && <span className="ml-2 text-[#4a5e4d] text-xs">${v.price}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Short description */}
                        {product.short_description && (
                            <div className="text-sm text-[#4a5e4d] leading-relaxed mb-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.short_description }} />
                        )}

                        {(() => {
                            const isOutOfStock = selectedVariation 
                                ? (selectedVariation.stock_status === 'outofstock' || product.stock_status === 'outofstock')
                                : product.stock_status === 'outofstock';
                            
                            let maxStock = null;
                            if (selectedVariation) {
                                if (selectedVariation.stock_quantity !== null && selectedVariation.stock_quantity !== undefined) maxStock = selectedVariation.stock_quantity;
                                else if (product.stock_quantity !== null && product.stock_quantity !== undefined) maxStock = product.stock_quantity;
                            } else if (product.stock_quantity !== null && product.stock_quantity !== undefined) {
                                maxStock = product.stock_quantity;
                            }

                            return (
                                <>
                                    {isOutOfStock && <div className="mb-4 text-red-600 font-bold block">Currently Out of Stock</div>}
                                    {maxStock !== null && maxStock > 0 && !isOutOfStock && <div className="mb-2 text-[#4a5e4d] text-sm"><span className="font-bold">{maxStock}</span> in stock</div>}
                                    
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center border-2 border-[#1e2520]/15 rounded-md h-14 w-32 bg-white">
                                            <button 
                                                disabled={isOutOfStock}
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                                                className="px-3 h-full hover:bg-gray-50 hover:text-brand-primary text-brand-secondary transition-colors disabled:opacity-50"
                                            ><Minus size={15} /></button>
                                            <span className="flex-1 text-center font-bold">{quantity}</span>
                                            <button 
                                                disabled={isOutOfStock || (maxStock !== null && quantity >= maxStock)}
                                                onClick={() => setQuantity(maxStock !== null ? Math.min(maxStock, quantity + 1) : quantity + 1)} 
                                                className="px-3 h-full hover:bg-gray-50 hover:text-brand-primary text-brand-secondary transition-colors disabled:opacity-50"
                                            ><Plus size={15} /></button>
                                        </div>
                                        <button
                                            disabled={isOutOfStock}
                                            onClick={handleAddToCart}
                                            className={`flex-1 h-14 rounded-md font-bold text-[0.95rem] flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : added ? 'bg-[#1b5e20] text-white active:scale-95' : 'bg-brand-primary text-white hover:bg-[#1b5e20] hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
                                        >
                                            {isOutOfStock ? 'Out of Stock' : added ? <><CheckCircle2 size={20} /> Added!</> : <><ShoppingCart size={17} /> Add to Cart — ${(parseFloat(displayPrice || 0) * quantity).toFixed(2)}</>}
                                        </button>
                                    </div>
                                </>
                            );
                        })()}

                        <div className="flex items-center gap-2 text-sm text-[#4a5e4d] font-medium mb-6">
                            <CheckCircle2 size={14} className="text-brand-primary shrink-0" />
                            Every purchase supports NewLife Project programs.
                        </div>

                        <div className="flex items-center gap-4 border-t border-[#1e2520]/10 pt-6">
                            <button onClick={() => toggleWishlist(product)} className={`flex items-center gap-2 text-sm font-bold transition-colors ${isWishlisted(product.id) ? 'text-red-500' : 'text-[#4a5e4d] hover:text-red-500'}`}>
                                <Heart size={15} className={isWishlisted(product.id) ? 'fill-current' : ''} />
                                {isWishlisted(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                            </button>
                            <span className="text-gray-200">|</span>
                            <button className="flex items-center gap-2 text-sm font-bold text-[#4a5e4d] hover:text-brand-primary transition-colors">
                                <Share2 size={15} /> Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs: Description / Reviews */}
                <div className="border-t border-[#1e2520]/10 pb-20">
                    <div className="flex gap-0 border-b border-[#1e2520]/10 mb-10">
                        {['description', 'reviews'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 text-sm font-bold capitalize tracking-wide border-b-2 transition-all -mb-px ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-[#4a5e4d] hover:text-brand-primary'}`}>
                                {tab}{tab === 'reviews' ? ` (${reviews.length})` : ''}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'description' && (
                        <div className="prose prose-sm sm:prose max-w-3xl text-[#4a5e4d] leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }} />
                    )}

                    {activeTab === 'reviews' && (
                        <div className="max-w-3xl">
                            {/* Existing reviews */}
                            {reviews.length > 0 ? (
                                <div className="space-y-5 mb-12">
                                    {reviews.map(r => (
                                        <div key={r.id} className="bg-white border border-[#1e2520]/10 rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="font-bold text-brand-secondary text-sm">{r.reviewer}</p>
                                                    <p className="text-xs text-[#4a5e4d]">{new Date(r.date_created).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex gap-0.5 text-[#f5c842]">
                                                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? "fill-current" : "text-gray-300"} />)}
                                                </div>
                                            </div>
                                            <div className="text-sm text-[#4a5e4d] leading-relaxed" dangerouslySetInnerHTML={{ __html: r.review }} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[#4a5e4d] mb-10">No customer reviews yet. Be the first!</p>
                            )}

                            {/* Submit review form */}
                            <div className="bg-white border border-[#1e2520]/10 rounded-xl p-8">
                                <h3 className="font-serif text-2xl font-bold text-brand-secondary mb-6">{reviewSuccess ? '✅ Review submitted!' : 'Write a Review'}</h3>
                                {!reviewSuccess && (
                                    <form onSubmit={handleReviewSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">Your Name</label>
                                                <input required type="text" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-[#f5f8f5] focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm text-brand-secondary font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">Email</label>
                                                <input required type="email" value={reviewForm.email} onChange={e => setReviewForm({ ...reviewForm, email: e.target.value })} className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-[#f5f8f5] focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm text-brand-secondary font-medium" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })} className={`text-2xl transition-transform hover:scale-110 ${n <= reviewForm.rating ? 'text-[#f5c842]' : 'text-gray-300'}`}>★</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[#4a5e4d] mb-2">Your Review</label>
                                            <textarea required rows={4} value={reviewForm.review} onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })} placeholder="Share your experience..." className="w-full border border-[#1e2520]/15 rounded-md px-4 py-3 bg-[#f5f8f5] focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none text-sm text-brand-secondary font-medium" />
                                        </div>
                                        <button type="submit" disabled={reviewLoading} className="btn-primary gap-2 disabled:opacity-60">
                                            {reviewLoading ? 'Submitting…' : <><Send size={14} /> Submit Review</>}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <div className="border-t border-[#1e2520]/10 py-16">
                        <h2 className="font-serif text-3xl font-bold text-brand-secondary mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {related.map(p => (
                                <Link key={p.id} to={`/product/${p.id}`} onClick={() => window.scrollTo(0, 0)} className="group bg-white rounded-xl border border-[#1e2520]/10 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                    <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
                                        <img src={p.images?.[0]?.src} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-serif font-bold text-brand-secondary text-sm line-clamp-2 group-hover:text-brand-primary transition-colors">{p.name}</h4>
                                        <p className="font-serif font-bold text-brand-secondary mt-2">${p.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
