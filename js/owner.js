/**
 * ==========================================================================
 * FOODORA SAAS - RESTAURANT OWNER CONTROLLER (js/owner.js)
 * Restaurant performance, kitchen order queue, menu item management,
 * analytics, order history, and restaurant profile settings.
 * ==========================================================================
 */

const Owner = {
  restaurantId: "rest_1", // Default managed restaurant (Burger Lab Gourmet)

  initDashboard() {
    this.checkSession();
    this.populateRestaurantSelector();
    this.renderMetrics();
    this.renderKitchenQueue();
    this.setupStoreStatusToggle();
  },

  initMenu() {
    this.checkSession();
    this.populateRestaurantSelector();
    this.renderOwnerMenu();
  },

  initOrders() {
    this.checkSession();
    this.populateRestaurantSelector();
    this.renderOrdersTable("all");
    this.setupOrderFilterTabs();
  },

  initAnalytics() {
    this.checkSession();
    this.populateRestaurantSelector();
    this.renderAnalytics("week");
  },

  initSettings() {
    this.checkSession();
    this.populateRestaurantSelector();
    this.loadRestaurantSettings();
  },

  checkSession() {
    const user = Auth.getCurrentUser();
    if (user && user.restaurantId) {
      this.restaurantId = user.restaurantId;
    }
  },

  populateRestaurantSelector() {
    const selector = document.getElementById("ownerRestaurantSelector");
    if (!selector) return;

    const restaurants = StorageManager.getRestaurants();
    selector.innerHTML = restaurants.map(r => `
      <option value="${r.id}" ${r.id === this.restaurantId ? 'selected' : ''}>${r.name}</option>
    `).join("");

    selector.addEventListener("change", (e) => {
      this.restaurantId = e.target.value;
      FoodoraApp.showToast(`Switched terminal to ${selector.options[selector.selectedIndex].text}`, "info");
      if (document.getElementById("ownerKitchenOrdersQueue")) {
        this.renderMetrics();
        this.renderKitchenQueue();
      } else if (document.getElementById("ownerMenuTableBody")) {
        this.renderOwnerMenu();
      } else if (document.getElementById("ownerOrdersFullTable")) {
        this.renderOrdersTable("all");
      } else if (document.getElementById("ownerAnalyticsContainer")) {
        this.renderAnalytics("week");
      } else if (document.getElementById("ownerSettingsForm")) {
        this.loadRestaurantSettings();
      }
    });
  },

  renderMetrics() {
    const orders = StorageManager.getOrders().filter(o => o.restaurantId === this.restaurantId);
    const rest = StorageManager.getRestaurantById(this.restaurantId);

    const titleEl = document.getElementById("ownerRestaurantTitle");
    if (titleEl && rest) {
      titleEl.textContent = `${rest.name} - Kitchen Terminal`;
    }

    const todayOrdersEl = document.getElementById("ownerTodayOrders");
    if (todayOrdersEl) todayOrdersEl.textContent = orders.length;

    const todaySales = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);
    const salesEl = document.getElementById("ownerTodaySales");
    if (salesEl) salesEl.textContent = `Rs. ${todaySales.toLocaleString()}`;

    const prepTimeEl = document.getElementById("ownerPrepTime");
    if (prepTimeEl) prepTimeEl.textContent = rest?.deliveryTime || "25-30 min";

    const ratingEl = document.getElementById("ownerRating");
    if (ratingEl && rest) ratingEl.textContent = `★ ${rest.rating} (${rest.reviewsCount || 120}+ reviews)`;

    const statusToggle = document.getElementById("ownerStoreStatusCheckbox");
    if (statusToggle && rest) {
      statusToggle.checked = rest.isOpen;
    }

    const statusBadge = document.getElementById("ownerStoreStatusBadge");
    if (statusBadge && rest) {
      statusBadge.className = `badge ${rest.isOpen ? 'badge-success' : 'badge-danger'}`;
      statusBadge.textContent = rest.isOpen ? "ONLINE (Accepting Orders)" : "OFFLINE (Closed)";
    }
  },

  setupStoreStatusToggle() {
    const statusToggle = document.getElementById("ownerStoreStatusCheckbox");
    if (!statusToggle) return;

    statusToggle.addEventListener("change", (e) => {
      const list = StorageManager.getRestaurants();
      const r = list.find(x => x.id === this.restaurantId);
      if (r) {
        r.isOpen = e.target.checked;
        StorageManager.saveRestaurants(list);
        const statusBadge = document.getElementById("ownerStoreStatusBadge");
        if (statusBadge) {
          statusBadge.className = `badge ${r.isOpen ? 'badge-success' : 'badge-danger'}`;
          statusBadge.textContent = r.isOpen ? "ONLINE (Accepting Orders)" : "OFFLINE (Closed)";
        }
        FoodoraApp.showToast(`Restaurant is now ${r.isOpen ? 'OPEN for orders' : 'CLOSED temporarily'}.`, r.isOpen ? "success" : "warning");
      }
    });
  },

  renderKitchenQueue() {
    const container = document.getElementById("ownerKitchenOrdersQueue");
    if (!container) return;

    const orders = StorageManager.getOrders().filter(o => o.restaurantId === this.restaurantId);
    const activeOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");

    const activeCountEl = document.getElementById("ownerActiveQueueCount");
    if (activeCountEl) activeCountEl.textContent = activeOrders.length;

    if (activeOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-state py-8">
          <div class="empty-state-icon" style="font-size: 48px;">🍳</div>
          <h3 class="empty-state-title mt-2">No Active Orders in Kitchen Queue</h3>
          <p class="empty-state-text text-muted">All incoming tickets are completed or no new orders have arrived yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activeOrders.map(o => `
      <div class="card p-5 mb-4" style="border-left: 4px solid var(--primary); box-shadow: var(--shadow-sm);">
        <div class="flex justify-between items-start pb-3 border-b mb-3" style="border-color: var(--border-color);">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-orange font-bold">#${o.id}</span>
              <span class="text-xs text-muted">${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="text-xs text-muted mt-1">Customer: <strong>${Validation.escapeHtml(o.customer.name)}</strong> • 📞 ${o.customer.phone}</div>
            <div class="text-xs text-muted">📍 ${Validation.escapeHtml(o.customer.address)}</div>
          </div>
          <div class="text-right">
            <span class="badge ${o.status === 'confirmed' ? 'badge-info' : o.status === 'preparing' ? 'badge-warning' : 'badge-primary'} font-bold">
              ${o.status.toUpperCase().replace(/_/g, ' ')}
            </span>
            <div class="text-sm font-bold mt-1 text-primary">Rs. ${o.total.toLocaleString()}</div>
          </div>
        </div>

        <div class="py-2 mb-3 bg-light p-3 rounded" style="background: var(--bg-light);">
          <div class="text-xs font-bold text-muted mb-2 uppercase tracking-wide">Ordered Items:</div>
          ${o.items.map(item => `
            <div class="flex justify-between text-xs py-1 border-b border-light" style="border-color: var(--border-color);">
              <span><strong>${item.quantity}x</strong> ${Validation.escapeHtml(item.name)} ${item.selectedSize ? `<span class="badge badge-outline" style="font-size:10px;">${item.selectedSize}</span>` : ''}</span>
              <span class="font-bold">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
            ${item.selectedExtras?.length ? `<div class="text-xs text-muted pl-4">+ Extras: ${item.selectedExtras.join(", ")}</div>` : ''}
          `).join("")}
        </div>

        ${o.customer.instructions ? `
          <div class="p-2 mb-3 rounded text-xs" style="background: var(--primary-light); color: var(--primary); border: 1px dashed var(--primary);">
            <strong>Chef Note:</strong> "${Validation.escapeHtml(o.customer.instructions)}"
          </div>
        ` : ''}

        <div class="flex items-center justify-between pt-3 border-t flex-wrap gap-2" style="border-color: var(--border-color);">
          <div class="flex items-center gap-2">
            <button class="btn btn-outline btn-sm" onclick="Owner.printKitchenTicket('${o.id}')">🖨️ Print Ticket</button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted">Action:</span>
            <button class="btn ${o.status === 'preparing' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="Owner.updateOrderStatus('${o.id}', 'preparing')">🍳 Cooking</button>
            <button class="btn ${o.status === 'ready' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="Owner.updateOrderStatus('${o.id}', 'ready')">🥡 Packed</button>
            <button class="btn btn-primary btn-sm" onclick="Owner.updateOrderStatus('${o.id}', 'out_for_delivery')">🛵 Handover</button>
          </div>
        </div>
      </div>
    `).join("");
  },

  updateOrderStatus(orderId, newStatus) {
    StorageManager.updateOrderStatus(orderId, newStatus);
    FoodoraApp.showToast(`Order #${orderId} marked as "${newStatus.replace(/_/g, ' ').toUpperCase()}"!`, "success");
    if (document.getElementById("ownerKitchenOrdersQueue")) {
      this.renderKitchenQueue();
      this.renderMetrics();
    }
    if (document.getElementById("ownerOrdersFullTable")) {
      const activeTab = document.querySelector(".tab-btn.active")?.dataset.status || "all";
      this.renderOrdersTable(activeTab);
    }
  },

  printKitchenTicket(orderId) {
    const order = StorageManager.getOrderById(orderId);
    if (!order) return;
    const rest = StorageManager.getRestaurantById(order.restaurantId);

    const ticketWindow = window.open('', '_blank', 'width=420,height=600');
    if (!ticketWindow) {
      alert("Please allow popups to print kitchen tickets.");
      return;
    }

    ticketWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kitchen Ticket - #${order.id}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; font-size: 14px; color: #000; line-height: 1.4; }
          .center { text-align: center; }
          .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .bold { font-weight: bold; }
          .flex { display: flex; justify-content: space-between; }
          .items { margin: 15px 0; }
          .note { background: #eee; padding: 6px; margin: 10px 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="center border-bottom">
          <h2 style="margin: 0;">${rest?.name || 'KITCHEN TICKET'}</h2>
          <div>FOODORA SAAS - ORDER #${order.id}</div>
          <div>${new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div class="border-bottom">
          <div><span class="bold">Customer:</span> ${order.customer.name}</div>
          <div><span class="bold">Phone:</span> ${order.customer.phone}</div>
          <div><span class="bold">Payment:</span> ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})</div>
        </div>
        <div class="items border-bottom">
          <div class="bold" style="margin-bottom: 5px;">TICKET ITEMS:</div>
          ${order.items.map(it => `
            <div class="flex" style="margin-bottom: 4px;">
              <span><strong style="font-size: 16px;">${it.quantity}x</strong> ${it.name} ${it.selectedSize ? `[${it.selectedSize}]` : ''}</span>
              <span>Rs. ${it.price * it.quantity}</span>
            </div>
            ${it.selectedExtras?.length ? `<div style="font-size: 11px; padding-left: 15px;">+ ${it.selectedExtras.join(", ")}</div>` : ''}
          `).join("")}
        </div>
        ${order.customer.instructions ? `
          <div class="note">
            <strong>CHEF SPECIAL INSTRUCTIONS:</strong><br/>
            ${order.customer.instructions}
          </div>
        ` : ''}
        <div class="border-bottom">
          <div class="flex"><span>Subtotal:</span><span>Rs. ${order.subtotal}</span></div>
          <div class="flex"><span>Delivery:</span><span>Rs. ${order.deliveryFee}</span></div>
          ${order.discount ? `<div class="flex"><span>Discount:</span><span>-Rs. ${order.discount}</span></div>` : ''}
          <div class="flex bold" style="font-size: 16px; margin-top: 5px;"><span>TOTAL:</span><span>Rs. ${order.total}</span></div>
        </div>
        <div class="center" style="margin-top: 15px; font-size: 11px;">
          *** EXPEDITE ORDER - FOODORA SAAS ***
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    ticketWindow.document.close();
  },

  // Menu Management for Owner
  renderOwnerMenu() {
    const tbody = document.getElementById("ownerMenuTableBody");
    if (!tbody) return;

    const products = StorageManager.getProducts().filter(p => p.restaurantId === this.restaurantId);
    
    const countEl = document.getElementById("ownerTotalMenuItems");
    if (countEl) countEl.textContent = products.length;

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-8">
            <div class="empty-state">
              <div class="empty-state-icon">🍽️</div>
              <p class="font-bold">No dishes in your menu yet.</p>
              <button class="btn btn-primary btn-sm mt-3" onclick="Owner.openAddDishModal()">+ Add Your First Dish</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.name}" style="width: 48px; height: 48px; border-radius: var(--radius-md); object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'" />
        </td>
        <td>
          <div class="font-bold">${Validation.escapeHtml(p.name)}</div>
          <div class="text-xs text-muted" style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${Validation.escapeHtml(p.description || '')}</div>
        </td>
        <td>
          <span class="badge badge-light">${Validation.escapeHtml(p.categoryName || 'General')}</span>
        </td>
        <td><strong>Rs. ${p.price.toLocaleString()}</strong></td>
        <td>
          <button class="badge ${p.isAvailable ? 'badge-success' : 'badge-danger'} cursor-pointer" onclick="Owner.toggleAvailability('${p.id}')">
            ${p.isAvailable ? 'In Stock' : 'Out of Stock'}
          </button>
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm text-primary" onclick="Owner.editMenuItem('${p.id}')">Edit</button>
            <button class="btn btn-outline btn-sm text-danger" onclick="Owner.deleteMenuItem('${p.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  toggleAvailability(id) {
    const list = StorageManager.getProducts();
    const p = list.find(x => x.id === id);
    if (p) {
      p.isAvailable = !p.isAvailable;
      StorageManager.saveProducts(list);
      FoodoraApp.showToast(`"${p.name}" is now ${p.isAvailable ? 'In Stock' : 'Out of Stock'}.`, p.isAvailable ? "success" : "warning");
      this.renderOwnerMenu();
    }
  },

  deleteMenuItem(id) {
    if (confirm("Remove this dish from your restaurant menu?")) {
      let list = StorageManager.getProducts();
      list = list.filter(x => x.id !== id);
      StorageManager.saveProducts(list);
      FoodoraApp.showToast("Dish removed from menu.", "info");
      this.renderOwnerMenu();
    }
  },

  openAddDishModal() {
    const modal = document.getElementById("ownerDishModal");
    if (!modal) return;
    document.getElementById("ownerDishForm")?.reset();
    document.getElementById("ownerDishModalTitle").textContent = "Add New Dish";
    document.getElementById("ownerDishId").value = "";
    modal.classList.add("open");
  },

  editMenuItem(id) {
    const modal = document.getElementById("ownerDishModal");
    if (!modal) return;
    const p = StorageManager.getProductById(id);
    if (!p) return;

    document.getElementById("ownerDishModalTitle").textContent = "Edit Dish";
    document.getElementById("ownerDishId").value = p.id;
    document.getElementById("dishNameInput").value = p.name;
    document.getElementById("dishPriceInput").value = p.price;
    document.getElementById("dishCategorySelect").value = p.category;
    document.getElementById("dishDescInput").value = p.description || "";
    document.getElementById("dishImageInput").value = p.image || "";

    modal.classList.add("open");
  },

  closeDishModal() {
    const modal = document.getElementById("ownerDishModal");
    if (modal) modal.classList.remove("open");
  },

  saveDish(e) {
    e.preventDefault();
    const id = document.getElementById("ownerDishId").value;
    const name = document.getElementById("dishNameInput").value.trim();
    const price = parseFloat(document.getElementById("dishPriceInput").value);
    const category = document.getElementById("dishCategorySelect").value;
    const desc = document.getElementById("dishDescInput").value.trim();
    const image = document.getElementById("dishImageInput").value.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

    if (!name || isNaN(price) || price <= 0) {
      FoodoraApp.showToast("Please enter valid dish name and price.", "danger");
      return;
    }

    const categories = StorageManager.getCategories();
    const catObj = categories.find(c => c.id === category);

    let list = StorageManager.getProducts();
    if (id) {
      // Edit
      const p = list.find(x => x.id === id);
      if (p) {
        p.name = name;
        p.price = price;
        p.category = category;
        p.categoryName = catObj ? catObj.name : category;
        p.description = desc;
        p.image = image;
      }
      FoodoraApp.showToast(`Updated "${name}"!`, "success");
    } else {
      // New
      const newDish = {
        id: "prod_" + Date.now(),
        restaurantId: this.restaurantId,
        name: name,
        price: price,
        originalPrice: Math.round(price * 1.2),
        category: category,
        categoryName: catObj ? catObj.name : category,
        description: desc,
        image: image,
        rating: 4.8,
        reviewsCount: 1,
        isAvailable: true,
        isPopular: true
      };
      list.unshift(newDish);
      FoodoraApp.showToast(`Added "${name}" to your restaurant menu!`, "success");
    }

    StorageManager.saveProducts(list);
    this.closeDishModal();
    this.renderOwnerMenu();
  },

  // Owner Orders Tab
  renderOrdersTable(filterStatus = "all") {
    const tbody = document.getElementById("ownerOrdersFullTable");
    if (!tbody) return;

    let orders = StorageManager.getOrders().filter(o => o.restaurantId === this.restaurantId);

    if (filterStatus === "active") {
      orders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
    } else if (filterStatus === "delivered") {
      orders = orders.filter(o => o.status === "delivered");
    } else if (filterStatus === "cancelled") {
      orders = orders.filter(o => o.status === "cancelled");
    }

    const totalOrdersEl = document.getElementById("ownerOrdersCountSummary");
    if (totalOrdersEl) totalOrdersEl.textContent = `${orders.length} orders found`;

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8">
            <div class="empty-state">
              <div class="empty-state-icon">📦</div>
              <p class="font-bold">No orders found for this view.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>
          <strong>#${o.id}</strong>
          <div class="text-xs text-muted">${new Date(o.createdAt).toLocaleDateString()} ${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </td>
        <td>
          <div class="font-bold">${Validation.escapeHtml(o.customer.name)}</div>
          <div class="text-xs text-muted">📞 ${o.customer.phone}</div>
          <div class="text-xs text-muted" style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📍 ${Validation.escapeHtml(o.customer.address)}</div>
        </td>
        <td>
          <div class="text-xs">
            ${o.items.map(it => `<div>${it.quantity}x ${Validation.escapeHtml(it.name)}</div>`).join("")}
          </div>
        </td>
        <td>
          <strong>Rs. ${o.total.toLocaleString()}</strong>
          <div class="text-xs text-muted">${o.paymentMethod.toUpperCase()}</div>
        </td>
        <td>
          <select class="form-input text-xs py-1 px-2" onchange="Owner.updateOrderStatus('${o.id}', this.value)" style="width: auto;">
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Ready for Pickup</option>
            <option value="out_for_delivery" ${o.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <span class="badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}">
            ${o.status.toUpperCase().replace(/_/g, ' ')}
          </span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="Owner.printKitchenTicket('${o.id}')">🖨️ Ticket</button>
        </td>
      </tr>
    `).join("");
  },

  setupOrderFilterTabs() {
    const tabs = document.querySelectorAll(".order-filter-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.renderOrdersTable(tab.dataset.status);
      });
    });
  },

  // Analytics for Owner
  renderAnalytics(period = "week") {
    const orders = StorageManager.getOrders().filter(o => o.restaurantId === this.restaurantId && o.status !== "cancelled");
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgTicket = orders.length ? Math.round(totalRevenue / orders.length) : 0;

    const revEl = document.getElementById("ownerAnalyticsTotalRevenue");
    if (revEl) revEl.textContent = `Rs. ${totalRevenue.toLocaleString()}`;

    const ordersCountEl = document.getElementById("ownerAnalyticsTotalOrders");
    if (ordersCountEl) ordersCountEl.textContent = orders.length;

    const avgEl = document.getElementById("ownerAnalyticsAvgTicket");
    if (avgEl) avgEl.textContent = `Rs. ${avgTicket.toLocaleString()}`;

    // Dish performance breakdown
    const dishSales = {};
    orders.forEach(o => {
      o.items.forEach(it => {
        if (!dishSales[it.name]) dishSales[it.name] = { count: 0, revenue: 0 };
        dishSales[it.name].count += it.quantity;
        dishSales[it.name].revenue += it.price * it.quantity;
      });
    });

    const sortedDishes = Object.entries(dishSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    const topDishesContainer = document.getElementById("ownerTopDishesList");
    if (topDishesContainer) {
      if (sortedDishes.length === 0) {
        topDishesContainer.innerHTML = `<div class="text-sm text-muted py-4">No completed orders yet to compute product statistics.</div>`;
      } else {
        topDishesContainer.innerHTML = sortedDishes.map(([name, stat], idx) => {
          const pct = totalRevenue ? Math.round((stat.revenue / totalRevenue) * 100) : 0;
          return `
            <div class="mb-3">
              <div class="flex justify-between text-xs mb-1">
                <span><strong>#${idx + 1} ${Validation.escapeHtml(name)}</strong> (${stat.count} sold)</span>
                <strong>Rs. ${stat.revenue.toLocaleString()} (${pct}%)</strong>
              </div>
              <div style="background: var(--border-color); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
                <div style="background: var(--primary); width: ${pct}%; height: 100%; border-radius: var(--radius-full);"></div>
              </div>
            </div>
          `;
        }).join("");
      }
    }
  },

  // Owner Restaurant Profile Settings
  loadRestaurantSettings() {
    const rest = StorageManager.getRestaurantById(this.restaurantId);
    if (!rest) return;

    const nameInput = document.getElementById("ownerRestNameInput");
    if (nameInput) nameInput.value = rest.name || "";

    const categoryInput = document.getElementById("ownerRestCategoryInput");
    if (categoryInput) categoryInput.value = rest.category || "";

    const phoneInput = document.getElementById("ownerRestPhoneInput");
    if (phoneInput) phoneInput.value = rest.phone || "0300-1234567";

    const addressInput = document.getElementById("ownerRestAddressInput");
    if (addressInput) addressInput.value = rest.address || "DHA Phase 5, Karachi";

    const deliveryTimeInput = document.getElementById("ownerRestDeliveryTimeInput");
    if (deliveryTimeInput) deliveryTimeInput.value = rest.deliveryTime || "25-35 min";

    const deliveryFeeInput = document.getElementById("ownerRestDeliveryFeeInput");
    if (deliveryFeeInput) deliveryFeeInput.value = rest.deliveryFee || 149;

    const bannerPreview = document.getElementById("ownerRestBannerPreview");
    if (bannerPreview && rest.banner) bannerPreview.src = rest.banner;
  },

  saveRestaurantSettings(e) {
    e.preventDefault();
    const list = StorageManager.getRestaurants();
    const r = list.find(x => x.id === this.restaurantId);
    if (!r) return;

    r.name = document.getElementById("ownerRestNameInput").value.trim() || r.name;
    r.category = document.getElementById("ownerRestCategoryInput").value.trim() || r.category;
    r.phone = document.getElementById("ownerRestPhoneInput").value.trim() || r.phone;
    r.address = document.getElementById("ownerRestAddressInput").value.trim() || r.address;
    r.deliveryTime = document.getElementById("ownerRestDeliveryTimeInput").value.trim() || r.deliveryTime;
    r.deliveryFee = parseFloat(document.getElementById("ownerRestDeliveryFeeInput").value) || r.deliveryFee;

    StorageManager.saveRestaurants(list);
    FoodoraApp.showToast("Restaurant profile and delivery settings saved successfully!", "success");
    this.renderMetrics();
  }
};
