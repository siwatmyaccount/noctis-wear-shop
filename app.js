/**
 * Noctis Wear - Core Application Logic
 * Updated: Real Images & Checkout System
 */

const App = (() => {
    const CONFIG = {
        STORAGE_KEY: 'noctis_cart_premium_v2',
        TOAST_DURATION: 3000
    };

    // ✅ อัปเดต: ใส่รูปสินค้าจริง (Real Image URLs)
    const state = {
        products: [
            { 
                id: 1, name: "Lumix Heavy Tee", category: "T-Shirt", price: 590, oldPrice: 890, sale: true, new: false,
                image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600"
            },
            { 
                id: 2, name: "Vortex Oversize", category: "T-Shirt", price: 450, oldPrice: null, sale: false, new: true,
                image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600"
            },
            { 
                id: 3, name: "Nova Silk Shirt", category: "Shirt", price: 1290, oldPrice: 1590, sale: true, new: false,
                image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&q=80&w=600"
            },
            { 
                id: 4, name: "Eclipse Hoodie", category: "Hoodie", price: 1500, oldPrice: null, sale: false, new: true,
                image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600"
            },
            { 
                id: 5, name: "Orion Smart Shirt", category: "Shirt", price: 990, oldPrice: null, sale: false, new: false,
                image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600"
            },
            { 
                id: 6, name: "Comet Graphic Tee", category: "T-Shirt", price: 390, oldPrice: 590, sale: true, new: false,
                image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&q=80&w=600"
            },
            { 
                id: 7, name: "Nebula Street Jacket", category: "Hoodie", price: 2100, oldPrice: 2500, sale: true, new: false,
                image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600"
            },
            { 
                id: 8, name: "Galaxy Zip Hoodie", category: "Hoodie", price: 1890, oldPrice: null, sale: false, new: true,
                image: "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=600"
            }
        ],
        cart: []
    };

    const elements = {};

    const init = () => {
        cacheDOM();
        loadCart();
        if (elements.productGrid) {
            renderProducts(state.products);
            bindShopEvents();
        }
        bindGlobalEvents();
        updateCartCount();
        initScrollAnimations();
    };

    const cacheDOM = () => {
        elements.productGrid = document.getElementById('product-grid');
        elements.resultCount = document.getElementById('result-count');
        elements.cartSidebar = document.getElementById('cart-sidebar');
        elements.cartItems = document.getElementById('cart-items');
        elements.cartTotal = document.getElementById('cart-total');
        elements.cartBadge = document.getElementById('cart-count-badge');
        elements.filterCats = document.querySelectorAll('.filter-cat');
        elements.filterPrices = document.querySelectorAll('input[name="price"]');
        elements.sortSelect = document.getElementById('sort-select');
    };

    const initScrollAnimations = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    };

    const loadCart = () => {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            state.cart = stored ? JSON.parse(stored) : [];
        } catch (e) { state.cart = []; }
    };

    const saveCart = () => {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.cart));
        updateCartCount();
        renderCartSidebar();
    };

    const renderProducts = (items) => {
        if (!elements.productGrid) return;
        
        elements.productGrid.innerHTML = items.map((item, index) => {
            const saleBadge = item.sale ? `<div class="badge-new" style="background:var(--danger); color:#fff;">SALE</div>` : '';
            const newBadge = item.new && !item.sale ? `<div class="badge-new">NEW</div>` : '';
            const priceHtml = item.oldPrice 
                ? `<span class="old-price">฿${formatNumber(item.oldPrice)}</span>฿${formatNumber(item.price)}` 
                : `฿${formatNumber(item.price)}`;

            return `
            <div class="product-card reveal-on-scroll" style="transition-delay: ${index * 50}ms">
                <div class="product-img-wrapper">
                    ${saleBadge} ${newBadge}
                    <img src="${item.image}" class="product-img" loading="lazy" alt="${item.name}">
                    <div class="card-overlay">
                        <button class="btn-icon" data-action="add-to-cart" data-id="${item.id}">Add to Cart</button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${item.category}</div>
                    <div class="product-title">${item.name}</div>
                    <div class="product-price">${priceHtml}</div>
                </div>
            </div>`;
        }).join('');

        initScrollAnimations();
        if (elements.resultCount) elements.resultCount.innerText = `SHOWING ${items.length} RESULTS`;
    };

    const renderCartSidebar = () => {
        if (!elements.cartItems) return;
        const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        elements.cartItems.innerHTML = state.cart.map((item, index) => `
            <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px;">
                <div style="display:flex; gap:15px;">
                    <img src="${item.image}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
                    <div>
                        <div style="font-weight:700; font-size:0.9rem;">${item.name}</div>
                        <div style="font-size:0.8rem; color: var(--text-muted); margin-top:5px;">QTY: ${item.qty}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:600;">฿${formatNumber(item.price * item.qty)}</div>
                    <div style="color: var(--danger); font-size:0.7rem; cursor:pointer; text-decoration:underline; margin-top:5px; text-transform:uppercase;" 
                         data-action="remove-item" data-index="${index}">Remove</div>
                </div>
            </div>`).join('');

        if (elements.cartTotal) elements.cartTotal.querySelector('span:last-child').innerText = `฿${formatNumber(total)}`;
    };

    const bindShopEvents = () => {
        const handleFilter = () => {
            let result = [...state.products];
            const checkedCats = Array.from(elements.filterCats).filter(cb => cb.checked).map(cb => cb.value);
            if (checkedCats.length) result = result.filter(p => checkedCats.includes(p.category));

            const priceVal = document.querySelector('input[name="price"]:checked')?.value;
            if (priceVal) {
                if (priceVal === '500') result = result.filter(p => p.price <= 500);
                else if (priceVal === '1000') result = result.filter(p => p.price > 500 && p.price <= 1000);
                else if (priceVal === '1000+') result = result.filter(p => p.price > 1000);
            }

            const sortVal = elements.sortSelect.value;
            if (sortVal === 'low-high') result.sort((a,b) => a.price - b.price);
            else if (sortVal === 'high-low') result.sort((a,b) => b.price - a.price);

            renderProducts(result);
        };

        elements.filterCats.forEach(el => el.addEventListener('change', handleFilter));
        elements.filterPrices.forEach(el => el.addEventListener('change', handleFilter));
        elements.sortSelect.addEventListener('change', handleFilter);

        elements.productGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="add-to-cart"]');
            if (btn) addToCart(parseInt(btn.dataset.id));
        });
    };

    const bindGlobalEvents = () => {
        if (elements.cartSidebar) {
            elements.cartSidebar.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('[data-action="remove-item"]');
                if (removeBtn) removeFromCart(parseInt(removeBtn.dataset.index));
            });
        }
    };

    const addToCart = (id) => {
        const product = state.products.find(p => p.id === id);
        if (!product) return;
        const existing = state.cart.find(i => i.id === id);
        if (existing) existing.qty++;
        else state.cart.push({ ...product, qty: 1 });
        saveCart();
        showToast(`ADDED TO CART`);
        toggleCart(true);
    };

    const removeFromCart = (index) => {
        state.cart.splice(index, 1);
        saveCart();
    };

    const toggleCart = (show) => {
        if (elements.cartSidebar) elements.cartSidebar.style.right = show ? '0' : '-100%';
        if (show) renderCartSidebar();
    };

    const updateCartCount = () => {
        if (!elements.cartBadge) return;
        const count = state.cart.reduce((acc, item) => acc + item.qty, 0);
        elements.cartBadge.innerText = count;
        elements.cartBadge.style.display = count > 0 ? 'flex' : 'center'; // Fix display type
        elements.cartBadge.style.display = count > 0 ? 'flex' : 'none';
        elements.cartBadge.style.justifyContent = 'center';
        elements.cartBadge.style.alignItems = 'center';
    };

    const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

    const showToast = (msg) => {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), CONFIG.TOAST_DURATION);
    };

    // --- Checkout Logic ---
    const openCheckout = () => {
        if (state.cart.length === 0) return showToast("Your cart is empty!");
        toggleCart(false);
        document.getElementById('checkout-overlay').classList.add('active');
    };

    const closeCheckout = () => {
        document.getElementById('checkout-overlay').classList.remove('active');
    };

    const processCheckout = (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = "PROCESSING...";
        btn.disabled = true;

        setTimeout(() => {
            state.cart = [];
            saveCart();
            closeCheckout();
            showToast("🎉 Order Placed Successfully!");
            btn.innerText = originalText;
            btn.disabled = false;
            e.target.reset();
        }, 1500);
    };

    return { init, toggleCart, openCheckout, closeCheckout, processCheckout };
})();

document.addEventListener('DOMContentLoaded', App.init);