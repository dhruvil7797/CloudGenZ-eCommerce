// ============================================================
// WooCommerce API — Central Configuration
// All API logic lives here. Change URL/keys in ONE place.
// ============================================================

export const WOOCOMMERCE_URL = 'https://seagreen-squid-493803.hostingersite.com';
const CONSUMER_KEY = 'ck_6e49ac532ef9d2c2f059515f30ef2a0fa60d051b';
const CONSUMER_SECRET = 'cs_6636d1fc8fa9f6d5767f046460dde2e884cf5d6c';

// ─── Core fetch helper ───────────────────────────────────────
// BUG FIX: options spread BEFORE headers so our auth headers can never be
// accidentally overwritten by a caller passing their own headers object.
async function wooFetch(endpoint, options = {}) {
    const { headers: callerHeaders, ...restOptions } = options;
    const res = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3${endpoint}`, {
        ...restOptions,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)}`,
            ...callerHeaders   // allow callers to ADD headers, not replace
        }
    });

    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error(`Server returned non-JSON response (${res.status})`);
    }

    if (!res.ok) {
        // Map common WooCommerce error codes to friendly messages
        const CODE_MAP = {
            rest_customer_invalid_email: 'That email address is not valid.',
            'registration-error-email-exists': 'An account already exists with that email. Please sign in.',
            woocommerce_rest_customer_invalid: 'Customer data is invalid. Please check your details.',
            rest_forbidden: 'You do not have permission to perform this action.',
            rest_invalid_param: 'Some of the information you entered is invalid.',
        };
        const friendly = CODE_MAP[data.code] || data.message || `API error ${res.status}`;
        throw new Error(friendly);
    }

    return data;
}

// ─── PRODUCTS ────────────────────────────────────────────────

/** Fetch paginated products with optional filters */
export async function fetchProducts({
    page = 1, perPage = 12, category = '',
    search = '', orderby = 'date', order = 'desc'
} = {}) {
    const params = new URLSearchParams({
        page,
        per_page: perPage,
        orderby,
        order,
        status: 'publish',          // only show published products
        ...(category ? { category } : {}),
        ...(search ? { search } : {})
    });
    try {
        return await wooFetch(`/products?${params}`);
    } catch (e) {
        console.error('fetchProducts:', e);
        return [];
    }
}

/** Fetch a single product by ID */
export async function fetchProduct(id) {
    if (!id) return null;
    try {
        return await wooFetch(`/products/${id}`);
    } catch (e) {
        console.error('fetchProduct:', e);
        return null;
    }
}

/** Fetch related products from the same category (excludes current product) */
export async function fetchRelatedProducts(categoryId, excludeId) {
    if (!categoryId) return [];
    try {
        const products = await wooFetch(
            `/products?category=${categoryId}&per_page=5&status=publish`
        );
        // Filter out the current product
        return products.filter(p => p.id !== parseInt(excludeId)).slice(0, 4);
    } catch (e) {
        console.error('fetchRelatedProducts:', e);
        return [];
    }
}

/** Fetch variations for a variable product */
export async function fetchVariations(productId) {
    if (!productId) return [];
    try {
        return await wooFetch(`/products/${productId}/variations?per_page=50`);
    } catch (e) {
        console.error('fetchVariations:', e);
        return [];
    }
}

/** Live search — debounced in the UI, min 2 chars */
export async function searchProducts(query) {
    if (!query || query.trim().length < 2) return [];
    const params = new URLSearchParams({
        search: query.trim(),
        per_page: 8,
        status: 'publish'
    });
    try {
        return await wooFetch(`/products?${params}`);
    } catch (e) {
        console.error('searchProducts:', e);
        return [];
    }
}

// ─── CATEGORIES ──────────────────────────────────────────────

export async function fetchCategories() {
    try {
        return await wooFetch('/products/categories?per_page=100&hide_empty=true');
    } catch (e) {
        console.error('fetchCategories:', e);
        return [];
    }
}

