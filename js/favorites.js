/**
 * ==========================================================================
 * FOODORA SAAS - FAVORITES CONTROLLER (js/favorites.js)
 * Wishlist of saved food dishes and favorite restaurants.
 * ==========================================================================
 */

const Favorites = {
  init() {
    this.renderFavoritesPage();
  },

  renderFavoritesPage() {
    const dishesGrid = document.getElementById("favDishesGrid");
    const restGrid = document.getElementById("favRestaurantsGrid");
    if (!dishesGrid && !restGrid) return;

    const favIds = StorageManager.getFavorites();
    const allProducts = StorageManager.getProducts();
    const allRestaurants = StorageManager.getRestaurants();

    const favProducts = allProducts.filter(p => favIds.includes(p.id));
    const favRestaurants = allRestaurants.filter(r => favIds.includes(r.id));

    if (dishesGrid) {
      if (favProducts.length === 0) {
        dishesGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">❤️</div>
            <h3 class="empty-state-title">No Favorite Foods Yet</h3>
            <p class="empty-state-text">Click the heart icon on any dish card to keep it here for quick re-ordering.</p>
            <a href="restaurants.html" class="btn btn-primary">Discover Food</a>
          </div>
        `;
      } else {
        dishesGrid.innerHTML = favProducts.map(p => Products.renderCard(p, true)).join("");
      }
    }

    if (restGrid) {
      if (favRestaurants.length === 0) {
        restGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🏪</div>
            <h3 class="empty-state-title">No Favorite Restaurants Yet</h3>
            <p class="empty-state-text">Bookmark your favorite eateries to easily browse their latest menus.</p>
            <a href="restaurants.html" class="btn btn-primary">Browse Restaurants</a>
          </div>
        `;
      } else {
        restGrid.innerHTML = favRestaurants.map(r => Restaurants.renderCard(r, true)).join("");
      }
    }
  }
};
