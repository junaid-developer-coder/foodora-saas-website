/**
 * ==========================================================================
 * FOODORA SAAS - STORAGE MANAGER (js/storage.js)
 * Manages LocalStorage data persistence, seed initialization, and CRUD.
 * ==========================================================================
 */

const STORAGE_KEYS = {
  INITIALIZED: "foodora_initialized_v1",
  USERS: "foodora_users",
  CURRENT_USER: "foodora_current_user",
  RESTAURANTS: "foodora_restaurants",
  PRODUCTS: "foodora_products",
  CATEGORIES: "foodora_categories",
  COUPONS: "foodora_coupons",
  ORDERS: "foodora_orders",
  CART: "foodora_cart",
  FAVORITES: "foodora_favorites",
  NOTIFICATIONS: "foodora_notifications",
  THEME: "foodora_theme"
};

const StorageManager = {
  /**
   * Initializes LocalStorage with default dataset if not present.
   */
  init() {
    try {
      const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInit) {
        this.resetAllData();
      }
    } catch (e) {
      console.warn("LocalStorage access failed. Using memory fallback.", e);
    }
  },

  /**
   * Resets all storage data to platform baseline state.
   */
  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_DATA.users[0])); // Default to Customer
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(INITIAL_DATA.restaurants));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_DATA.products));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_DATA.categories));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_DATA.coupons));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_DATA.orders));
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(["prod_1", "prod_4", "rest_1"]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_DATA.notifications));
    localStorage.setItem(STORAGE_KEYS.THEME, "light");
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
  },

  // Generic Get & Set
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error setting " + key, e);
    }
  },

  // Current Session User
  getCurrentUser() {
    return this.get(STORAGE_KEYS.CURRENT_USER, INITIAL_DATA.users[0]);
  },

  setCurrentUser(user) {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  },

  logoutUser() {
    this.set(STORAGE_KEYS.CURRENT_USER, null);
  },

  // Users Collection
  getUsers() {
    return this.get(STORAGE_KEYS.USERS, INITIAL_DATA.users);
  },

  saveUser(newUser) {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.email === newUser.email);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...newUser };
    } else {
      users.push(newUser);
    }
    this.set(STORAGE_KEYS.USERS, users);
    if (this.getCurrentUser()?.id === newUser.id) {
      this.setCurrentUser(newUser);
    }
  },

  // Restaurants
  getRestaurants() {
    return this.get(STORAGE_KEYS.RESTAURANTS, INITIAL_DATA.restaurants);
  },

  saveRestaurants(list) {
    this.set(STORAGE_KEYS.RESTAURANTS, list);
  },

  getRestaurantById(id) {
    const list = this.getRestaurants();
    return list.find(r => r.id === id) || null;
  },

  // Products
  getProducts() {
    return this.get(STORAGE_KEYS.PRODUCTS, INITIAL_DATA.products);
  },

  saveProducts(list) {
    this.set(STORAGE_KEYS.PRODUCTS, list);
  },

  getProductById(id) {
    const list = this.getProducts();
    return list.find(p => p.id === id) || null;
  },

  // Categories
  getCategories() {
    return this.get(STORAGE_KEYS.CATEGORIES, INITIAL_DATA.categories);
  },

  saveCategories(list) {
    this.set(STORAGE_KEYS.CATEGORIES, list);
  },

  // Coupons
  getCoupons() {
    return this.get(STORAGE_KEYS.COUPONS, INITIAL_DATA.coupons);
  },

  saveCoupons(list) {
    this.set(STORAGE_KEYS.COUPONS, list);
  },

  // Orders
  getOrders() {
    return this.get(STORAGE_KEYS.ORDERS, INITIAL_DATA.orders);
  },

  saveOrders(list) {
    this.set(STORAGE_KEYS.ORDERS, list);
  },

  getOrderById(id) {
    const list = this.getOrders();
    return list.find(o => o.id === id) || null;
  },

  addOrder(order) {
    const list = this.getOrders();
    list.unshift(order);
    this.saveOrders(list);

    // Also add notification for order placed
    this.addNotification({
      id: "notif_" + Date.now(),
      title: "Order Placed Successfully",
      message: `Your order #${order.id} for Rs. ${order.total.toLocaleString()} has been received.`,
      time: "Just now",
      type: "order",
      isRead: false
    });
    return order;
  },

  updateOrderStatus(orderId, newStatus) {
    const list = this.getOrders();
    const order = list.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (!order.statusHistory) order.statusHistory = [];
      const statusLabels = {
        placed: "Order Placed",
        confirmed: "Restaurant Confirmed",
        preparing: "Kitchen Preparing",
        ready: "Ready for Pickup",
        out_for_delivery: "Rider Out For Delivery",
        delivered: "Delivered Successfully",
        cancelled: "Order Cancelled"
      };
      order.statusHistory.push({
        status: newStatus,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: statusLabels[newStatus] || newStatus
      });
      this.saveOrders(list);

      // Add notification
      this.addNotification({
        id: "notif_" + Date.now(),
        title: `Order Status: ${statusLabels[newStatus]}`,
        message: `Order #${orderId} has been updated to "${statusLabels[newStatus]}".`,
        time: "Just now",
        type: "order",
        isRead: false
      });
    }
  },

  // Shopping Cart
  getCart() {
    return this.get(STORAGE_KEYS.CART, []);
  },

  saveCart(cart) {
    this.set(STORAGE_KEYS.CART, cart);
    if (window.FoodoraApp && typeof window.FoodoraApp.updateCartBadge === 'function') {
      window.FoodoraApp.updateCartBadge();
    }
  },

  addToCart(item) {
    const cart = this.getCart();
    // Check if same item with exact same size and extras exists
    const existingIndex = cart.findIndex(c => 
      c.productId === item.productId &&
      c.selectedSize === item.selectedSize &&
      JSON.stringify(c.selectedExtras || []) === JSON.stringify(item.selectedExtras || [])
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push({
        ...item,
        cartItemId: "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4)
      });
    }
    this.saveCart(cart);
    return cart;
  },

  updateCartQty(cartItemId, delta) {
    const cart = this.getCart();
    const item = cart.find(c => c.cartItemId === cartItemId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(cartItemId);
        return;
      }
      this.saveCart(cart);
    }
  },

  removeFromCart(cartItemId) {
    let cart = this.getCart();
    cart = cart.filter(c => c.cartItemId !== cartItemId);
    this.saveCart(cart);
  },

  clearCart() {
    this.saveCart([]);
  },

  // Favorites / Wishlist
  getFavorites() {
    return this.get(STORAGE_KEYS.FAVORITES, []);
  },

  toggleFavorite(id) {
    let favs = this.getFavorites();
    const index = favs.indexOf(id);
    let added = false;
    if (index >= 0) {
      favs.splice(index, 1);
      added = false;
    } else {
      favs.push(id);
      added = true;
    }
    this.set(STORAGE_KEYS.FAVORITES, favs);
    return added;
  },

  isFavorite(id) {
    const favs = this.getFavorites();
    return favs.includes(id);
  },

  // Notifications
  getNotifications() {
    return this.get(STORAGE_KEYS.NOTIFICATIONS, INITIAL_DATA.notifications);
  },

  saveNotifications(list) {
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  addNotification(notif) {
    const list = this.getNotifications();
    list.unshift(notif);
    this.saveNotifications(list);
  },

  markNotificationsAsRead() {
    const list = this.getNotifications();
    list.forEach(n => n.isRead = true);
    this.saveNotifications(list);
  },

  // Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }
};

// Auto-run init
StorageManager.init();
