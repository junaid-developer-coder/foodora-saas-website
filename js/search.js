/**
 * ==========================================================================
 * FOODORA SAAS - SEARCH CONTROLLER (js/search.js)
 * Global search, suggestions, search history, and live query matching.
 * ==========================================================================
 */

const Search = {
  HISTORY_KEY: "foodora_search_history",

  init() {
    this.renderSearchPage();
    this.setupLiveSearch();
  },

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.HISTORY_KEY)) || ["Biryani", "Double Smash", "Pizza", "Zinger"];
    } catch (e) {
      return [];
    }
  },

  addHistory(query) {
    if (!query) return;
    let list = this.getHistory();
    list = list.filter(q => q.toLowerCase() !== query.toLowerCase());
    list.unshift(query);
    if (list.length > 8) list.pop();
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(list));
  },

  clearHistory() {
    localStorage.removeItem(this.HISTORY_KEY);
    this.renderHistoryChips();
    FoodoraApp.showToast("Search history cleared.", "info");
  },

  renderHistoryChips() {
    const wrap = document.getElementById("searchHistoryWrap");
    if (!wrap) return;

    const list = this.getHistory();
    if (list.length === 0) {
      wrap.innerHTML = `<span class="text-xs text-muted">No recent searches.</span>`;
      return;
    }

    wrap.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-muted uppercase">Recent Searches:</span>
        <button class="text-xs text-danger hover-underline" onclick="Search.clearHistory()">Clear</button>
      </div>
      <div class="flex flex-wrap gap-2">
        ${list.map(term => `
          <button class="filter-chip" onclick="Search.executeSearch('${Validation.escapeHtml(term)}')">
            🕒 ${Validation.escapeHtml(term)}
          </button>
        `).join("")}
      </div>
    `;
  },

  executeSearch(term) {
    const input = document.getElementById("globalSearchInput");
    if (input) input.value = term;
    this.performSearch(term);
  },

  performSearch(query) {
    const trimmed = query.trim().toLowerCase();
    this.addHistory(trimmed);
    this.renderHistoryChips();

    const dishesContainer = document.getElementById("searchDishesResults");
    const restContainer = document.getElementById("searchRestaurantsResults");
    const countEl = document.getElementById("searchResultsCount");

    const allProducts = StorageManager.getProducts();
    const allRestaurants = StorageManager.getRestaurants();

    const matchedProducts = trimmed ? allProducts.filter(p => 
      p.name.toLowerCase().includes(trimmed) || 
      p.description.toLowerCase().includes(trimmed) ||
      p.categoryName.toLowerCase().includes(trimmed) ||
      p.restaurantName.toLowerCase().includes(trimmed)
    ) : [];

    const matchedRestaurants = trimmed ? allRestaurants.filter(r => 
      r.name.toLowerCase().includes(trimmed) || 
      r.category.toLowerCase().includes(trimmed) ||
      r.address.toLowerCase().includes(trimmed)
    ) : [];

    const totalMatches = matchedProducts.length + matchedRestaurants.length;
    if (countEl) {
      countEl.textContent = trimmed ? `Found ${totalMatches} results for "${trimmed}"` : "Showing trending food suggestions";
    }

    if (dishesContainer) {
      if (trimmed && matchedProducts.length === 0) {
        dishesContainer.innerHTML = `
          <div class="p-4 text-center text-muted" style="grid-column: 1 / -1;">
            No food dishes match your search.
          </div>
        `;
      } else {
        const displayList = trimmed ? matchedProducts : allProducts.slice(0, 6);
        dishesContainer.innerHTML = displayList.map(p => Products.renderCard(p, true)).join("");
      }
    }

    if (restContainer) {
      if (trimmed && matchedRestaurants.length === 0) {
        restContainer.innerHTML = `
          <div class="p-4 text-center text-muted" style="grid-column: 1 / -1;">
            No restaurants match your search.
          </div>
        `;
      } else {
        const displayList = trimmed ? matchedRestaurants : allRestaurants.slice(0, 4);
        restContainer.innerHTML = displayList.map(r => Restaurants.renderCard(r, true)).join("");
      }
    }
  },

  renderSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get("q") || "";
    const input = document.getElementById("globalSearchInput");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    this.renderHistoryChips();
    this.performSearch(initialQuery);
  },

  setupLiveSearch() {
    const input = document.getElementById("globalSearchInput");
    if (!input) return;

    let debounceTimer;
    input.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 250);
    });

    const form = document.getElementById("globalSearchForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.performSearch(input.value);
      });
    }
  }
};
