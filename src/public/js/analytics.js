(function () {
  const chart = document.getElementById("analytics-bars");
  const ranges = {
    year: [52, 78, 61, 88, 47, 72, 66, 92, 58, 74, 84, 63],
    month: [42, 88, 55, 72, 51, 58, 81, 38, 62, 91, 69, 46, 53, 71, 77, 56, 83, 44, 39, 87, 48, 64, 79, 57],
    week: [58, 74, 46, 91, 68, 82, 61],
  };

  function renderBars(range) {
    if (!chart) return;
    chart.innerHTML = ranges[range].map(function (value, index) {
      return `<div class="bar_group"><i style="height:${value}%"></i><span>${index + 1}</span></div>`;
    }).join("");
  }

  document.querySelectorAll("[data-range]").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll("[data-range]").forEach((item) => item.classList.remove("is_active"));
      button.classList.add("is_active");
      renderBars(button.dataset.range);
    });
  });
  renderBars("month");

  const views = {
    live: { total: 447, daily: "224", weekly: "1.4K", monthly: "22.1K" },
    day: { total: 3821, daily: "3.8K", weekly: "18.7K", monthly: "71.4K" },
    week: { total: 18470, daily: "2.6K", weekly: "18.5K", monthly: "74.2K" },
  };
  const viewLabels = {
    en: { live: "Live visitors", day: "Visitors today", week: "Visitors this week" },
    ko: { live: "실시간 방문자", day: "오늘 방문자", week: "이번 주 방문자" },
    uz: { live: "Jonli tashrifchilar", day: "Bugungi tashrifchilar", week: "Haftalik tashrifchilar" },
  };
  let activeView = "live";
  const total = document.getElementById("active-total");
  const label = document.getElementById("active-label");
  const daily = document.getElementById("active-daily");
  const weekly = document.getElementById("active-weekly");
  const monthly = document.getElementById("active-monthly");

  function showView(view) {
    activeView = view;
    const data = views[view];
    const language = document.documentElement.lang || "en";
    total.textContent = data.total.toLocaleString(); label.textContent = (viewLabels[language] || viewLabels.en)[view];
    daily.textContent = data.daily; weekly.textContent = data.weekly; monthly.textContent = data.monthly;
  }
  document.querySelectorAll("[data-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll("[data-view]").forEach((item) => item.classList.remove("is_active"));
      document.querySelectorAll("[data-view]").forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.classList.add("is_active"); button.setAttribute("aria-pressed", "true"); showView(button.dataset.view);
    });
  });
  window.setInterval(function () {
    if (activeView !== "live") return;
    views.live.total = Math.max(420, Math.min(490, views.live.total + Math.floor(Math.random() * 9) - 4));
    total.textContent = views.live.total.toLocaleString();
  }, 2200);
  document.addEventListener("techanor:languagechange", function () { showView(activeView); });

  const orderFilter = document.getElementById("order-filter");
  const filterStates = ["all", "complete", "pending", "canceled"];
  let filterIndex = 0;
  const filterLabels = {
    en: { all: "All", complete: "Completed", pending: "Pending", canceled: "Canceled", prefix: "Filter" },
    ko: { all: "전체", complete: "완료", pending: "대기", canceled: "취소", prefix: "필터" },
    uz: { all: "Barchasi", complete: "Bajarildi", pending: "Kutilmoqda", canceled: "Bekor qilindi", prefix: "Filtr" },
  };
  function applyOrderFilter() {
    if (!orderFilter) return;
    const state = filterStates[filterIndex];
    document.querySelectorAll("[data-order-status]").forEach(function (row) {
      row.dataset.filterHidden = String(state !== "all" && row.dataset.orderStatus !== state);
      const language = document.documentElement.lang || "en";
      const query = document.getElementById("product-search")?.value.trim().toLocaleLowerCase(language) || "";
      const searchableText = `${row.dataset.search || ""} ${row.textContent || ""}`.replace(/\s+/g, " ").toLocaleLowerCase(language);
      row.hidden = row.dataset.filterHidden === "true" || Boolean(query && !searchableText.includes(query));
    });
    const language = document.documentElement.lang || "en";
    const copy = filterLabels[language] || filterLabels.en;
    orderFilter.textContent = `☷ ${copy.prefix}: ${copy[state]}`;
  }
  orderFilter?.addEventListener("click", function () { filterIndex = (filterIndex + 1) % filterStates.length; applyOrderFilter(); });
  document.addEventListener("techanor:languagechange", applyOrderFilter);
  showView(activeView);
  applyOrderFilter();
})();
