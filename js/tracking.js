/**
 * ==========================================================================
 * FOODORA SAAS - ORDER TRACKING CONTROLLER (js/tracking.js)
 * Live animated timeline, status advance simulator, rider info, and cancellation.
 * ==========================================================================
 */

const Tracking = {
  currentOrderId: null,

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    this.currentOrderId = orderId;
    this.renderTrackingPage(orderId);
    this.setupOrderSearch();
  },

  renderTrackingPage(orderId) {
    const container = document.getElementById("trackingContainer");
    if (!container) return;

    let order = null;
    if (orderId) {
      order = StorageManager.getOrderById(orderId);
    } else {
      // Pick first active order or latest order
      const orders = StorageManager.getOrders();
      order = orders.find(o => o.status !== "delivered" && o.status !== "cancelled") || orders[0];
    }

    if (!order) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛵</div>
          <h2 class="empty-state-title">No Active Order Found</h2>
          <p class="empty-state-text">You don't have any ongoing deliveries right now. Check your past orders or place a fresh meal order!</p>
          <div class="flex gap-4">
            <a href="restaurants.html" class="btn btn-primary">Order Now</a>
            <a href="orders.html" class="btn btn-outline">Past Orders</a>
          </div>
        </div>
      `;
      return;
    }

    this.currentOrderId = order.id;

    // Define the 6 progressive stages
    const stages = [
      { key: "placed", title: "Order Placed", desc: "We have received your order", icon: "📝" },
      { key: "confirmed", title: "Order Confirmed", desc: "Restaurant accepted your order", icon: "✅" },
      { key: "preparing", title: "Preparing Food", desc: "Chefs are crafting your dish", icon: "🍳" },
      { key: "ready", title: "Ready for Pickup", desc: "Food packed & ready", icon: "🥡" },
      { key: "out_for_delivery", title: "Out for Delivery", desc: "Rider on the road to you", icon: "🛵" },
      { key: "delivered", title: "Delivered", desc: "Meal enjoyed! Bon appétit", icon: "🎉" }
    ];

    const currentStageIndex = stages.findIndex(s => s.key === order.status);
    const isCancelled = order.status === "cancelled";
    const canCancel = (order.status === "placed" || order.status === "confirmed") && !isCancelled;

    container.innerHTML = `
      <div class="tracking-layout-grid" style="display: grid; grid-template-columns: 1.6fr 1fr; gap: var(--space-8); align-items: flex-start; margin-bottom: var(--space-12);">
        <!-- Left: Status Timeline & Simulation -->
        <div class="tracking-main-panel">
          <div class="card mb-6">
            <div class="flex items-center justify-between pb-4 border-b mb-6" style="border-color: var(--border-color); flex-wrap: wrap; gap: var(--space-3);">
              <div>
                <span class="text-xs text-muted">Tracking Order Reference</span>
                <h1 class="text-2xl font-extrabold text-primary">${order.id}</h1>
              </div>
              <div class="flex items-center gap-3">
                <span class="badge ${isCancelled ? 'badge-danger' : (order.status === 'delivered' ? 'badge-success' : 'badge-orange')}" style="font-size: 13px; padding: 6px 14px;">
                  ● ${isCancelled ? 'CANCELLED' : order.status.toUpperCase().replace(/_/g, ' ')}
                </span>
                ${canCancel ? `
                  <button class="btn btn-outline btn-sm text-danger" onclick="Tracking.cancelOrder('${order.id}')">Cancel Order</button>
                ` : ''}
              </div>
            </div>

            <!-- Live Delivery Status Banner -->
            <div class="p-4 mb-6 rounded-xl flex items-center justify-between flex-wrap gap-3" style="background: var(--bg-surface-secondary); border: 1px solid var(--border-color);">
              <div class="flex items-center gap-3">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--color-success); box-shadow: 0 0 0 4px var(--primary-light);"></span>
                <div>
                  <div class="text-xs font-bold text-main uppercase">Live Delivery Tracking Active</div>
                  <div class="text-xs text-secondary">Rider dispatch & kitchen status updated in real-time</div>
                </div>
              </div>
              <div class="text-xs text-secondary">
                Estimated Delivery: <strong class="text-primary">${order.estimatedDelivery || '25-30 mins'}</strong>
              </div>
            </div>

            ${isCancelled ? `
              <div class="p-4 rounded-xl text-danger mb-6" style="background: var(--color-error-light);">
                <strong>Order Cancelled:</strong> This order was cancelled at the customer's request.
              </div>
            ` : `
              <!-- Visual Stepper Timeline -->
              <div class="stepper-timeline-wrap" style="position: relative; padding: var(--space-4) 0 var(--space-6);">
                <div class="stepper-track" style="position: absolute; left: 24px; top: 30px; bottom: 30px; width: 4px; background: var(--border-color); z-index: 1;">
                  <div class="stepper-progress-fill" style="width: 100%; height: ${Math.max(0, (currentStageIndex / (stages.length - 1)) * 100)}%; background: var(--primary); transition: height 0.5s ease;"></div>
                </div>

                <div class="stepper-steps-list" style="display: flex; flex-direction: column; gap: var(--space-6); position: relative; z-index: 2;">
                  ${stages.map((stg, idx) => {
                    const isDone = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return `
                      <div class="flex items-start gap-4" style="opacity: ${isDone ? 1 : 0.45};">
                        <div style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; background: ${isDone ? 'var(--primary)' : 'var(--bg-surface-secondary)'}; color: ${isDone ? '#FFFFFF' : 'var(--text-muted)'}; box-shadow: ${isCurrent ? 'var(--shadow-orange)' : 'none'}; border: 3px solid var(--bg-surface); flex-shrink: 0;">
                          ${stg.icon}
                        </div>
                        <div style="flex: 1; padding-top: 4px;">
                          <div class="flex items-center gap-2">
                            <h3 class="text-base font-bold" style="color: ${isCurrent ? 'var(--primary)' : 'var(--text-main)'}">${stg.title}</h3>
                            ${isCurrent ? `<span class="badge badge-orange">Active Stage</span>` : ''}
                          </div>
                          <p class="text-xs text-secondary mt-1">${stg.desc}</p>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            `}
          </div>

          <!-- Rider & Delivery Partner Card -->
          ${order.rider && !isCancelled ? `
            <div class="card flex items-center justify-between p-5 mb-6" style="background: var(--bg-surface);">
              <div class="flex items-center gap-4">
                <div style="width: 54px; height: 54px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 26px;">
                  🛵
                </div>
                <div>
                  <span class="text-xs text-muted block">Your Delivery Hero</span>
                  <h4 class="text-base font-bold">${order.rider.name}</h4>
                  <span class="text-xs text-secondary">${order.rider.bike} • ★ ${order.rider.rating} Rating</span>
                </div>
              </div>
              <a href="tel:${order.rider.phone}" class="btn btn-secondary btn-sm" onclick="alert('Calling rider at ${order.rider.phone}')">
                📞 Call Rider
              </a>
            </div>
          ` : ''}
        </div>

        <!-- Right: Order Summary Sidebar -->
        <div class="tracking-summary-panel">
          <div class="card">
            <h3 class="text-lg font-bold pb-3 border-b mb-4" style="border-color: var(--border-color);">
              Order Summary
            </h3>
            <div class="text-sm font-bold text-primary mb-3">
              ${Validation.escapeHtml(order.restaurantName)}
            </div>

            <div class="mb-4" style="max-height: 240px; overflow-y: auto;">
              ${order.items.map(item => `
                <div class="flex items-center justify-between py-2 border-b text-xs" style="border-color: var(--border-color);">
                  <span><strong>${item.quantity}x</strong> ${Validation.escapeHtml(item.name)}</span>
                  <span class="font-bold">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              `).join("")}
            </div>

            <div class="flex flex-col gap-2 text-xs text-secondary mb-4">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. ${order.subtotal.toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs. ${order.deliveryFee.toLocaleString()}</span>
              </div>
              ${order.discount > 0 ? `
                <div class="flex justify-between text-success">
                  <span>Discount (${order.couponCode || 'Promo'})</span>
                  <span>-Rs. ${order.discount.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="flex justify-between text-base font-extrabold text-main pt-2 border-t" style="border-color: var(--border-color);">
                <span>Total Amount</span>
                <span>Rs. ${order.total.toLocaleString()}</span>
              </div>
            </div>

            <div class="p-3 rounded-lg text-xs" style="background: var(--bg-surface-secondary);">
              <div class="font-bold text-main mb-1">Delivering To:</div>
              <div class="text-secondary">${Validation.escapeHtml(order.customer.address)}</div>
              ${order.customer.instructions ? `<div class="text-primary italic mt-1">"${order.customer.instructions}"</div>` : ''}
            </div>

            <a href="orders.html" class="btn btn-outline btn-block btn-sm mt-4">
              View All Past Orders
            </a>
          </div>
        </div>
      </div>
    `;
  },

  advanceStatus(orderId) {
    const stages = ["placed", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];
    const order = StorageManager.getOrderById(orderId);
    if (!order) return;

    const currentIdx = stages.indexOf(order.status);
    if (currentIdx >= 0 && currentIdx < stages.length - 1) {
      const nextStatus = stages[currentIdx + 1];
      StorageManager.updateOrderStatus(orderId, nextStatus);
      FoodoraApp.showToast(`Order status advanced to "${nextStatus.replace(/_/g, ' ').toUpperCase()}"!`, "success");
      this.renderTrackingPage(orderId);
    }
  },

  resetOrderStatus(orderId) {
    StorageManager.updateOrderStatus(orderId, "placed");
    FoodoraApp.showToast("Order status reset to initial stage.", "info");
    this.renderTrackingPage(orderId);
  },

  cancelOrder(orderId) {
    if (confirm("Are you sure you want to cancel this order?")) {
      StorageManager.updateOrderStatus(orderId, "cancelled");
      FoodoraApp.showToast("Order has been cancelled.", "warning");
      this.renderTrackingPage(orderId);
    }
  },

  setupOrderSearch() {
    const searchForm = document.getElementById("orderLookupForm");
    if (!searchForm) return;

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("orderLookupId");
      if (input && input.value.trim()) {
        const id = input.value.trim().toUpperCase();
        const found = StorageManager.getOrderById(id);
        if (found) {
          window.location.href = `tracking.html?orderId=${found.id}`;
        } else {
          FoodoraApp.showToast(`Order #${id} not found in records.`, "error");
        }
      }
    });
  }
};
