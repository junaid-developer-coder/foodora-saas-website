/**
 * ==========================================================================
 * FOODORA SAAS - VALIDATION & SANITIZATION (js/validation.js)
 * Form checks and XSS safe encoding.
 * ==========================================================================
 */

const Validation = {
  isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  isValidPhone(phone) {
    if (!phone) return false;
    // Basic phone check (allowing +, spaces, digits, dashes, length >= 7)
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(String(phone).trim());
  },

  isValidPassword(password) {
    return password && password.length >= 6;
  },

  isNotEmpty(val) {
    return val !== null && val !== undefined && String(val).trim().length > 0;
  },

  /**
   * Prevents XSS attacks by escaping unsafe HTML characters.
   */
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  showError(inputElement, message) {
    if (!inputElement) return;
    inputElement.classList.add("input-error");
    const parent = inputElement.closest(".form-group");
    if (parent) {
      let errEl = parent.querySelector(".form-error");
      if (!errEl) {
        errEl = document.createElement("div");
        errEl.className = "form-error show";
        parent.appendChild(errEl);
      }
      errEl.textContent = message;
      errEl.classList.add("show");
    }
  },

  clearError(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove("input-error");
    const parent = inputElement.closest(".form-group");
    if (parent) {
      const errEl = parent.querySelector(".form-error");
      if (errEl) {
        errEl.textContent = "";
        errEl.classList.remove("show");
      }
    }
  }
};
