/**
 * ==========================================================================
 * FOODORA SAAS - PRODUCTS CONTROLLER (js/products.js)
 * Food card rendering, product details page logic, and favorites.
 * ==========================================================================
 */

const Products = {
  /**
   * Renders a single food card HTML string.
   */
  renderCard(prod, isPages = false) {
    const isFav = StorageManager.isFavorite(prod.id);
    const prefix = isPages ? "" : "pages/";
    return `
      <div class="food-card" data-product-id="${prod.id}">
        <div class="food-card-thumb">
          <img src="${prod.image}" alt="${Validation.escapeHtml(prod.name)}" class="food-card-img" loading="lazy" />
          <button class="food-card-fav ${isFav ? 'active' : ''}" onclick="Products.toggleFav('${prod.id}', this)" title="Add to favorites">
            <svg width="18" height="18" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
          ${prod.badge ? `<span class="food-card-badge badge-orange">${Validation.escapeHtml(prod.badge)}</span>` : ''}
        </div>
        <div class="food-card-body">
          <div class="food-card-meta">
            <span class="food-card-restaurant">${Validation.escapeHtml(prod.restaurantName)}</span>
            <div class="food-card-rating">
              <span class="text-warning">★</span>
              <span>${prod.rating}</span>
            </div>
          </div>
          <a href="${prefix}food-details.html?id=${prod.id}" class="food-card-title">${Validation.escapeHtml(prod.name)}</a>
          <p class="food-card-desc">${Validation.escapeHtml(prod.description)}</p>
          <div class="food-card-footer">
            <div class="food-price-wrap">
              <span class="food-price">Rs. ${prod.price.toLocaleString()}</span>
              ${prod.oldPrice ? `<span class="food-price-old">Rs. ${prod.oldPrice.toLocaleString()}</span>` : ''}
            </div>
            <button class="food-card-add-btn" onclick="FoodoraApp.openCustomizeModal('${prod.id}')" title="Customize & Add to Cart">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Toggles product favorite status
   */
  toggleFav(productId, btnElement) {
    const isAdded = StorageManager.toggleFavorite(productId);
    if (btnElement) {
      btnElement.classList.toggle("active", isAdded);
      const svg = btnElement.querySelector("svg");
      if (svg) svg.setAttribute("fill", isAdded ? "currentColor" : "none");
    }
    const prod = StorageManager.getProductById(productId);
    const title = prod ? prod.name : "Item";
    FoodoraApp.showToast(isAdded ? `Added ${title} to favorites!` : `Removed ${title} from favorites.`, isAdded ? "success" : "info");
  },

  /**
   * Initializes Product Details Page (pages/food-details.html)
   */
  initDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get("id") || "prod_1";
    const product = StorageManager.getProductById(prodId);

    if (!product) {
      const container = document.getElementById("productDetailsContainer");
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h2 class="empty-state-title">Dish Not Found</h2>
            <p class="empty-state-text">The food item you are looking for does not exist or has been removed.</p>
            <a href="restaurants.html" class="btn btn-primary">Browse Restaurants</a>
          </div>
        `;
      }
      return;
    }

    // Set page title
    document.title = `${product.name} - Foodora SaaS`;

    const container = document.getElementById("productDetailsContainer");
    if (!container) return;

    let selectedSize = product.sizes && product.sizes.length ? product.sizes.find(s => s.default) || product.sizes[0] : null;
    let selectedExtras = [];
    let quantity = 1;

    const render = () => {
      const basePrice = product.price;
      const sizeOffset = selectedSize ? selectedSize.priceOffset : 0;
      const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
      const singlePrice = basePrice + sizeOffset + extrasTotal;
      const totalAmount = singlePrice * quantity;
      const isFav = StorageManager.isFavorite(product.id);

      container.innerHTML = `
        <div class="product-detail-grid">
          <div class="product-gallery">
            <div class="product-main-img-box">
              <img src="${product.image}" alt="${Validation.escapeHtml(product.name)}" class="product-main-img" />
              <button class="food-card-fav ${isFav ? 'active' : ''}" style="top: 20px; right: 20px;" onclick="Products.toggleFav('${product.id}', this)">
                <svg width="20" height="20" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
          </div>

          <div class="product-info-wrap">
            <a href="restaurant-details.html?id=${product.restaurantId}" class="product-restaurant-link">
              ← ${Validation.escapeHtml(product.restaurantName)}
            </a>
            <h1 class="product-title">${Validation.escapeHtml(product.name)}</h1>
            <div class="product-meta-row">
              <span class="badge badge-rating">★ ${product.rating} (${product.reviewsCount} reviews)</span>
              <span class="badge badge-orange">${product.categoryName}</span>
              ${product.badge ? `<span class="badge badge-info">${product.badge}</span>` : ''}
            </div>
            <p class="product-desc">${Validation.escapeHtml(product.description)}</p>

            ${product.ingredients && product.ingredients.length ? `
              <div class="mb-6">
                <span class="text-xs font-bold text-muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Ingredients:</span>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${product.ingredients.map(ing => `<span class="badge" style="background: var(--bg-surface-secondary);">${Validation.escapeHtml(ing)}</span>`).join("")}
                </div>
              </div>
            ` : ""}

            ${product.sizes && product.sizes.length ? `
              <div class="custom-section-box">
                <div class="custom-section-title">
                  <span>Choose Your Portion Size</span>
                  <span class="badge badge-orange">Required</span>
                </div>
                <div class="custom-opt-list">
                  ${product.sizes.map((s, idx) => `
                    <label class="custom-opt-row">
                      <div class="form-checkbox-label">
                        <input type="radio" name="details_food_size" value="${s.name}" ${s.name === selectedSize.name ? "checked" : ""} data-idx="${idx}" />
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
                  <span>Optional Extras & Add-ons</span>
                  <span class="badge badge-info">Optional</span>
                </div>
                <div class="custom-opt-list">
                  ${product.extras.map((extra, idx) => {
                    const isChecked = selectedExtras.some(e => e.name === extra.name);
                    return `
                      <label class="custom-opt-row">
                        <div class="form-checkbox-label">
                          <input type="checkbox" name="details_food_extra" value="${extra.name}" ${isChecked ? "checked" : ""} data-idx="${idx}" />
                          <span>${extra.name}</span>
                        </div>
                        <span class="text-xs font-bold">+Rs. ${extra.price}</span>
                      </label>
                    `;
                  }).join("")}
                </div>
              </div>
            ` : ""}

            <div class="form-group">
              <label class="form-label">Special Delivery / Preparation Instructions</label>
              <textarea class="form-textarea" id="detailInstructions" rows="2" placeholder="e.g. Please send extra chilli garlic sauce, no onions..."></textarea>
            </div>

            <div class="product-action-bar">
              <div>
                <span class="text-xs text-muted block">Total Price:</span>
                <span class="product-total-price">Rs. ${totalAmount.toLocaleString()}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="qty-control">
                  <button class="qty-btn" id="detailQtyMinus">-</button>
                  <span class="qty-val" id="detailQtyVal">${quantity}</span>
                  <button class="qty-btn" id="detailQtyPlus">+</button>
                </div>
                <button class="btn btn-primary btn-lg" id="detailAddToCartBtn">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event handlers
      container.querySelectorAll("input[name='details_food_size']").forEach(r => {
        r.addEventListener("change", (e) => {
          const idx = parseInt(e.target.getAttribute("data-idx"));
          selectedSize = product.sizes[idx];
          render();
        });
      });

      container.querySelectorAll("input[name='details_food_extra']").forEach(chk => {
        chk.addEventListener("change", (e) => {
          const idx = parseInt(e.target.getAttribute("data-idx"));
          const extra = product.extras[idx];
          if (e.target.checked) {
            selectedExtras.push(extra);
          } else {
            selectedExtras = selectedExtras.filter(x => x.name !== extra.name);
          }
          render();
        });
      });

      const qMinus = container.querySelector("#detailQtyMinus");
      const qPlus = container.querySelector("#detailQtyPlus");
      if (qMinus) {
        qMinus.addEventListener("click", () => {
          if (quantity > 1) {
            quantity--;
            render();
          }
        });
      }
      if (qPlus) {
        qPlus.addEventListener("click", () => {
          quantity++;
          render();
        });
      }

      const addBtn = container.querySelector("#detailAddToCartBtn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          const notes = container.querySelector("#detailInstructions")?.value.trim() || "";
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
          FoodoraApp.showToast(`Added ${quantity}x ${product.name} to cart!`, "success");
        });
      }
    };

    render();

    // Also render related products from same restaurant or category
    const relatedWrap = document.getElementById("relatedProductsGrid");
    if (relatedWrap) {
      const allProds = StorageManager.getProducts();
      const related = allProds.filter(p => p.id !== product.id && (p.restaurantId === product.restaurantId || p.categoryId === product.categoryId)).slice(0, 4);
      relatedWrap.innerHTML = related.map(p => this.renderCard(p, true)).join("");
    }
  }
};
