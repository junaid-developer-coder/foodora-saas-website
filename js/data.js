/**
 * ==========================================================================
 * FOODORA SAAS - INITIAL PLATFORM DATASET (js/data.js)
 * High-quality realistic food, restaurants, categories, coupons, and orders.
 * ==========================================================================
 */

const INITIAL_DATA = {
  // Registered Platform Users
  users: [
    {
      id: "usr_customer",
      name: "Hamza Sheikh",
      email: "customer@foodora.com",
      password: "password123",
      role: "customer",
      phone: "+92 300 1234567",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      addresses: [
        { id: "addr_1", title: "Home", text: "House # 42, Street 8, Phase 5, DHA, Lahore", isDefault: true },
        { id: "addr_2", title: "Office", text: "Software Technology Park, 4th Floor, Gulberg III, Lahore", isDefault: false }
      ],
      points: 450
    },
    {
      id: "usr_customer_alex",
      name: "Alex Morgan",
      email: "alex@foodora.com",
      password: "password123",
      role: "customer",
      phone: "+92 300 9876543",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      addresses: [
        { id: "addr_alex_1", title: "Home", text: "Apartment 4B, Clifton Block 2, Karachi", isDefault: true }
      ],
      points: 250
    },
    {
      id: "usr_owner",
      name: "Chef Tariq Mehmood",
      email: "owner@foodora.com",
      password: "password123",
      role: "owner",
      restaurantId: "rest_1",
      phone: "+92 321 9876543",
      avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "usr_admin",
      name: "SaaS Administrator",
      email: "admin@foodora.com",
      password: "password123",
      role: "admin",
      phone: "+92 311 0000000",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    }
  ],

  // Food Categories
  categories: [
    { id: "cat_burgers", name: "Burgers", icon: "🍔", count: 24, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80" },
    { id: "cat_pizza", name: "Pizza", icon: "🍕", count: 18, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80" },
    { id: "cat_biryani", name: "Biryani", icon: "🍚", count: 15, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80" },
    { id: "cat_bbq", name: "BBQ & Grills", icon: "🍢", count: 19, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80" },
    { id: "cat_chinese", name: "Chinese", icon: "🥡", count: 14, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80" },
    { id: "cat_fastfood", name: "Fast Food", icon: "🍟", count: 32, image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=300&q=80" },
    { id: "cat_desserts", name: "Desserts", icon: "🍰", count: 12, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80" },
    { id: "cat_drinks", name: "Drinks", icon: "🥤", count: 16, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80" }
  ],

  // Featured Restaurants
  restaurants: [
    {
      id: "rest_1",
      name: "Burger Lab Gourmet",
      category: "Burgers, Fast Food",
      categoryId: "cat_burgers",
      rating: 4.8,
      reviewsCount: 342,
      deliveryTime: "25-35 min",
      deliveryFee: 150,
      minOrder: 500,
      isOpen: true,
      address: "MM Alam Road, Gulberg II, Lahore",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
      banner: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      tags: ["Free Delivery Available", "Halal Certified", "Trending"]
    },
    {
      id: "rest_2",
      name: "Broadway Crust & Pizza",
      category: "Pizza, Italian",
      categoryId: "cat_pizza",
      rating: 4.7,
      reviewsCount: 420,
      deliveryTime: "30-45 min",
      deliveryFee: 120,
      minOrder: 800,
      isOpen: true,
      address: "Y-Block, Phase 3, DHA, Lahore",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
      banner: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      tags: ["Stuffed Crust", "Midnight Delivery"]
    },
    {
      id: "rest_3",
      name: "Student Biryani & Karahi",
      category: "Biryani, Pakistani",
      categoryId: "cat_biryani",
      rating: 4.9,
      reviewsCount: 680,
      deliveryTime: "20-30 min",
      deliveryFee: 100,
      minOrder: 400,
      isOpen: true,
      address: "Mall Road Commercial, Lahore",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
      banner: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      tags: ["Authentic Spice", "Best Seller"]
    },
    {
      id: "rest_4",
      name: "Bundu Khan Desi Grill",
      category: "BBQ & Grills, Pakistani",
      categoryId: "cat_bbq",
      rating: 4.8,
      reviewsCount: 512,
      deliveryTime: "35-50 min",
      deliveryFee: 180,
      minOrder: 1000,
      isOpen: true,
      address: "Fortress Stadium, Cantt, Lahore",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      banner: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      tags: ["Charcoal Grilled", "Family Platter"]
    },
    {
      id: "rest_5",
      name: "Golden Dragon Wok",
      category: "Chinese, Asian Fusion",
      categoryId: "cat_chinese",
      rating: 4.6,
      reviewsCount: 290,
      deliveryTime: "30-40 min",
      deliveryFee: 150,
      minOrder: 700,
      isOpen: true,
      address: "Z-Block Commercial, DHA, Lahore",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
      banner: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80",
      featured: false,
      tags: ["Szechuan Special", "Dumplings"]
    },
    {
      id: "rest_6",
      name: "Sweet Tooth Desserts",
      category: "Desserts, Bakery",
      categoryId: "cat_desserts",
      rating: 4.9,
      reviewsCount: 380,
      deliveryTime: "20-30 min",
      deliveryFee: 100,
      minOrder: 450,
      isOpen: true,
      address: "Hali Road, Gulberg, Lahore",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
      banner: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1200&q=80",
      featured: false,
      tags: ["Molten Lava", "Ice Creams"]
    }
  ],

  // Food Products (Menu Items)
  products: [
    {
      id: "prod_1",
      name: "Dynamite Double Cheese Smash",
      restaurantId: "rest_1",
      restaurantName: "Burger Lab Gourmet",
      categoryId: "cat_burgers",
      categoryName: "Burgers",
      price: 850,
      oldPrice: 1050,
      rating: 4.9,
      reviewsCount: 142,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      description: "Two prime 100% Angus beef patties smashed with grilled onions, double cheddar cheese, secret dynamite sauce on a toasted brioche bun.",
      ingredients: ["Angus Beef", "Cheddar Cheese", "Brioche Bun", "Secret Dynamite Sauce", "Pickles"],
      sizes: [
        { name: "Single Patty", priceOffset: -200 },
        { name: "Double Patty (Standard)", priceOffset: 0, default: true },
        { name: "Triple Monster", priceOffset: 300 }
      ],
      extras: [
        { name: "Extra Cheddar Cheese Slice", price: 120 },
        { name: "Crispy Beef Bacon", price: 200 },
        { name: "Spicy Jalapeños", price: 80 },
        { name: "Garlic Mayo Dip", price: 70 }
      ],
      isPopular: true,
      isAvailable: true,
      badge: "Bestseller"
    },
    {
      id: "prod_2",
      name: "Crispy Firecracker Zinger",
      restaurantId: "rest_1",
      restaurantName: "Burger Lab Gourmet",
      categoryId: "cat_burgers",
      categoryName: "Burgers",
      price: 680,
      oldPrice: 790,
      rating: 4.8,
      reviewsCount: 98,
      image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
      description: "Whole chicken breast fillet fried golden and crispy, layered with spicy buffalo sauce, iceberg lettuce, and melted gouda cheese.",
      ingredients: ["Crispy Fried Chicken", "Buffalo Glaze", "Gouda Cheese", "Sesame Bun"],
      sizes: [
        { name: "Regular", priceOffset: 0, default: true },
        { name: "Large Combo (with Fries & Drink)", priceOffset: 350 }
      ],
      extras: [
        { name: "Extra Buffalo Dip", price: 80 },
        { name: "Cheese Slice", price: 100 }
      ],
      isPopular: true,
      isAvailable: true,
      badge: "Hot & Spicy"
    },
    {
      id: "prod_3",
      name: "Chicago Cheesy Stuffed Crust",
      restaurantId: "rest_2",
      restaurantName: "Broadway Crust & Pizza",
      categoryId: "cat_pizza",
      categoryName: "Pizza",
      price: 1550,
      oldPrice: 1850,
      rating: 4.8,
      reviewsCount: 215,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
      description: "Signature mozzarella stuffed crust loaded with smoked pepperoni, smoked chicken tikka chunks, mushrooms, black olives, and herbs.",
      ingredients: ["Mozzarella Cheese", "Smoked Chicken Tikka", "Pepperoni", "Black Olives", "Tomato Herb Sauce"],
      sizes: [
        { name: "Small 8\"", priceOffset: -500 },
        { name: "Medium 10\"", priceOffset: 0, default: true },
        { name: "Large 13\"", priceOffset: 650 }
      ],
      extras: [
        { name: "Extra Mozzarella Topping", price: 200 },
        { name: "Stuffed Sausage Edge", price: 180 },
        { name: "Ranch Dipping Sauce", price: 90 }
      ],
      isPopular: true,
      isAvailable: true,
      badge: "Chef Special"
    },
    {
      id: "prod_4",
      name: "Special Mutton Dum Biryani",
      restaurantId: "rest_3",
      restaurantName: "Student Biryani & Karahi",
      categoryId: "cat_biryani",
      categoryName: "Biryani",
      price: 920,
      oldPrice: 1100,
      rating: 4.9,
      reviewsCount: 340,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
      description: "Fragrant long-grain basmati rice slow-cooked with tender, succulent mutton, saffron aromatics, golden potatoes, served with mint raita.",
      ingredients: ["Tender Mutton", "Basmati Rice", "Saffron", "Spiced Potatoes", "Mint Raita"],
      sizes: [
        { name: "Single Plate", priceOffset: 0, default: true },
        { name: "Double Platter", priceOffset: 700 }
      ],
      extras: [
        { name: "Extra Mint Raita & Salad", price: 80 },
        { name: "Shami Kabab (2 pcs)", price: 160 }
      ],
      isPopular: true,
      isAvailable: true,
      badge: "Top Seller"
    },
    {
      id: "prod_5",
      name: "Chicken Reshmi Kabab Platter",
      restaurantId: "rest_4",
      restaurantName: "Bundu Khan Desi Grill",
      categoryId: "cat_bbq",
      categoryName: "BBQ & Grills",
      price: 1150,
      oldPrice: 1350,
      rating: 4.8,
      reviewsCount: 160,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      description: "Melt-in-mouth minced chicken skewers blended with cashew paste, cream, and gentle royal herbs, charbroiled over real embers with hot rogheni naans.",
      ingredients: ["Chicken Mince", "Cashew Cream", "Fresh Herbs", "Rogheni Naan"],
      sizes: [
        { name: "Half Platter (4 Skewers)", priceOffset: 0, default: true },
        { name: "Full Platter (8 Skewers)", priceOffset: 850 }
      ],
      extras: [
        { name: "Fresh Garlic Naan", price: 120 },
        { name: "Zeera Raita", price: 70 }
      ],
      isPopular: true,
      isAvailable: true,
      badge: "Signature"
    },
    {
      id: "prod_6",
      name: "Szechuan Dragon Crispy Chicken",
      restaurantId: "rest_5",
      restaurantName: "Golden Dragon Wok",
      categoryId: "cat_chinese",
      categoryName: "Chinese",
      price: 980,
      oldPrice: 1150,
      rating: 4.7,
      reviewsCount: 110,
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
      description: "Wok-tossed battered crispy chicken slices in fiery red Szechuan chili glaze with bell peppers, spring onions, and roasted sesame seeds.",
      ingredients: ["Boneless Chicken", "Szechuan Red Chili", "Bell Peppers", "Egg Fried Rice"],
      sizes: [
        { name: "Standard with Rice", priceOffset: 0, default: true },
        { name: "Family Portion with Noodles", priceOffset: 600 }
      ],
      extras: [
        { name: "Vegetable Spring Rolls (4 pcs)", price: 250 },
        { name: "Hot & Sour Soup Bowl", price: 280 }
      ],
      isPopular: false,
      isAvailable: true,
      badge: "Spicy"
    },
    {
      id: "prod_7",
      name: "Belgian Molten Chocolate Lava",
      restaurantId: "rest_6",
      restaurantName: "Sweet Tooth Desserts",
      categoryId: "cat_desserts",
      categoryName: "Desserts",
      price: 650,
      oldPrice: 750,
      rating: 4.9,
      reviewsCount: 220,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
      description: "Warm dark Belgian chocolate cake with a molten oozing truffle center, dusted with icing sugar and served with french vanilla gelato.",
      ingredients: ["Dark Belgian Chocolate", "French Vanilla Gelato", "Fresh Cream"],
      sizes: [
        { name: "Single Serving", priceOffset: 0, default: true },
        { name: "Double Delight with 2 Gelato Scoops", priceOffset: 350 }
      ],
      extras: [
        { name: "Extra Chocolate Fudge Sauce", price: 90 },
        { name: "Crushed Walnuts", price: 100 }
      ],
      isPopular: true,
      isAvailable: true,
      badge: "Sweetest Pick"
    },
    {
      id: "prod_8",
      name: "Mint Lemonade Sparkler",
      restaurantId: "rest_1",
      restaurantName: "Burger Lab Gourmet",
      categoryId: "cat_drinks",
      categoryName: "Drinks",
      price: 280,
      oldPrice: 320,
      rating: 4.7,
      reviewsCount: 85,
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
      description: "Refreshing crushed garden mint, freshly squeezed key lemons, black salt, and sparkling soda served ice cold.",
      ingredients: ["Garden Mint", "Fresh Lemon", "Sparkling Soda", "Crushed Ice"],
      sizes: [
        { name: "Medium 350ml", priceOffset: 0, default: true },
        { name: "Large 500ml", priceOffset: 90 }
      ],
      extras: [],
      isPopular: true,
      isAvailable: true,
      badge: "Refreshing"
    }
  ],

  // Promotional Discount Coupons
  coupons: [
    {
      code: "FOODORA50",
      discountType: "percent",
      discountValue: 50,
      maxDiscount: 400,
      minOrder: 800,
      expiresAt: "2026-12-31",
      description: "50% OFF up to Rs. 400 on your favorite meals"
    },
    {
      code: "FREEDEL",
      discountType: "free_delivery",
      discountValue: 0,
      minOrder: 500,
      expiresAt: "2026-12-31",
      description: "Free Delivery on orders above Rs. 500"
    },
    {
      code: "WELCOME100",
      discountType: "fixed",
      discountValue: 100,
      minOrder: 400,
      expiresAt: "2026-12-31",
      description: "Rs. 100 Flat discount on your first order"
    },
    {
      code: "SUPERWEEKEND",
      discountType: "percent",
      discountValue: 25,
      maxDiscount: 600,
      minOrder: 1000,
      expiresAt: "2026-12-31",
      description: "25% OFF Weekend Mega Feast!"
    }
  ],

  // Initial Sample Orders for Tracking & Customer History
  orders: [
    {
      id: "ORD-84920",
      date: "2026-11-15T16:20:00Z",
      restaurantId: "rest_1",
      restaurantName: "Burger Lab Gourmet",
      items: [
        {
          id: "prod_1",
          name: "Dynamite Double Cheese Smash",
          quantity: 2,
          price: 850,
          size: "Double Patty (Standard)",
          extras: ["Extra Cheddar Cheese Slice"]
        },
        {
          id: "prod_8",
          name: "Mint Lemonade Sparkler",
          quantity: 2,
          price: 280,
          size: "Medium 350ml",
          extras: []
        }
      ],
      subtotal: 2380,
      deliveryFee: 150,
      discount: 400,
      couponCode: "FOODORA50",
      total: 2130,
      status: "out_for_delivery", // placed, confirmed, preparing, ready, out_for_delivery, delivered, cancelled
      statusHistory: [
        { status: "placed", time: "16:20", text: "Order Placed Successfully" },
        { status: "confirmed", time: "16:23", text: "Restaurant Confirmed Order" },
        { status: "preparing", time: "16:30", text: "Kitchen is preparing your food" },
        { status: "ready", time: "16:45", text: "Order packed and waiting for rider" },
        { status: "out_for_delivery", time: "16:50", text: "Rider Bilal is on the way!" }
      ],
      customer: {
        name: "Hamza Sheikh",
        phone: "+92 300 1234567",
        address: "House # 42, Street 8, Phase 5, DHA, Lahore",
        instructions: "Please ring the bell twice and leave at the doorstep."
      },
      payment: {
        method: "JazzCash",
        status: "Paid"
      },
      rider: {
        name: "Bilal Ahmed",
        phone: "+92 333 4455667",
        rating: 4.9,
        bike: "Honda CD-70 (LEB-4921)"
      },
      estimatedDelivery: "15-20 min"
    },
    {
      id: "ORD-71203",
      date: "2026-11-12T20:15:00Z",
      restaurantId: "rest_2",
      restaurantName: "Broadway Crust & Pizza",
      items: [
        {
          id: "prod_3",
          name: "Chicago Cheesy Stuffed Crust",
          quantity: 1,
          price: 1550,
          size: "Medium 10\"",
          extras: ["Extra Mozzarella Topping"]
        }
      ],
      subtotal: 1750,
      deliveryFee: 120,
      discount: 100,
      couponCode: "WELCOME100",
      total: 1770,
      status: "delivered",
      statusHistory: [
        { status: "placed", time: "20:15", text: "Order Placed" },
        { status: "confirmed", time: "20:17", text: "Confirmed" },
        { status: "preparing", time: "20:25", text: "In Oven" },
        { status: "ready", time: "20:42", text: "Packed" },
        { status: "out_for_delivery", time: "20:45", text: "Dispatched" },
        { status: "delivered", time: "21:05", text: "Delivered to Customer" }
      ],
      customer: {
        name: "Hamza Sheikh",
        phone: "+92 300 1234567",
        address: "House # 42, Street 8, Phase 5, DHA, Lahore"
      },
      payment: {
        method: "Cash on Delivery",
        status: "Collected (Rs. 1,770)"
      }
    }
  ],

  // Platform Notifications
  notifications: [
    {
      id: "notif_1",
      title: "Order Dispatched!",
      message: "Order #ORD-84920 is out for delivery with rider Bilal Ahmed.",
      time: "10 mins ago",
      type: "order",
      isRead: false
    },
    {
      id: "notif_2",
      title: "Super Weekend Deals Live! 🎉",
      message: "Enjoy up to 50% discount with promo code FOODORA50.",
      time: "2 hours ago",
      type: "promo",
      isRead: false
    },
    {
      id: "notif_3",
      title: "Welcome to Foodora SaaS",
      message: "Welcome to Foodora SaaS! Your customer account has been credited with 450 loyalty points.",
      time: "1 day ago",
      type: "system",
      isRead: true
    }
  ]
};
