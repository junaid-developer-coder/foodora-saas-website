/**
 * ==========================================================================
 * FOODORA SAAS - ORDERS HISTORY & INVOICE CONTROLLER (js/orders.js)
 * Customer orders list, 1-click reorder, and printable invoice generator.
 * ==========================================================================
 */

const Orders = {
  init() {
    this.renderOrdersList();
  },

  renderOrdersList() {
    const container = document.getElementById("ordersListContainer");
    if (!container) return;

    let activeFilter = "all";
    const orders = StorageManager.getOrders();

    const render = () => {
      let filtered = [...orders];
      if (activeFilter === "active") {
        filtered = filtered.filter(o => o.status !== "delivered" && o.status !== "cancelled");
      } else if (activeFilter === "delivered") {
        filtered = filtered.filter(o => o.status === "delivered");
      } else if (activeFilter === "cancelled") {
        filtered = filtered.filter(o => o.status === "cancelled");
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h3 class="empty-state-title">No Orders Found</h3>
            <p class="empty-state-text">You don't have any orders matching this filter.</p>
            <a href="restaurants.html" class="btn btn-primary">Order Delicious Food</a>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(order => {
        const dateStr = new Date(order.date).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
        });

        const statusBadges = {
          placed: "badge-orange",
          confirmed: "badge-orange",
          preparing: "badge-orange",
          ready: "badge-orange",
          out_for_delivery: "badge-warning",
          delivered: "badge-success",
          cancelled: "badge-danger"
        };

        return `
          <div class="card mb-4" style="border-radius: var(--radius-xl);">
            <div class="flex items-center justify-between pb-3 border-b mb-4 flex-wrap gap-2" style="border-color: var(--border-color);">
              <div>
                <span class="text-xs text-muted">Order ID: <strong>${order.id}</strong> • Placed on ${dateStr}</span>
                <h3 class="text-base font-bold text-primary mt-1">${Validation.escapeHtml(order.restaurantName)}</h3>
              </div>
              <span class="badge ${statusBadges[order.status] || 'badge-orange'} font-bold">
                ● ${order.status.toUpperCase().replace(/_/g, ' ')}
              </span>
            </div>

            <div class="py-2">
              ${order.items.map(item => `
                <div class="flex items-center justify-between py-1 text-sm">
                  <span><strong>${item.quantity}x</strong> ${Validation.escapeHtml(item.name)} ${item.selectedSize ? `(${item.selectedSize})` : ''}</span>
                  <span class="font-semibold text-muted">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              `).join("")}
            </div>

            <div class="flex items-center justify-between pt-4 border-t mt-4 flex-wrap gap-4" style="border-color: var(--border-color);">
              <div>
                <span class="text-xs text-muted block">Total Paid (${order.payment.method})</span>
                <span class="text-lg font-extrabold text-main">Rs. ${order.total.toLocaleString()}</span>
              </div>
              <div class="flex items-center gap-3">
                <button class="btn btn-outline btn-sm" onclick="Orders.showInvoiceModal('${order.id}')">
                  📄 View Invoice
                </button>
                <button class="btn btn-secondary btn-sm" onclick="Orders.reorder('${order.id}')">
                  ↺ Reorder
                </button>
                <a href="tracking.html?orderId=${order.id}" class="btn btn-primary btn-sm">
                  Live Track ➔
                </a>
              </div>
            </div>
          </div>
        `;
      }).join("");
    };

    // Filter tab clicks
    const tabs = document.querySelectorAll(".orders-filter-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        activeFilter = tab.getAttribute("data-filter");
        render();
      });
    });

    render();
  },

  reorder(orderId) {
    const order = StorageManager.getOrderById(orderId);
    if (!order) return;

    order.items.forEach(item => {
      StorageManager.addToCart({
        productId: item.productId || item.id,
        name: item.name,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        price: item.price,
        image: item.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        selectedSize: item.selectedSize || null,
        selectedExtras: item.selectedExtras || [],
        quantity: item.quantity
      });
    });

    FoodoraApp.showToast(`Added ${order.items.length} items from ${order.restaurantName} to your cart!`, "success");
    setTimeout(() => {
      window.location.href = "cart.html";
    }, 600);
  },

  showInvoiceModal(orderId) {
    const order = StorageManager.getOrderById(orderId);
    if (!order) return;

    let modal = document.getElementById("invoiceModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "invoiceModal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    const dateStr = new Date(order.date).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <span class="text-xl font-extrabold text-primary">FOODORA</span>
            <span class="badge badge-orange">Tax Invoice</span>
          </div>
          <button class="modal-close-btn" onclick="FoodoraApp.closeModal('invoiceModal')">&times;</button>
        </div>
        <div class="modal-body" id="printableInvoiceContent">
          <div class="flex justify-between items-start pb-4 border-b mb-4" style="border-color: var(--border-color);">
            <div>
              <div class="text-xs text-muted">Invoice For Order</div>
              <div class="text-xl font-bold">${order.id}</div>
              <div class="text-xs text-muted mt-1">${dateStr}</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-sm">${Validation.escapeHtml(order.restaurantName)}</div>
              <div class="text-xs text-muted">Foodora Partner Verified</div>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-bold text-muted uppercase">Customer Deliver To:</div>
            <div class="text-sm font-semibold">${Validation.escapeHtml(order.customer.name)} (${order.customer.phone})</div>
            <div class="text-xs text-secondary">${Validation.escapeHtml(order.customer.address)}</div>
          </div>

          <table class="data-table mb-4">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <strong>${Validation.escapeHtml(item.name)}</strong>
                    ${item.selectedSize ? `<div class="text-xs text-muted">${item.selectedSize}</div>` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td style="text-align: right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="flex flex-col gap-1 text-sm pt-2 border-t" style="border-color: var(--border-color);">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. ${order.subtotal.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span>Delivery Fee:</span>
              <span>Rs. ${order.deliveryFee.toLocaleString()}</span>
            </div>
            ${order.discount > 0 ? `
              <div class="flex justify-between text-success">
                <span>Discount (${order.couponCode || 'Promo'}):</span>
                <span>-Rs. ${order.discount.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="flex justify-between text-base font-extrabold pt-2 border-t mt-1" style="border-color: var(--border-color);">
              <span>Grand Total:</span>
              <span class="text-primary">Rs. ${order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline btn-sm" onclick="window.print()">🖨 Print Invoice</button>
          <button class="btn btn-primary btn-sm" onclick="FoodoraApp.closeModal('invoiceModal')">Close</button>
        </div>
      </div>
    `;

    FoodoraApp.openModal("invoiceModal");
  }
};
