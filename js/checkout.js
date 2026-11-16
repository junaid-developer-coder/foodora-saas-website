/**
 * ==========================================================================
 * FOODORA SAAS - CHECKOUT CONTROLLER (js/checkout.js)
 * Delivery details, simulated payment options, order creation, and validation.
 * ==========================================================================
 */

const Checkout = {
  selectedPayment: "cod",
  selectedAddressId: "addr_1",

  init() {
    this.renderCheckout();
  },

  renderCheckout() {
    const container = document.getElementById("checkoutContainer");
    if (!container) return;

    const cart = StorageManager.getCart();
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p class="empty-state-text">Please add some food items before proceeding to checkout.</p>
          <a href="restaurants.html" class="btn btn-primary mt-4">Browse Restaurants</a>
        </div>
      `;
      return;
    }

    const user = StorageManager.getCurrentUser() || {
      name: "Guest Foodie",
      email: "guest@example.com",
      phone: "+92 300 1234567",
      addresses: [{ id: "addr_1", title: "Home", text: "House 42, Phase 5, DHA, Lahore", isDefault: true }]
    };

    const totals = Cart.calculateTotals();

    container.innerHTML = `
      <div class="checkout-grid">
        <!-- Left: Details & Payment -->
        <div class="checkout-forms-col">
          <!-- Step 1: Contact Details -->
          <div class="checkout-section-card">
            <div class="checkout-section-header">
              <span class="checkout-step-badge">1</span>
              <h2 class="checkout-section-title">Customer Contact Details</h2>
            </div>
            <div class="grid grid-cols-1 grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Full Name <span class="required">*</span></label>
                <input type="text" class="form-input" id="checkoutName" value="${Validation.escapeHtml(user.name)}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Contact Phone <span class="required">*</span></label>
                <input type="text" class="form-input" id="checkoutPhone" value="${Validation.escapeHtml(user.phone || '+92 300 1234567')}" required />
              </div>
            </div>
          </div>

          <!-- Step 2: Delivery Address -->
          <div class="checkout-section-card">
            <div class="checkout-section-header">
              <span class="checkout-step-badge">2</span>
              <h2 class="checkout-section-title">Delivery Address</h2>
            </div>
            <div class="saved-addresses-grid" id="checkoutAddressesGrid">
              ${(user.addresses || [{ id: "addr_1", title: "Home", text: "DHA Phase 5, Lahore" }]).map(addr => `
                <div class="address-select-card ${addr.id === this.selectedAddressId ? 'selected' : ''}" onclick="Checkout.selectAddress('${addr.id}')">
                  <div class="address-tag">${Validation.escapeHtml(addr.title)}</div>
                  <div class="address-text">${Validation.escapeHtml(addr.text)}</div>
                </div>
              `).join("")}
            </div>

            <div class="form-group mt-4">
              <label class="form-label">Delivery Street Address / Apartment Details <span class="required">*</span></label>
              <textarea class="form-textarea" id="checkoutAddressDetails" rows="2" placeholder="House/Flat number, Street name, Landmark...">${(user.addresses && user.addresses[0]) ? user.addresses[0].text : 'House 42, Street 8, Phase 5, DHA, Lahore'}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Rider Instructions (Optional)</label>
              <input type="text" class="form-input" id="checkoutRiderNotes" placeholder="e.g. Ring the bell twice, gate code #1234..." />
            </div>
          </div>

          <!-- Step 3: Payment Method -->
          <div class="checkout-section-card">
            <div class="checkout-section-header">
              <span class="checkout-step-badge">3</span>
              <h2 class="checkout-section-title">Payment Method</h2>
            </div>

            <div class="payment-methods-grid">
              <div class="payment-opt-card ${this.selectedPayment === 'cod' ? 'selected' : ''}" onclick="Checkout.selectPayment('cod')">
                <div class="payment-opt-icon">💵</div>
                <div class="payment-opt-info">
                  <span class="payment-opt-name">Cash on Delivery</span>
                  <span class="payment-opt-desc">Pay cash when rider arrives</span>
                </div>
              </div>

              <div class="payment-opt-card ${this.selectedPayment === 'jazzcash' ? 'selected' : ''}" onclick="Checkout.selectPayment('jazzcash')">
                <div class="payment-opt-icon">📱</div>
                <div class="payment-opt-info">
                  <span class="payment-opt-name">JazzCash</span>
                  <span class="payment-opt-desc">Direct mobile wallet payment</span>
                </div>
              </div>

              <div class="payment-opt-card ${this.selectedPayment === 'easypaisa' ? 'selected' : ''}" onclick="Checkout.selectPayment('easypaisa')">
                <div class="payment-opt-icon">💳</div>
                <div class="payment-opt-info">
                  <span class="payment-opt-name">Easypaisa</span>
                  <span class="payment-opt-desc">Mobile account payment</span>
                </div>
              </div>

              <div class="payment-opt-card ${this.selectedPayment === 'card' ? 'selected' : ''}" onclick="Checkout.selectPayment('card')">
                <div class="payment-opt-icon">🏦</div>
                <div class="payment-opt-info">
                  <span class="payment-opt-name">Debit / Credit Card</span>
                  <span class="payment-opt-desc">Visa, Mastercard, PayPak</span>
                </div>
              </div>
            </div>

            <!-- Dynamic Simulation Details Box -->
            <div class="simulated-payment-box" id="paymentDetailsBox">
              ${this.renderPaymentInputs()}
            </div>
          </div>
        </div>

        <!-- Right: Order Summary Sidebar -->
        <div class="checkout-summary-col">
          <div class="cart-summary-card">
            <h3 class="cart-summary-title">Order Recap (${totals.itemCount} items)</h3>
            
            <div style="max-height: 220px; overflow-y: auto; margin-bottom: var(--space-4);">
              ${cart.map(item => `
                <div class="flex items-center justify-between text-xs py-2 border-b" style="border-color: var(--border-color);">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-primary">${item.quantity}x</span>
                    <div>
                      <div class="font-semibold">${Validation.escapeHtml(item.name)}</div>
                      ${item.selectedSize ? `<div class="text-muted">${item.selectedSize}</div>` : ''}
                    </div>
                  </div>
                  <span class="font-bold">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              `).join("")}
            </div>

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
                  <span>Promo Discount</span>
                  <span>-Rs. ${totals.discount.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="summary-calc-row total-row">
                <span>Total Due</span>
                <span>Rs. ${totals.total.toLocaleString()}</span>
              </div>
            </div>

            <button class="btn btn-primary btn-block btn-lg" id="placeOrderBtn" onclick="Checkout.placeOrder()">
              Confirm & Place Order • Rs. ${totals.total.toLocaleString()}
            </button>

            <div class="text-xs text-muted text-center mt-3 flex items-center justify-center gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>Safe & Secure 256-Bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectAddress(addrId) {
    this.selectedAddressId = addrId;
    const cards = document.querySelectorAll(".address-select-card");
    cards.forEach(c => c.classList.remove("selected"));
    const target = event.currentTarget;
    if (target) target.classList.add("selected");
  },

  selectPayment(method) {
    this.selectedPayment = method;
    const cards = document.querySelectorAll(".payment-opt-card");
    cards.forEach(c => c.classList.remove("selected"));
    event.currentTarget.classList.add("selected");

    const box = document.getElementById("paymentDetailsBox");
    if (box) box.innerHTML = this.renderPaymentInputs();
  },

  renderPaymentInputs() {
    if (this.selectedPayment === "cod") {
      return `
        <span class="simulated-badge">Cash on Delivery</span>
        <p class="text-xs text-secondary mt-1">Please keep exact change ready when the Foodora rider arrives at your doorstep.</p>
      `;
    } else if (this.selectedPayment === "jazzcash") {
      return `
        <span class="simulated-badge">JazzCash Mobile Wallet</span>
        <div class="form-group mt-2">
          <label class="form-label">JazzCash Account Number</label>
          <input type="text" class="form-input" placeholder="03XX XXXXXXX" required />
          <span class="text-xs text-muted mt-1">You will receive an authorization prompt on your mobile device.</span>
        </div>
      `;
    } else if (this.selectedPayment === "easypaisa") {
      return `
        <span class="simulated-badge">Easypaisa Mobile Account</span>
        <div class="form-group mt-2">
          <label class="form-label">Easypaisa Account Number</label>
          <input type="text" class="form-input" placeholder="03XX XXXXXXX" required />
          <span class="text-xs text-muted mt-1">Approve the prompt on your Easypaisa app to authorize payment.</span>
        </div>
      `;
    } else if (this.selectedPayment === "card") {
      return `
        <span class="simulated-badge">Credit / Debit Card</span>
        <div class="grid grid-cols-1 grid-cols-2 gap-3 mt-2">
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Card Number</label>
            <input type="text" class="form-input" placeholder="•••• •••• •••• ••••" required />
          </div>
          <div class="form-group">
            <label class="form-label">Expiry (MM/YY)</label>
            <input type="text" class="form-input" placeholder="MM/YY" required />
          </div>
          <div class="form-group">
            <label class="form-label">CVV</label>
            <input type="password" class="form-input" placeholder="•••" maxlength="4" required />
          </div>
        </div>
      `;
    }
  },

  placeOrder() {
    const nameEl = document.getElementById("checkoutName");
    const phoneEl = document.getElementById("checkoutPhone");
    const addressEl = document.getElementById("checkoutAddressDetails");
    const riderNotes = document.getElementById("checkoutRiderNotes")?.value.trim() || "";
    const placeBtn = document.getElementById("placeOrderBtn");

    if (!nameEl.value.trim() || !phoneEl.value.trim() || !addressEl.value.trim()) {
      FoodoraApp.showToast("Please fill in all required delivery details.", "error");
      return;
    }

    // Disable button to prevent duplicate submissions
    placeBtn.classList.add("disabled");
    placeBtn.innerHTML = `<span class="animate-spin">↻</span> Placing Your Order...`;

    setTimeout(() => {
      const cart = StorageManager.getCart();
      const totals = Cart.calculateTotals();
      const orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);

      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        restaurantId: cart[0]?.restaurantId || "rest_1",
        restaurantName: cart[0]?.restaurantName || "Selected Restaurant",
        items: cart,
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        discount: totals.discount,
        couponCode: Cart.appliedCoupon ? Cart.appliedCoupon.code : null,
        total: totals.total,
        status: "placed",
        statusHistory: [
          {
            status: "placed",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "Order Placed Successfully"
          }
        ],
        customer: {
          name: nameEl.value.trim(),
          phone: phoneEl.value.trim(),
          address: addressEl.value.trim(),
          instructions: riderNotes
        },
        payment: {
          method: this.selectedPayment.toUpperCase(),
          status: this.selectedPayment === "cod" ? "Pay upon Delivery" : "Paid"
        },
        rider: {
          name: "Bilal Ahmed",
          phone: "+92 333 4455667",
          rating: 4.9,
          bike: "Honda CD-70 (LEB-4921)"
        },
        estimatedDelivery: "25-35 min"
      };

      StorageManager.addOrder(newOrder);
      StorageManager.clearCart();

      FoodoraApp.showToast(`Order #${orderId} created successfully!`, "success");

      setTimeout(() => {
        window.location.href = `tracking.html?orderId=${orderId}`;
      }, 700);
    }, 900);
  }
};
