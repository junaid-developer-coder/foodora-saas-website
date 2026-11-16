/**
 * ==========================================================================
 * FOODORA SAAS - CUSTOMER DASHBOARD CONTROLLER (js/customer.js)
 * Customer stats, profile updates, saved addresses, and active orders.
 * ==========================================================================
 */

const Customer = {
  initDashboard() {
    this.renderCustomerStats();
    this.renderActiveOrderWidget();
    this.renderRecentOrdersTable();
  },

  initProfile() {
    this.renderProfileForm();
    this.renderAddressesManager();
  },

  renderCustomerStats() {
    const user = StorageManager.getCurrentUser();
    const orders = StorageManager.getOrders();
    const favorites = StorageManager.getFavorites();

    const welcomeEl = document.getElementById("customerWelcomeName");
    if (welcomeEl && user) {
      welcomeEl.textContent = `Welcome back, ${user.name.split(" ")[0]}! 👋`;
    }

    const totalOrdersEl = document.getElementById("customerStatOrders");
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;

    const totalSpent = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);
    const spentEl = document.getElementById("customerStatSpent");
    if (spentEl) spentEl.textContent = `Rs. ${totalSpent.toLocaleString()}`;

    const pointsEl = document.getElementById("customerStatPoints");
    if (pointsEl) pointsEl.textContent = user?.points || 450;

    const favsEl = document.getElementById("customerStatFavs");
    if (favsEl) favsEl.textContent = favorites.length;
  },

  renderActiveOrderWidget() {
    const container = document.getElementById("customerActiveOrderWidget");
    if (!container) return;

    const orders = StorageManager.getOrders();
    const active = orders.find(o => o.status !== "delivered" && o.status !== "cancelled");

    if (!active) {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    container.innerHTML = `
      <div class="card p-5 mb-6" style="background: linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-light) 100%); border: 2px solid var(--primary);">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-4">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--primary); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              🛵
            </div>
            <div>
              <span class="badge badge-orange mb-1">Active Delivery • #${active.id}</span>
              <h3 class="text-lg font-bold">${Validation.escapeHtml(active.restaurantName)}</h3>
              <p class="text-xs text-secondary">Status: <strong>${active.status.toUpperCase().replace(/_/g, ' ')}</strong> • Estimated in ${active.estimatedDelivery || '20 min'}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <a href="../../pages/tracking.html?orderId=${active.id}" class="btn btn-primary btn-sm">
              Live Tracker ➔
            </a>
          </div>
        </div>
      </div>
    `;
  },

  renderRecentOrdersTable() {
    const tableBody = document.getElementById("customerRecentOrdersBody");
    if (!tableBody) return;

    const orders = StorageManager.getOrders().slice(0, 5);
    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No orders placed yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${Validation.escapeHtml(o.restaurantName)}</td>
        <td>Rs. ${o.total.toLocaleString()}</td>
        <td>
          <span class="badge ${o.status === 'delivered' ? 'badge-success' : (o.status === 'cancelled' ? 'badge-danger' : 'badge-orange')}">
            ${o.status.toUpperCase().replace(/_/g, ' ')}
          </span>
        </td>
        <td>
          <a href="../../pages/tracking.html?orderId=${o.id}" class="btn btn-outline btn-sm">Track</a>
        </td>
      </tr>
    `).join("");
  },

  renderProfileForm() {
    const user = StorageManager.getCurrentUser();
    if (!user) return;

    const nameInput = document.getElementById("profileName");
    const emailInput = document.getElementById("profileEmail");
    const phoneInput = document.getElementById("profilePhone");
    const avatarImg = document.getElementById("profileAvatarPreview");

    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
    if (phoneInput) phoneInput.value = user.phone || "";
    if (avatarImg) avatarImg.src = user.avatar;

    const form = document.getElementById("profileForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        user.name = nameInput.value.trim();
        user.phone = phoneInput.value.trim();
        StorageManager.saveUser(user);
        FoodoraApp.showToast("Profile details updated successfully!", "success");
      });
    }
  },

  renderAddressesManager() {
    const grid = document.getElementById("profileAddressesList");
    if (!grid) return;

    const user = StorageManager.getCurrentUser();
    const addresses = user.addresses || [];

    grid.innerHTML = addresses.map((addr, idx) => `
      <div class="card p-4 flex justify-between items-start mb-3">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-bold text-sm text-primary">${Validation.escapeHtml(addr.title)}</span>
            ${addr.isDefault ? '<span class="badge badge-success">Default</span>' : ''}
          </div>
          <p class="text-xs text-secondary">${Validation.escapeHtml(addr.text)}</p>
        </div>
        <div class="flex gap-2">
          ${!addr.isDefault ? `<button class="btn btn-outline btn-sm" onclick="Customer.setDefaultAddress(${idx})">Set Default</button>` : ''}
          <button class="btn btn-outline btn-sm text-danger" onclick="Customer.deleteAddress(${idx})">&times;</button>
        </div>
      </div>
    `).join("");
  },

  setDefaultAddress(index) {
    const user = StorageManager.getCurrentUser();
    if (!user || !user.addresses) return;
    user.addresses.forEach((a, i) => a.isDefault = i === index);
    StorageManager.saveUser(user);
    FoodoraApp.showToast("Default address updated.", "success");
    this.renderAddressesManager();
  },

  deleteAddress(index) {
    const user = StorageManager.getCurrentUser();
    if (!user || !user.addresses) return;
    if (confirm("Delete this saved address?")) {
      user.addresses.splice(index, 1);
      StorageManager.saveUser(user);
      FoodoraApp.showToast("Address deleted.", "info");
      this.renderAddressesManager();
    }
  },

  addNewAddress(title, text) {
    const user = StorageManager.getCurrentUser();
    if (!user) return;
    if (!user.addresses) user.addresses = [];
    user.addresses.push({
      id: "addr_" + Date.now(),
      title: title || "Other",
      text: text,
      isDefault: user.addresses.length === 0
    });
    StorageManager.saveUser(user);
    FoodoraApp.showToast("New address added successfully!", "success");
    this.renderAddressesManager();
  }
};
