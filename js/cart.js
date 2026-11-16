/**
 * ==========================================================================
 * FOODORA SAAS - CART CONTROLLER (js/cart.js)
 * Shopping cart rendering, calculations, coupon discounts, and checkout link.
 * ==========================================================================
 */

const Cart = {
  appliedCoupon: null,

  init() {
    this.renderCartPage();
    this.setupCouponHandler();
  },

  calculateTotals() {
    const items = StorageManager.getCart();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let deliveryFee = subtotal > 0 ? 150 : 0;
    if (subtotal >= 2000) deliveryFee = 0; // Free delivery over Rs. 2000

    let discount = 0;
    if (this.appliedCoupon && subtotal > 0) {
      if (this.appliedCoupon.discountType === "percent") {
        discount = (subtotal * this.appliedCoupon.discountValue) / 100;
        if (this.appliedCoupon.maxDiscount && discount > this.appliedCoupon.maxDiscount) {
          discount = this.appliedCoupon.maxDiscount;
        }
      } else if (this.appliedCoupon.discountType === "fixed") {
        discount = this.appliedCoupon.discountValue;
      } else if (this.appliedCoupon.discountType === "free_delivery") {
        deliveryFee = 0;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);

    return {
      subtotal,
      deliveryFee,
      discount,
      total,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0)
    };
  },

  renderCartPage() {
    const container = document.getElementById("cartLayoutContainer");
    if (!container) return;

    const items = StorageManager.getCart();
    const totals = this.calculateTotals();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🛒</div>
          <h2 class="empty-state-title">Your Cart is Empty</h2>
          <p class="empty-state-text">Explore our top-rated restaurants and add delicious foods to your tray!</p>
          <a href="restaurants.html" class="btn btn-primary btn-lg">Browse Restaurants</a>
        </div>
      `;
      return;
    }

    // Group items by restaurant
    const restName = items[0].restaurantName || "Selected Restaurant";

    container.innerHTML = `
      <div class="cart-layout-grid">
        <!-- Left Panel: Cart Items -->
        <div class="cart-items-panel">
          <div class="cart-header-row">
            <div>
              <h2 class="text-xl font-bold">Shopping Cart (${totals.itemCount} items)</h2>
              <span class="text-xs text-muted">Review your selected dishes before checkout</span>
            </div>
            <button class="btn btn-outline btn-sm text-danger" onclick="Cart.clearAll()">Clear Cart</button>
          </div>

          <div class="cart-restaurant-banner">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Ordering from: <strong>${Validation.escapeHtml(restName)}</strong>
          </div>

          <div class="cart-items-list">
            ${items.map(item => `
              <div class="cart-item-row" data-id="${item.cartItemId}">
                <img src="${item.image}" alt="${Validation.escapeHtml(item.name)}" class="cart-item-img" />
                <div class="cart-item-info">
                  <div class="cart-item-title">${Validation.escapeHtml(item.name)}</div>
                  <div class="cart-item-customs">
                    ${item.selectedSize ? `<span>Portion: <strong>${item.selectedSize}</strong></span>` : ''}
                    ${item.selectedExtras && item.selectedExtras.length ? ` • Extras: ${item.selectedExtras.join(", ")}` : ''}
                    ${item.instructions ? `<div class="text-xs text-muted italic mt-1">Note: "${item.instructions}"</div>` : ''}
                  </div>
                  <div class="mt-2 text-primary font-bold text-sm">
                    Rs. ${item.price.toLocaleString()} each
                  </div>
                </div>
                <div class="qty-control">
                  <button class="qty-btn" onclick="Cart.updateQty('${item.cartItemId}', -1)">-</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn" onclick="Cart.updateQty('${item.cartItemId}', 1)">+</button>
                </div>
                <div class="text-right" style="min-width: 80px;">
                  <div class="cart-item-price">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                </div>
                <button class="cart-item-del-btn" onclick="Cart.removeItem('${item.cartItemId}')" title="Remove Item">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Right Panel: Summary -->
        <div class="cart-summary-card">
          <h3 class="cart-summary-title">Order Summary</h3>

          <div class="coupon-box">
            <input type="text" class="coupon-input" id="couponCodeInput" placeholder="Promo code (e.g. FOODORA50)" value="${this.appliedCoupon ? this.appliedCoupon.code : ''}" />
            <button class="btn btn-secondary btn-sm" id="applyCouponBtn">Apply</button>
          </div>
          ${this.appliedCoupon ? `
            <div class="flex items-center justify-between text-xs text-success mb-3 p-2 rounded" style="background: var(--color-success-light);">
              <span>Coupon <strong>${this.appliedCoupon.code}</strong> Applied!</span>
              <button class="text-danger font-bold cursor-pointer" onclick="Cart.removeCoupon()">&times; Remove</button>
            </div>
          ` : ''}

          <div class="summary-calc-list">
            <div class="summary-calc-row">
              <span>Subtotal</span>
              <span>Rs. ${totals.subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-calc-row">
              <span>Delivery Fee</span>
              <span>${totals.deliveryFee === 0 ? '<strong class="text-success">FREE</strong>' : `Rs. ${totals.deliveryFee.toLocaleString()}`}</span>
            </div>
            ${totals.discount > 0 ? `
              <div class="summary-calc-row discount-row">
                <span>Voucher Discount</span>
                <span>-Rs. ${totals.discount.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="summary-calc-row total-row">
              <span>Grand Total</span>
              <span>Rs. ${totals.total.toLocaleString()}</span>
            </div>
          </div>

          <a href="checkout.html" class="btn btn-primary btn-block btn-lg">
            Proceed to Checkout
          </a>
          <div class="text-center mt-3">
            <a href="restaurants.html" class="text-xs text-muted hover-underline">← Continue Shopping</a>
          </div>
        </div>
      </div>
    `;
  },

  updateQty(cartItemId, delta) {
    StorageManager.updateCartQty(cartItemId, delta);
    this.renderCartPage();
  },

  removeItem(cartItemId) {
    StorageManager.removeFromCart(cartItemId);
    FoodoraApp.showToast("Item removed from cart.", "info");
    this.renderCartPage();
  },

  clearAll() {
    if (confirm("Are you sure you want to empty your cart?")) {
      StorageManager.clearCart();
      FoodoraApp.showToast("Cart has been cleared.", "info");
      this.renderCartPage();
    }
  },

  setupCouponHandler() {
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "applyCouponBtn") {
        const input = document.getElementById("couponCodeInput");
        if (!input) return;
        const code = input.value.trim().toUpperCase();
        if (!code) {
          FoodoraApp.showToast("Please enter a voucher code.", "warning");
          return;
        }

        const coupons = StorageManager.getCoupons();
        const matched = coupons.find(c => c.code.toUpperCase() === code);

        if (!matched) {
          FoodoraApp.showToast("Invalid promo code. Try FOODORA50 or FREEDEL.", "error");
          return;
        }

        const totals = this.calculateTotals();
        if (matched.minOrder && totals.subtotal < matched.minOrder) {
          FoodoraApp.showToast(`Minimum order of Rs. ${matched.minOrder} required for ${code}.`, "warning");
          return;
        }

        this.appliedCoupon = matched;
        FoodoraApp.showToast(`Coupon ${code} applied successfully!`, "success");
        this.renderCartPage();
      }
    });
  },

  removeCoupon() {
    this.appliedCoupon = null;
    FoodoraApp.showToast("Coupon removed.", "info");
    this.renderCartPage();
  }
};
