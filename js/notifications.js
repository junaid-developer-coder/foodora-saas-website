/**
 * ==========================================================================
 * FOODORA SAAS - NOTIFICATIONS CONTROLLER (js/notifications.js)
 * Notification center, mark as read, and status alert feeds.
 * ==========================================================================
 */

const Notifications = {
  init() {
    this.renderNotificationsList();
  },

  renderNotificationsList() {
    const container = document.getElementById("notificationsListContainer");
    if (!container) return;

    let activeType = "all";
    const notifs = StorageManager.getNotifications();

    const render = () => {
      let filtered = [...notifs];
      if (activeType !== "all") {
        filtered = filtered.filter(n => n.type === activeType);
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔔</div>
            <h3 class="empty-state-title">No Notifications</h3>
            <p class="empty-state-text">You are all caught up! Order alerts and promotional offers will show up here.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(n => `
        <div class="card p-4 mb-3 flex items-start justify-between gap-4 ${n.isRead ? '' : 'border-primary'}" style="${n.isRead ? '' : 'background: var(--primary-soft);'}">
          <div class="flex items-start gap-3">
            <div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; background: var(--bg-surface-secondary); flex-shrink: 0;">
              ${n.type === 'order' ? '🛵' : (n.type === 'promo' ? '🎉' : '📢')}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold">${Validation.escapeHtml(n.title)}</h4>
                ${!n.isRead ? '<span class="badge badge-orange">New</span>' : ''}
              </div>
              <p class="text-xs text-secondary mt-1">${Validation.escapeHtml(n.message)}</p>
              <span class="text-xs text-muted block mt-2">⏱ ${n.time}</span>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="Notifications.deleteNotification('${n.id}')" title="Dismiss">
            &times;
          </button>
        </div>
      `).join("");
    };

    // Filter tabs
    const tabs = document.querySelectorAll(".notif-filter-tab");
    tabs.forEach(t => {
      t.addEventListener("click", () => {
        tabs.forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        activeType = t.getAttribute("data-type");
        render();
      });
    });

    // Mark all as read button
    const markReadBtn = document.getElementById("markAllReadBtn");
    if (markReadBtn) {
      markReadBtn.addEventListener("click", () => {
        StorageManager.markNotificationsAsRead();
        FoodoraApp.showToast("All notifications marked as read.", "success");
        render();
      });
    }

    render();
  },

  deleteNotification(id) {
    let list = StorageManager.getNotifications();
    list = list.filter(n => n.id !== id);
    StorageManager.saveNotifications(list);
    FoodoraApp.showToast("Notification dismissed.", "info");
    this.renderNotificationsList();
  }
};
