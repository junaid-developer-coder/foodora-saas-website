/**
 * ==========================================================================
 * FOODORA SAAS - AUTHENTICATION MODULE (js/auth.js)
 * Full Customer & Partner Authentication, Session Management, Registration,
 * Password Validation, and Route Redirection.
 * ==========================================================================
 */

const Auth = {
  init() {
    this.setupLoginForm();
    this.setupRegisterForm();
    this.setupForgotForm();
    this.setupPasswordToggles();
  },

  /**
   * Returns currently logged-in user or null
   */
  getCurrentUser() {
    return StorageManager.getCurrentUser();
  },

  /**
   * Checks if user is authenticated
   */
  isAuthenticated() {
    return !!StorageManager.getCurrentUser();
  },

  /**
   * Programmatic customer login with credential checking
   */
  loginCustomer(email, password) {
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }
    const cleanEmail = email.trim().toLowerCase();
    const users = StorageManager.getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      return { success: false, message: "No account found with this email." };
    }
    if (matchedUser.password && matchedUser.password !== password) {
      return { success: false, message: "Incorrect password." };
    }

    StorageManager.setCurrentUser(matchedUser);
    return { success: true, user: matchedUser, message: `Welcome back, ${matchedUser.name}!` };
  },

  /**
   * Programmatic user login with role validation
   */
  login(email, password, requiredRole = null) {
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }
    const cleanEmail = email.trim().toLowerCase();
    const users = StorageManager.getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      return { success: false, message: "No account found with this email." };
    }
    if (requiredRole && matchedUser.role !== requiredRole) {
      return { success: false, message: `Access denied. Account is not a ${requiredRole}.` };
    }
    if (matchedUser.password && matchedUser.password !== password) {
      return { success: false, message: "Incorrect password." };
    }

    StorageManager.setCurrentUser(matchedUser);
    return { success: true, user: matchedUser, message: "Login successful." };
  },

  /**
   * Programmatic customer registration
   */
  registerCustomer(userData) {
    const { name, email, password, phone } = userData;
    if (!name || !email || !password) {
      return { success: false, message: "Name, email, and password are required." };
    }
    const cleanEmail = email.trim().toLowerCase();
    const users = StorageManager.getUsers();
    const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, field: "email", message: "An account with this email address already exists." };
    }

    const newUser = {
      id: "usr_" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: (phone || "").trim(),
      password: password,
      role: "customer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      addresses: [],
      points: 200
    };

    StorageManager.saveUser(newUser);
    StorageManager.setCurrentUser(newUser);
    return { success: true, user: newUser, message: "Account created successfully." };
  },

  /**
   * Handles Login form submission
   */
  setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const emailEl = document.getElementById("email");
      const passEl = document.getElementById("password");
      const submitBtn = form.querySelector("button[type='submit']");

      Validation.clearError(emailEl);
      Validation.clearError(passEl);

      const email = emailEl.value.trim().toLowerCase();
      const password = passEl.value;

      let hasError = false;
      if (!Validation.isValidEmail(email)) {
        Validation.showError(emailEl, "Please enter a valid email address.");
        hasError = true;
      }
      if (!password) {
        Validation.showError(passEl, "Password is required.");
        hasError = true;
      }

      if (hasError) return;

      // Visual loading indicator
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.classList.add("disabled");
      submitBtn.innerHTML = `<span class="animate-spin">↻</span> Signing In...`;

      setTimeout(() => {
        const users = StorageManager.getUsers();
        const matchedUser = users.find(u => u.email.toLowerCase() === email);

        if (!matchedUser) {
          Validation.showError(emailEl, "No account found with this email. Please check your spelling or sign up.");
          submitBtn.classList.remove("disabled");
          submitBtn.innerHTML = originalBtnText;
          return;
        }

        // Verify password
        if (matchedUser.password && matchedUser.password !== password) {
          Validation.showError(passEl, "Incorrect password. Please try again.");
          submitBtn.classList.remove("disabled");
          submitBtn.innerHTML = originalBtnText;
          return;
        }

        // Set active session
        StorageManager.setCurrentUser(matchedUser);

        if (window.FoodoraApp) {
          window.FoodoraApp.showToast(`Welcome back, ${matchedUser.name}!`, "success");
        }

        // Determine destination based on user role and query parameters
        setTimeout(() => {
          const basePath = window.location.pathname.includes("/dashboard/") ? "../" : "./";
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get("redirect");

          if (matchedUser.role === "admin") {
            window.location.href = basePath.includes("pages") ? "../dashboard/admin/index.html" : "dashboard/admin/index.html";
          } else if (matchedUser.role === "owner") {
            window.location.href = basePath.includes("pages") ? "../dashboard/owner/index.html" : "dashboard/owner/index.html";
          } else {
            // Customer default: redirect to specified destination, cart, or customer dashboard
            if (redirectUrl) {
              window.location.href = redirectUrl;
            } else {
              window.location.href = basePath.includes("pages") ? "../dashboard/customer/index.html" : "dashboard/customer/index.html";
            }
          }
        }, 500);
      }, 600);
    });
  },

  /**
   * Handles Customer Registration form submission
   */
  setupRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameEl = document.getElementById("fullname");
      const emailEl = document.getElementById("email");
      const phoneEl = document.getElementById("phone");
      const passEl = document.getElementById("password");
      const confirmPassEl = document.getElementById("confirmPassword");
      const termsEl = document.getElementById("termsAgree");
      const submitBtn = form.querySelector("button[type='submit']");

      [nameEl, emailEl, phoneEl, passEl, confirmPassEl].forEach(Validation.clearError);

      let hasError = false;
      if (!Validation.isNotEmpty(nameEl.value)) {
        Validation.showError(nameEl, "Full name is required.");
        hasError = true;
      }
      if (!Validation.isValidEmail(emailEl.value)) {
        Validation.showError(emailEl, "Please enter a valid email address.");
        hasError = true;
      }
      if (!Validation.isValidPhone(phoneEl.value)) {
        Validation.showError(phoneEl, "Please enter a valid phone number (e.g. 0300 1234567).");
        hasError = true;
      }
      if (!Validation.isValidPassword(passEl.value)) {
        Validation.showError(passEl, "Password must be at least 6 characters.");
        hasError = true;
      }
      if (passEl.value !== confirmPassEl.value) {
        Validation.showError(confirmPassEl, "Passwords do not match.");
        hasError = true;
      }
      if (termsEl && !termsEl.checked) {
        if (window.FoodoraApp) {
          window.FoodoraApp.showToast("Please agree to the Terms & Conditions.", "error");
        }
        hasError = true;
      }

      if (hasError) return;

      const email = emailEl.value.trim().toLowerCase();
      const users = StorageManager.getUsers();

      // Check for existing account
      const existingUser = users.find(u => u.email.toLowerCase() === email);
      if (existingUser) {
        Validation.showError(emailEl, "An account with this email address already exists. Please sign in instead.");
        return;
      }

      const originalBtnText = submitBtn.innerHTML;
      submitBtn.classList.add("disabled");
      submitBtn.innerHTML = `<span class="animate-spin">↻</span> Creating Account...`;

      setTimeout(() => {
        const newUser = {
          id: "usr_" + Date.now(),
          name: nameEl.value.trim(),
          email: email,
          phone: phoneEl.value.trim(),
          password: passEl.value,
          role: "customer",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          addresses: [],
          points: 200 // Welcome loyalty reward
        };

        StorageManager.saveUser(newUser);
        StorageManager.setCurrentUser(newUser);

        if (window.FoodoraApp) {
          window.FoodoraApp.showToast(`Account created successfully! Welcome to Foodora, ${newUser.name}.`, "success");
        }

        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get("redirect");
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = "dashboard/customer/index.html";
          }
        }, 600);
      }, 700);
    });
  },

  /**
   * Handles Password Reset request
   */
  setupForgotForm() {
    const form = document.getElementById("forgotPasswordForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailEl = document.getElementById("resetEmail");
      Validation.clearError(emailEl);

      const email = emailEl.value.trim().toLowerCase();
      if (!Validation.isValidEmail(email)) {
        Validation.showError(emailEl, "Please enter a valid email address.");
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.classList.add("disabled");
      submitBtn.innerHTML = `<span class="animate-spin">↻</span> Sending Reset Link...`;

      setTimeout(() => {
        const resetBox = document.getElementById("resetSuccessBox");
        if (resetBox) {
          form.style.display = "none";
          resetBox.style.display = "block";
        }
        if (window.FoodoraApp) {
          window.FoodoraApp.showToast("Password reset link has been dispatched to your email address.", "success");
        }
      }, 600);
    });
  },

  /**
   * Password Show / Hide toggle
   */
  setupPasswordToggles() {
    const toggles = document.querySelectorAll(".pwd-toggle");
    toggles.forEach(btn => {
      btn.addEventListener("click", () => {
        const input = btn.previousElementSibling;
        if (!input) return;
        if (input.type === "password") {
          input.type = "text";
          btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
          input.type = "password";
          btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
      });
    });
  },

  /**
   * Customer / Partner Sign Out
   */
  logout() {
    StorageManager.logoutUser();
    if (window.FoodoraApp) {
      window.FoodoraApp.showToast("You have been signed out successfully.", "info");
    }
    setTimeout(() => {
      const isDashboard = window.location.pathname.includes("/dashboard/");
      const isPages = window.location.pathname.includes("/pages/");
      if (isDashboard) {
        window.location.href = "../../index.html";
      } else if (isPages) {
        window.location.href = "../index.html";
      } else {
        window.location.href = "index.html";
      }
    }, 400);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Auth.init();
});
