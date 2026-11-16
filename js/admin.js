/**
 * ==========================================================================
 * FOODORA SAAS - ADMIN DASHBOARD CONTROLLER (js/admin.js)
 * Master admin metrics, CRUD operations, CSV exports, and charts.
 * ==========================================================================
 */

const Admin = {
  initDashboard() {
    this.renderStats();
    this.renderRevenueChart();
    this.renderRecentOrders();
  },

  renderStats() {
    const orders = StorageManager.getOrders();
    const restaurants = StorageManager.getRestaurants();
    const products = StorageManager.getProducts();
    const users = StorageManager.getUsers();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);
    const activeOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length;

    const revEl = document.getElementById("adminStatRevenue");
    if (revEl) revEl.textContent = `Rs. ${totalRevenue.toLocaleString()}`;

    const ordEl = document.getElementById("adminStatOrders");
    if (ordEl) ordEl.textContent = orders.length;

    const actEl = document.getElementById("adminStatActive");
    if (actEl) actEl.textContent = activeOrders;

    const restEl = document.getElementById("adminStatRestaurants");
    if (restEl) restEl.textContent = restaurants.length;

    const prodEl = document.getElementById("adminStatProducts");
    if (prodEl) prodEl.textContent = products.length;

    const custEl = document.getElementById("adminStatCustomers");
    if (custEl) custEl.textContent = users.length;
  },

  renderRevenueChart() {
    const wrap = document.getElementById("adminRevenueChartBars");
    if (!wrap) return;

    // 7-day weekly revenue distribution
    const days = [
      { day: "Mon", amount: 45000, height: "55%" },
      { day: "Tue", amount: 52000, height: "65%" },
      { day: "Wed", amount: 48000, height: "60%" },
      { day: "Thu", amount: 61000, height: "75%" },
      { day: "Fri", amount: 84000, height: "95%" },
      { day: "Sat", amount: 92000, height: "100%" },
      { day: "Sun", amount: 76000, height: "85%" }
    ];

    wrap.innerHTML = days.map(d => `
      <div class="chart-col">
        <div class="chart-bar-pillar" style="height: ${d.height};" data-tooltip="Rs. ${d.amount.toLocaleString()}"></div>
        <span class="chart-col-label">${d.day}</span>
      </div>
    `).join("");
  },

  renderRecentOrders() {
    const tbody = document.getElementById("adminOrdersTableBody");
    if (!tbody) return;

    const orders = StorageManager.getOrders();
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>
          <div class="font-semibold">${Validation.escapeHtml(o.customer.name)}</div>
          <div class="text-xs text-muted">${o.customer.phone}</div>
        </td>
        <td>${Validation.escapeHtml(o.restaurantName)}</td>
        <td><strong>Rs. ${o.total.toLocaleString()}</strong></td>
        <td>
          <select class="form-select text-xs py-1" onchange="Admin.changeOrderStatus('${o.id}', this.value)" style="width: auto; font-weight: bold;">
            <option value="placed" ${o.status === 'placed' ? 'selected' : ''}>Placed</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Ready</option>
            <option value="out_for_delivery" ${o.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="Orders.showInvoiceModal('${o.id}')">View</button>
        </td>
      </tr>
    `).join("");
  },

  changeOrderStatus(orderId, status) {
    StorageManager.updateOrderStatus(orderId, status);
    FoodoraApp.showToast(`Order #${orderId} status set to ${status.toUpperCase()}!`, "success");
    this.renderStats();
  },

  // --------------------------------------------------------------------------
  // RESTAURANTS CRUD
  // --------------------------------------------------------------------------
  renderRestaurantsManager() {
    const tbody = document.getElementById("adminRestaurantsTableBody");
    if (!tbody) return;

    const list = StorageManager.getRestaurants();
    tbody.innerHTML = list.map(r => `
      <tr>
        <td>
          <img src="${r.image}" alt="${r.name}" style="width: 48px; height: 48px; border-radius: var(--radius-md); object-fit: cover;" />
        </td>
        <td>
          <div class="font-bold">${Validation.escapeHtml(r.name)}</div>
          <div class="text-xs text-muted">${Validation.escapeHtml(r.category)}</div>
        </td>
        <td>★ ${r.rating} (${r.reviewsCount})</td>
        <td>Rs. ${r.deliveryFee} (${r.deliveryTime})</td>
        <td>
          <button class="badge ${r.isOpen ? 'badge-success' : 'badge-danger'} cursor-pointer" onclick="Admin.toggleRestaurantStatus('${r.id}')">
            ${r.isOpen ? 'Open' : 'Closed'}
          </button>
        </td>
        <td>
          <button class="btn btn-outline btn-sm text-danger" onclick="Admin.deleteRestaurant('${r.id}')">Delete</button>
        </td>
      </tr>
    `).join("");
  },

  toggleRestaurantStatus(id) {
    const list = StorageManager.getRestaurants();
    const r = list.find(x => x.id === id);
    if (r) {
      r.isOpen = !r.isOpen;
      StorageManager.saveRestaurants(list);
      FoodoraApp.showToast(`${r.name} status updated to ${r.isOpen ? 'OPEN' : 'CLOSED'}.`, "info");
      this.renderRestaurantsManager();
    }
  },

  deleteRestaurant(id) {
    if (confirm("Delete this restaurant record?")) {
      let list = StorageManager.getRestaurants();
      list = list.filter(r => r.id !== id);
      StorageManager.saveRestaurants(list);
      FoodoraApp.showToast("Restaurant deleted.", "info");
      this.renderRestaurantsManager();
    }
  },

  saveNewRestaurant(name, category, deliveryFee, deliveryTime, image) {
    const list = StorageManager.getRestaurants();
    const newRest = {
      id: "rest_" + Date.now(),
      name: name,
      category: category,
      categoryId: "cat_burgers",
      rating: 5.0,
      reviewsCount: 1,
      deliveryTime: deliveryTime || "30 min",
      deliveryFee: parseInt(deliveryFee) || 150,
      minOrder: 500,
      isOpen: true,
      address: "Lahore, Pakistan",
      image: image || "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
      featured: false,
      tags: ["New"]
    };
    list.unshift(newRest);
    StorageManager.saveRestaurants(list);
    FoodoraApp.showToast(`Restaurant "${name}" registered successfully!`, "success");
    this.renderRestaurantsManager();
  },

  // --------------------------------------------------------------------------
  // PRODUCTS CRUD
  // --------------------------------------------------------------------------
  renderProductsManager() {
    const tbody = document.getElementById("adminProductsTableBody");
    if (!tbody) return;

    const list = StorageManager.getProducts();
    tbody.innerHTML = list.map(p => `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.name}" style="width: 48px; height: 48px; border-radius: var(--radius-md); object-fit: cover;" />
        </td>
        <td>
          <div class="font-bold">${Validation.escapeHtml(p.name)}</div>
          <div class="text-xs text-muted">${Validation.escapeHtml(p.categoryName)} • ${Validation.escapeHtml(p.restaurantName)}</div>
        </td>
        <td><strong>Rs. ${p.price.toLocaleString()}</strong></td>
        <td>
          <button class="badge ${p.isAvailable ? 'badge-success' : 'badge-danger'} cursor-pointer" onclick="Admin.toggleProductAvailability('${p.id}')">
            ${p.isAvailable ? 'Available' : 'Out of Stock'}
          </button>
        </td>
        <td>
          <button class="btn btn-outline btn-sm text-danger" onclick="Admin.deleteProduct('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join("");
  },

  toggleProductAvailability(id) {
    const list = StorageManager.getProducts();
    const p = list.find(x => x.id === id);
    if (p) {
      p.isAvailable = !p.isAvailable;
      StorageManager.saveProducts(list);
      FoodoraApp.showToast(`${p.name} marked as ${p.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}.`, "info");
      this.renderProductsManager();
    }
  },

  deleteProduct(id) {
    if (confirm("Delete this food product?")) {
      let list = StorageManager.getProducts();
      list = list.filter(p => p.id !== id);
      StorageManager.saveProducts(list);
      FoodoraApp.showToast("Product deleted.", "info");
      this.renderProductsManager();
    }
  },

  saveNewProduct(name, category, price, restaurantId, image, description) {
    const list = StorageManager.getProducts();
    const rest = StorageManager.getRestaurantById(restaurantId) || StorageManager.getRestaurants()[0];

    const newProd = {
      id: "prod_" + Date.now(),
      name: name,
      restaurantId: rest.id,
      restaurantName: rest.name,
      categoryId: "cat_burgers",
      categoryName: category || "Fast Food",
      price: parseInt(price) || 500,
      rating: 5.0,
      reviewsCount: 1,
      image: image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      description: description || "Freshly cooked culinary special.",
      isPopular: false,
      isAvailable: true,
      badge: "New"
    };

    list.unshift(newProd);
    StorageManager.saveProducts(list);
    FoodoraApp.showToast(`Product "${name}" added to menu!`, "success");
    this.renderProductsManager();
  },

  // --------------------------------------------------------------------------
  // CSV EXPORT GENERATOR (PRD Items 423, 424, 425)
  // --------------------------------------------------------------------------
  exportOrdersCSV() {
    const orders = StorageManager.getOrders();
    let csv = "Order ID,Customer,Restaurant,Total,Status,Date\n";
    orders.forEach(o => {
      csv += `"${o.id}","${o.customer.name}","${o.restaurantName}",${o.total},"${o.status}","${o.date}"\n`;
    });
    this.downloadCSV(csv, "foodora_orders_export.csv");
  },

  exportProductsCSV() {
    const products = StorageManager.getProducts();
    let csv = "Product ID,Name,Category,Restaurant,Price,Available\n";
    products.forEach(p => {
      csv += `"${p.id}","${p.name}","${p.categoryName}","${p.restaurantName}",${p.price},"${p.isAvailable}"\n`;
    });
    this.downloadCSV(csv, "foodora_products_export.csv");
  },

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    FoodoraApp.showToast(`Exported ${filename} successfully!`, "success");
  }
};
