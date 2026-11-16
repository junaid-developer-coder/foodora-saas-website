/**
 * ==========================================================================
 * FOODORA SAAS - RESTAURANTS CONTROLLER (js/restaurants.js)
 * Restaurant listing, live filtering, and details page.
 * ==========================================================================
 */

const Restaurants = {
  /**
   * Renders a single restaurant card HTML string
   */
  renderCard(rest, isPages = false) {
    const prefix = isPages ? "" : "pages/";
    return `
      <div class="restaurant-card" data-restaurant-id="${rest.id}">
        <div class="restaurant-card-thumb">
          <img src="${rest.image}" alt="${Validation.escapeHtml(rest.name)}" class="restaurant-card-img" loading="lazy" />
          <span class="restaurant-status-tag ${rest.isOpen ? 'open' : 'closed'}">
            ${rest.isOpen ? '● Open Now' : '○ Closed'}
          </span>
          <span class="restaurant-time-tag">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${rest.deliveryTime}
          </span>
        </div>
        <div class="restaurant-card-body">
          <div class="restaurant-card-header">
            <h3 class="restaurant-card-title">
              <a href="${prefix}restaurant-details.html?id=${rest.id}">${Validation.escapeHtml(rest.name)}</a>
            </h3>
            <span class="badge badge-rating">★ ${rest.rating}</span>
          </div>
          <p class="restaurant-card-tags">${Validation.escapeHtml(rest.category)}</p>
          <div class="restaurant-card-footer">
            <span class="restaurant-delivery-fee">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              Delivery: Rs. ${rest.deliveryFee}
            </span>
            <a href="${prefix}restaurant-details.html?id=${rest.id}" class="btn btn-primary btn-sm">
              View Menu
            </a>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Initializes Restaurants Discovery Page (pages/restaurants.html)
   */
  initListPage() {
    const grid = document.getElementById("restaurantsGrid");
    if (!grid) return;

    let activeCategory = "all";
    let activeSort = "popular";
    let activeRating = 0;
    let maxTime = 999;
    let searchQuery = "";

    // Parse URL params for pre-filter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("category")) activeCategory = urlParams.get("category");
    if (urlParams.get("q")) searchQuery = urlParams.get("q").toLowerCase();

    const render = () => {
      let list = StorageManager.getRestaurants();

      // Filter by category
      if (activeCategory !== "all") {
        list = list.filter(r => r.categoryId === activeCategory || r.category.toLowerCase().includes(activeCategory.toLowerCase()));
      }

      // Filter by search query
      if (searchQuery) {
        list = list.filter(r => 
          r.name.toLowerCase().includes(searchQuery) || 
          r.category.toLowerCase().includes(searchQuery)
        );
      }

      // Filter by rating
      if (activeRating > 0) {
        list = list.filter(r => r.rating >= activeRating);
      }

      // Filter by delivery time
      if (maxTime < 999) {
        list = list.filter(r => {
          const num = parseInt(r.deliveryTime) || 30;
          return num <= maxTime;
        });
      }

      // Sorting
      if (activeSort === "rating") {
        list.sort((a, b) => b.rating - a.rating);
      } else if (activeSort === "delivery") {
        list.sort((a, b) => (parseInt(a.deliveryTime) || 30) - (parseInt(b.deliveryTime) || 30));
      } else if (activeSort === "fee") {
        list.sort((a, b) => a.deliveryFee - b.deliveryFee);
      }

      const countEl = document.getElementById("restaurantCount");
      if (countEl) countEl.textContent = `Showing ${list.length} restaurants`;

      if (list.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🏪</div>
            <h3 class="empty-state-title">No Restaurants Found</h3>
            <p class="empty-state-text">Try adjusting your filters or search terms to find available dining spots.</p>
            <button class="btn btn-outline" id="resetFiltersBtn">Reset All Filters</button>
          </div>
        `;
        const resetBtn = grid.querySelector("#resetFiltersBtn");
        if (resetBtn) {
          resetBtn.addEventListener("click", () => {
            activeCategory = "all";
            activeRating = 0;
            maxTime = 999;
            searchQuery = "";
            document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
            const allChip = document.querySelector(".filter-chip[data-cat='all']");
            if (allChip) allChip.classList.add("active");
            render();
          });
        }
      } else {
        grid.innerHTML = list.map(r => this.renderCard(r, true)).join("");
      }
    };

    // Category chips
    const chips = document.querySelectorAll(".category-filter-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeCategory = chip.getAttribute("data-cat");
        render();
      });
    });

    // Sort selector
    const sortSelect = document.getElementById("sortSelector");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        activeSort = e.target.value;
        render();
      });
    }

    // Search input
    const searchInput = document.getElementById("restaurantSearchInput");
    if (searchInput) {
      if (searchQuery) searchInput.value = searchQuery;
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        render();
      });
    }

    render();
  },

  /**
   * Initializes Restaurant Details Page (pages/restaurant-details.html)
   */
  initDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const restId = urlParams.get("id") || "rest_1";
    const restaurant = StorageManager.getRestaurantById(restId);

    if (!restaurant) {
      const banner = document.getElementById("restaurantBannerWrap");
      if (banner) {
        banner.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🏪</div>
            <h2>Restaurant Not Found</h2>
            <a href="restaurants.html" class="btn btn-primary mt-4">Browse All Restaurants</a>
          </div>
        `;
      }
      return;
    }

    document.title = `${restaurant.name} - Menu & Delivery | Foodora SaaS`;

    // Render Banner
    const bannerWrap = document.getElementById("restaurantBannerWrap");
    if (bannerWrap) {
      bannerWrap.innerHTML = `
        <div class="restaurant-detail-banner">
          <img src="${restaurant.banner || restaurant.image}" alt="${restaurant.name}" class="restaurant-cover-img" />
          <div class="restaurant-banner-overlay">
            <div class="restaurant-profile-header">
              <div class="restaurant-logo-box">
                <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-logo-img" />
              </div>
              <div class="restaurant-info-box">
                <h1 class="restaurant-detail-title">
                  ${Validation.escapeHtml(restaurant.name)}
                  <span class="badge ${restaurant.isOpen ? 'badge-success' : 'badge-danger'}">
                    ${restaurant.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </h1>
                <p class="text-sm" style="color: rgba(255,255,255,0.85); margin-bottom: var(--space-3);">
                  ${Validation.escapeHtml(restaurant.category)} • ${Validation.escapeHtml(restaurant.address)}
                </p>
                <div class="restaurant-meta-pills">
                  <span class="restaurant-meta-pill">★ ${restaurant.rating} (${restaurant.reviewsCount} reviews)</span>
                  <span class="restaurant-meta-pill">⏱ ${restaurant.deliveryTime}</span>
                  <span class="restaurant-meta-pill">🛵 Rs. ${restaurant.deliveryFee} Delivery</span>
                  <span class="restaurant-meta-pill">🏷 Min. Rs. ${restaurant.minOrder}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Render Menu Items
    const allProducts = StorageManager.getProducts();
    const menuItems = allProducts.filter(p => p.restaurantId === restaurant.id);

    // Group items by category
    const categoriesMap = {};
    menuItems.forEach(item => {
      const cat = item.categoryName || "Specialties";
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push(item);
    });

    // Render Sticky Category Navigation Tabs
    const tabsContainer = document.getElementById("restaurantMenuTabs");
    if (tabsContainer) {
      const catNames = Object.keys(categoriesMap);
      tabsContainer.innerHTML = `
        <button class="menu-tab-btn active" data-target="all">All Items (${menuItems.length})</button>
        ${catNames.map(name => `
          <button class="menu-tab-btn" data-target="cat_${name.replace(/\s+/g, '')}">${name} (${categoriesMap[name].length})</button>
        `).join("")}
      `;

      tabsContainer.querySelectorAll(".menu-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          tabsContainer.querySelectorAll(".menu-tab-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const target = btn.getAttribute("data-target");

          document.querySelectorAll(".menu-category-section").forEach(sec => {
            if (target === "all" || sec.id === target) {
              sec.style.display = "block";
            } else {
              sec.style.display = "none";
            }
          });
        });
      });
    }

    // Render Dishes Grid
    const menuContainer = document.getElementById("restaurantMenuContent");
    if (menuContainer) {
      if (menuItems.length === 0) {
        menuContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h3>Menu Is Being Updated</h3>
            <p class="empty-state-text">This restaurant is currently preparing a fresh seasonal menu.</p>
          </div>
        `;
      } else {
        menuContainer.innerHTML = Object.keys(categoriesMap).map(catName => `
          <div class="menu-category-section" id="cat_${catName.replace(/\s+/g, '')}">
            <h2 class="menu-category-heading">${catName}</h2>
            <div class="grid grid-cols-1 grid-cols-2 grid-cols-3 gap-6">
              ${categoriesMap[catName].map(dish => Products.renderCard(dish, true)).join("")}
            </div>
          </div>
        `).join("");
      }
    }
  }
};
