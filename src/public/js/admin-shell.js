/* Shared behavior for every Techanor admin page. */

(function () {
  "use strict";

  const ROUTES = {
    home: "/admin",
    dashboard: "/admin",
    product: "/admin/product/all",
    analytics: "/admin/analytics",
    marketing: "/admin/marketing",
    user: "/admin/user/all",
    blog: "/admin/blog/all",
  };

  function initSidebar() {
    const toggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("admin-sidebar");
    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", function () {
      const isOpen = sidebar.classList.toggle("is_open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initTheme() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    function syncControl() {
      const isDark = document.documentElement.dataset.theme === "dark";
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode",
      );
    }

    syncControl();
    toggle.addEventListener("click", function () {
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("techanor-admin-theme", nextTheme);
      syncControl();
    });
  }

  function initGlobalSearch() {
    const input = document.querySelector(".global_search input");
    if (!input) return;

    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      const query = input.value.trim().toLowerCase();
      const route = Object.entries(ROUTES).find(([keyword]) =>
        query.includes(keyword),
      );
      if (route) window.location.assign(route[1]);
    });
  }

  function initComingSoon() {
    document.querySelectorAll("[data-coming-soon]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        const feature = trigger.dataset.comingSoon || "AI";
        const overlay = document.createElement("div");
        overlay.className = "coming_soon_overlay";
        overlay.innerHTML = `
          <section class="coming_soon_card" role="dialog" aria-modal="true" aria-labelledby="coming-soon-title">
            <span aria-hidden="true">AI</span>
            <h2 id="coming-soon-title">${feature} is coming soon</h2>
            <p>We are building a smarter Techanor experience. This feature will be available in a future update.</p>
            <button type="button">Got it</button>
          </section>`;
        document.body.appendChild(overlay);

        const close = function () {
          overlay.remove();
          document.removeEventListener("keydown", closeOnEscape);
          trigger.focus();
        };
        const closeOnEscape = function (event) {
          if (event.key === "Escape") close();
        };

        overlay.querySelector("button").addEventListener("click", close);
        overlay.addEventListener("click", function (event) {
          if (event.target === overlay) close();
        });
        document.addEventListener("keydown", closeOnEscape);
        overlay.querySelector("button").focus();
      });
    });
  }

  window.addEventListener("load", function () {
    initSidebar();
    initTheme();
    initGlobalSearch();
    initComingSoon();
  });
})();
