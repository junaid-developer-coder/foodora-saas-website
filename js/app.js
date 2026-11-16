/**
 * ==========================================================================
 * FOODORA SAAS - MAIN APPLICATION CONTROLLER (js/app.js)
 * Global layout, header, cart badges, theme switcher, toasts, and modals.
 * ==========================================================================
 */

window.FoodoraApp = {
  init() {
    this.initTheme();
    this.setupThemeToggle();
    this.updateCartBadge();
    this.renderHeaderUser();
    this.setupMobileDrawer();
    this.setupNewsletter();
    this.setupHeaderSearch();
    this.setupScrollHeader();
  },

  /**
   * Theme Management (Light / Dark)
   */
  initTheme() {
    const savedTheme = StorageManager.getTheme();
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeIcons(savedTheme);
  },

  setupThemeToggle() {
    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const current = StorageManager.getTheme();
        const next = current === "dark" ? "light" : "dark";
        StorageManager.setTheme(next);
        this.updateThemeIcons(next);
        this.showToast(`Switched to ${next} theme!`, "info");
      });
    });
  },

  updateThemeIcons(theme) {
    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
      if (theme === "dark") {
        btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      } else {
        btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      }
    });
  },

  /**
   * Cart Badge Update
   */
  updateCartBadge() {
    const cart = StorageManager.getCart();
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll(".cart-badge, .mobile-cart-badge");
    badges.forEach(b => {
      b.textContent = totalCount;
      b.style.display = totalCount > 0 ? "flex" : "none";
      b.classList.add("bounce");
      setTimeout(() => b.classList.remove("bounce"), 300);
    });
  },

  /**
   * Header User Account State
   */
  renderHeaderUser() {
    const userWrap = document.getElementById("headerUserWrap");
    if (!userWrap) return;

    const user = StorageManager.getCurrentUser();
    // Resolve proper relative paths
    const isPages = window.location.pathname.includes("/pages/");
    const isDashboard = window.location.pathname.includes("/dashboard/");
    const prefix = isPages ? "../" : (isDashboard ? "../../" : "");

    if (user) {
      let dashLink = `${prefix}dashboard/customer/index.html`;
      if (user.role === "admin") dashLink = `${prefix}dashboard/admin/index.html`;
      if (user.role === "owner") dashLink = `${prefix}dashboard/owner/index.html`;

      userWrap.innerHTML = `
        <div class="user-menu-wrap">
          <button class="user-menu-btn" id="userMenuToggleBtn">
            <img src="${user.avatar}" alt="${user.name}" class="user-avatar-sm" />
            <span class="user-name-text">${user.name.split(" ")[0]}</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="dropdown-menu" id="userDropdownMenu">
            <div class="dropdown-header">
              <div class="dropdown-user-name">${user.name}</div>
              <div class="dropdown-user-role">${user.role.toUpperCase()} • ${user.email}</div>
            </div>
            <a href="${dashLink}" class="dropdown-item">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Dashboard
            </a>
            <a href="${prefix}pages/orders.html" class="dropdown-item">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              My Orders
            </a>
            <a href="${prefix}pages/favorites.html" class="dropdown-item">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              Favorites
            </a>
            <a href="${prefix}pages/profile.html" class="dropdown-item">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Profile Settings
            </a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item text-danger" onclick="Auth.logout()">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>
        </div>
      `;

      // Toggle dropdown
      const btn = document.getElementById("userMenuToggleBtn");
      const menu = document.getElementById("userDropdownMenu");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("show");
      });
      document.addEventListener("click", () => menu.classList.remove("show"));
    } else {
      userWrap.innerHTML = `
        <a href="${prefix}login.html" class="btn btn-outline btn-sm">Sign In</a>
        <a href="${prefix}register.html" class="btn btn-primary btn-sm">Sign Up</a>
      `;
    }
  },

  /**
   * Mobile Navigation Drawer
   */
  setupMobileDrawer() {
    const toggleBtn = document.querySelector(".mobile-nav-toggle");
    const drawer = document.querySelector(".mobile-drawer");
    const backdrop = document.querySelector(".mobile-drawer-backdrop");
    const closeBtn = document.querySelector(".drawer-close-btn");

    if (!toggleBtn || !drawer || !backdrop) return;

    const openDrawer = () => {
      drawer.classList.add("show");
      backdrop.classList.add("show");
      document.body.style.overflow = "hidden";
    };

    const closeDrawer = () => {
      drawer.classList.remove("show");
      backdrop.classList.remove("show");
      document.body.style.overflow = "";
    };

    toggleBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);
  },

  /**
   * Mobile Dashboard Sidebar Toggle
   */
  toggleMobileSidebar() {
    const sidebar = document.getElementById("dashboardSidebar") || document.querySelector(".dashboard-sidebar");
    if (!sidebar) return;

    let backdrop = document.querySelector(".dashboard-sidebar-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "dashboard-sidebar-backdrop";
      document.body.appendChild(backdrop);
      backdrop.addEventListener("click", () => {
        sidebar.classList.remove("show");
        backdrop.classList.remove("show");
        document.body.style.overflow = "";
      });
      sidebar.querySelectorAll(".sidebar-link").forEach(link => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 991) {
            sidebar.classList.remove("show");
            backdrop.classList.remove("show");
            document.body.style.overflow = "";
          }
        });
      });
    }

    const isOpen = sidebar.classList.contains("show");
    if (isOpen) {
      sidebar.classList.remove("show");
      backdrop.classList.remove("show");
      document.body.style.overflow = "";
    } else {
      sidebar.classList.add("show");
      backdrop.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  },

  /**
   * Scroll Effect for Header
   */
  setupScrollHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  },

  /**
   * Header Search Input
   */
  setupHeaderSearch() {
    const searchForms = document.querySelectorAll(".header-search-form");
    searchForms.forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        if (input && input.value.trim()) {
          const isPages = window.location.pathname.includes("/pages/");
          const prefix = isPages ? "" : "pages/";
          window.location.href = `${prefix}search.html?q=${encodeURIComponent(input.value.trim())}`;
        }
      });
    });
  },

  /**
   * Newsletter Subscription Simulation
   */
  setupNewsletter() {
    const forms = document.querySelectorAll(".newsletter-form");
    forms.forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        if (input && Validation.isValidEmail(input.value)) {
          this.showToast("Thank you for subscribing! Voucher code: FOODORA50", "success");
          input.value = "";
        } else {
          this.showToast("Please enter a valid email address.", "error");
        }
      });
    });
  },

  /**
   * Global Toast Notification System
   */
  showToast(message, type = "info", duration = 3500) {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icons = {
      success: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
      error: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
      warning: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${type.toUpperCase()}</div>
        <div class="toast-message">${Validation.escapeHtml(message)}</div>
      </div>
      <div class="toast-close">&times;</div>
    `;

    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.classList.add("toast-fadeout");
      setTimeout(() => toast.remove(), 200);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add("toast-fadeout");
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  },

  /**
   * Modal Dialog Helper
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("show");
    document.body.style.overflow = "";
  },

  /**
   * Global Food Item Customization & Add-to-Cart Modal
   */
  openCustomizeModal(productId) {
    const product = StorageManager.getProductById(productId);
    if (!product) {
      this.showToast("Product not found.", "error");
      return;
    }

    let modal = document.getElementById("customizeModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "customizeModal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    let selectedSize = product.sizes && product.sizes.length ? product.sizes.find(s => s.default) || product.sizes[0] : null;
    let selectedExtras = [];
    let quantity = 1;

    const renderModalContent = () => {
      const basePrice = product.price;
      const sizeOffset = selectedSize ? selectedSize.priceOffset : 0;
      const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
      const singlePrice = basePrice + sizeOffset + extrasTotal;
      const totalAmount = singlePrice * quantity;

      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <div class="modal-title">${product.name}</div>
              <div class="text-xs text-primary font-semibold">${product.restaurantName}</div>
            </div>
            <button class="modal-close-btn" onclick="FoodoraApp.closeModal('customizeModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div style="height: 180px; border-radius: var(--radius-xl); overflow: hidden; margin-bottom: var(--space-4);">
              <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <p class="text-sm text-secondary mb-4">${product.description}</p>

            ${product.sizes && product.sizes.length ? `
              <div class="custom-section-box">
                <div class="custom-section-title">
                  <span>Select Size</span>
                  <span class="badge badge-orange">Required</span>
                </div>
                <div class="custom-opt-list">
                  ${product.sizes.map((s, idx) => `
                    <label class="custom-opt-row">
                      <div class="form-checkbox-label">
                        <input type="radio" name="food_size" value="${s.name}" ${s.name === selectedSize.name ? "checked" : ""} data-idx="${idx}" />
                        <span>${s.name}</span>
                      </div>
                      <span class="text-xs font-bold">${s.priceOffset >= 0 ? `+Rs. ${s.priceOffset}` : `-Rs. ${Math.abs(s.priceOffset)}`}</span>
                    </label>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            ${product.extras && product.extras.length ? `
              <div class="custom-section-box">
                <div class="custom-section-title">
                  <span>Add Extras & Toppings</span>
                  <span class="badge badge-info">Optional</span>
                </div>
                <div class="custom-opt-list">
                  ${product.extras.map((extra, idx) => {
                    const isChecked = selectedExtras.some(e => e.name === extra.name);
                    return `
                      <label class="custom-opt-row">
                        <div class="form-checkbox-label">
                          <input type="checkbox" name="food_extra" value="${extra.name}" ${isChecked ? "checked" : ""} data-idx="${idx}" />
                          <span>${extra.name}</span>
                        </div>
                        <span class="text-xs font-bold">+Rs. ${extra.price}</span>
                      </label>
                    `;
                  }).join("")}
                </div>
              </div>
            ` : ""}

            <div class="form-group mt-4">
              <label class="form-label">Special Kitchen Instructions</label>
              <textarea class="form-textarea" id="customizeNotes" rows="2" placeholder="e.g. Less spicy, extra napkins, cutlery..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <div class="qty-control">
              <button class="qty-btn" id="modalQtyMinus">-</button>
              <span class="qty-val" id="modalQtyVal">${quantity}</span>
              <button class="qty-btn" id="modalQtyPlus">+</button>
            </div>
            <button class="btn btn-primary" id="modalAddToCartBtn">
              Add to Cart • Rs. ${totalAmount.toLocaleString()}
            </button>
          </div>
        </div>
      `;

      // Event listeners inside modal
      modal.querySelectorAll("input[name='food_size']").forEach(radio => {
        radio.addEventListener("change", (e) => {
          const idx = parseInt(e.target.getAttribute("data-idx"));
          selectedSize = product.sizes[idx];
          renderModalContent();
        });
      });

      modal.querySelectorAll("input[name='food_extra']").forEach(chk => {
        chk.addEventListener("change", (e) => {
          const idx = parseInt(e.target.getAttribute("data-idx"));
          const extra = product.extras[idx];
          if (e.target.checked) {
            selectedExtras.push(extra);
          } else {
            selectedExtras = selectedExtras.filter(x => x.name !== extra.name);
          }
          renderModalContent();
        });
      });

      const qtyMinus = modal.querySelector("#modalQtyMinus");
      const qtyPlus = modal.querySelector("#modalQtyPlus");
      if (qtyMinus) {
        qtyMinus.addEventListener("click", () => {
          if (quantity > 1) {
            quantity--;
            renderModalContent();
          }
        });
      }
      if (qtyPlus) {
        qtyPlus.addEventListener("click", () => {
          quantity++;
          renderModalContent();
        });
      }

      const addBtn = modal.querySelector("#modalAddToCartBtn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          const notes = modal.querySelector("#customizeNotes")?.value.trim() || "";
          StorageManager.addToCart({
            productId: product.id,
            name: product.name,
            restaurantId: product.restaurantId,
            restaurantName: product.restaurantName,
            price: singlePrice,
            image: product.image,
            selectedSize: selectedSize ? selectedSize.name : null,
            selectedExtras: selectedExtras.map(e => e.name),
            instructions: notes,
            quantity: quantity
          });

          FoodoraApp.closeModal("customizeModal");
          FoodoraApp.showToast(`Added ${quantity}x ${product.name} to cart!`, "success");
        });
      }
    };

    renderModalContent();
    this.openModal("customizeModal");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.FoodoraApp.init();
});