// ─── REVIEWS ─────────────────────────────────────────────────

export async function fetchProductReviews(productId) {
    if (!productId) return [];
    try {
        return await wooFetch(`/products/reviews?product=${productId}&status=approved`);
    } catch (e) {
        console.error('fetchProductReviews:', e);
        return [];
    }
}

/** Submit a product review — now with try/catch so it never silently crashes */
export async function submitReview({ productId, reviewerName, reviewerEmail, review, rating }) {
    if (!productId || !reviewerName || !reviewerEmail || !review) {
        throw new Error('Please fill in all review fields.');
    }
    try {
        return await wooFetch('/products/reviews', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                reviewer: reviewerName,
                reviewer_email: reviewerEmail,
                review,
                rating: Number(rating)
            })
        });
    } catch (e) {
        console.error('submitReview:', e);
        throw e;   // re-throw so the UI can display the error
    }
}

// ─── ORDERS ──────────────────────────────────────────────────

export async function createOrder(orderData) {
    try {
        return await wooFetch('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    } catch (e) {
        console.error('createOrder:', e);
        throw e;
    }
}

/** Fetch all orders belonging to a logged-in customer (by customer ID) */
export async function fetchCustomerOrders(customerId) {
    if (!customerId) return [];
    try {
        return await wooFetch(`/orders?customer=${customerId}&per_page=20&orderby=date&order=desc`);
    } catch (e) {
        console.error('fetchCustomerOrders:', e);
        return [];
    }
}

/** Fetch a single order by ID (for order tracking / receipt) */
export async function fetchOrder(orderId) {
    if (!orderId) return null;
    try {
        return await wooFetch(`/orders/${orderId}`);
    } catch (e) {
        console.error('fetchOrder:', e);
        return null;
    }
}

// ─── CUSTOMERS ───────────────────────────────────────────────

export async function registerCustomer(data) {
    // BUG FIX: wrap in try/catch with friendly error messages
    try {
        return await wooFetch('/customers', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    } catch (e) {
        // WooCommerce returns "registration-error-email-exists" etc.
        if (e.message?.toLowerCase().includes('email')) {
            throw new Error('An account already exists with that email. Please sign in instead.');
        }
        throw e;
    }
}

export async function loginCustomer(email) {
    if (!email) throw new Error('Please enter your email address.');
    try {
        const users = await wooFetch(`/customers?email=${encodeURIComponent(email.trim())}`);
        if (users && users.length > 0) return users[0];
        throw new Error('No account found with that email address. Please register first.');
    } catch (e) {
        // Don't wrap WooCommerce auth errors with another layer
        if (e.message?.includes('No account found')) throw e;
        throw new Error('Could not sign in. Please check your email and try again.');
    }
}

/** Update customer profile/address back to WooCommerce */
export async function updateCustomer(customerId, data) {
    if (!customerId) throw new Error('Not signed in.');
    try {
        return await wooFetch(`/customers/${customerId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.error('updateCustomer:', e);
        throw e;
    }
}

// ─── COUPONS ─────────────────────────────────────────────────

export async function validateCoupon(code) {
    if (!code) throw new Error('Please enter a coupon code.');
    try {
        const coupons = await wooFetch(`/coupons?code=${encodeURIComponent(code.trim())}`);
        if (coupons && coupons.length > 0) {
            const coupon = coupons[0];
            // Check expiry
            if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
                throw new Error('This coupon has expired.');
            }
            return coupon;
        }
        throw new Error('Invalid coupon code. Please try again.');
    } catch (e) {
        throw e;
    }
}

// ─── SHIPPING ────────────────────────────────────────────────

export async function fetchShippingZones() {
    try {
        return await wooFetch('/shipping/zones');
    } catch (e) {
        console.error('fetchShippingZones:', e);
        return [];
    }
}
