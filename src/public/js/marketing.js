(function () {
  const trafficData = {
    today: {
      subscribers: { value: "567K", trend: "+3.85%", direction: "up", bar: 78 },
      conversion: { value: "27.6%", trend: "−5.39%", direction: "down", bar: 58 },
    },
    week: {
      subscribers: { value: "3.9M", trend: "+8.24%", direction: "up", bar: 86 },
      conversion: { value: "29.8%", trend: "+2.17%", direction: "up", bar: 67 },
    },
    month: {
      subscribers: { value: "16.8M", trend: "+12.74%", direction: "up", bar: 92 },
      conversion: { value: "31.4%", trend: "+6.31%", direction: "up", bar: 74 },
    },
  };
  const comparisonCopy = {
    en: { today: "than yesterday", week: "than last week", month: "than last month" },
    ko: { today: "어제 대비", week: "지난주 대비", month: "지난달 대비" },
    uz: { today: "kechagiga nisbatan", week: "o‘tgan haftaga nisbatan", month: "o‘tgan oyga nisbatan" },
  };
  const chartCopy = {
    en: {
      impressions: "Impressions",
      engagement: "Engagement",
      aria: "Marketing traffic chart. Use the left and right arrow keys to inspect monthly values.",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    },
    ko: {
      impressions: "노출",
      engagement: "참여",
      aria: "마케팅 트래픽 차트입니다. 왼쪽과 오른쪽 화살표 키로 월별 값을 확인하세요.",
      months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월"],
    },
    uz: {
      impressions: "Ko‘rishlar",
      engagement: "Faollik",
      aria: "Marketing trafik grafigi. Oylik qiymatlarni ko‘rish uchun chap va o‘ng tugmalardan foydalaning.",
      months: ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg"],
    },
  };
  const logoutCopy = {
    en: "Do you want to log out?",
    ko: "로그아웃하시겠습니까?",
    uz: "Tizimdan chiqmoqchimisiz?",
  };
  let activePeriod = "today";
  let activeChartIndex = null;

  const chartData = [
    { date: "Jan", x: 45, primary: 205, secondary: 232, impressions: "1.2M", engagement: "420K", total: "$4,120", trend: "+1.8%" },
    { date: "Feb", x: 145, primary: 158, secondary: 222, impressions: "1.8M", engagement: "510K", total: "$5,340", trend: "+3.2%" },
    { date: "Mar", x: 245, primary: 192, secondary: 228, impressions: "1.5M", engagement: "470K", total: "$5,080", trend: "+2.1%" },
    { date: "Apr", x: 345, primary: 145, secondary: 198, impressions: "2.3M", engagement: "680K", total: "$6,720", trend: "+4.7%" },
    { date: "May", x: 445, primary: 126, secondary: 178, impressions: "2.8M", engagement: "790K", total: "$7,480", trend: "+5.4%" },
    { date: "Jun", x: 545, primary: 88, secondary: 150, impressions: "3.6M", engagement: "1.1M", total: "$8,260", trend: "+6.3%" },
    { date: "Jul", x: 645, primary: 74, secondary: 124, impressions: "4.1M", engagement: "1.4M", total: "$9,020", trend: "+7.1%" },
    { date: "Aug", x: 740, primary: 55, secondary: 105, impressions: "4.8M", engagement: "1.7M", total: "$9,758", trend: "+7.96%" },
  ];

  function updateMetric(prefix, metric, comparison) {
    const value = document.getElementById(`${prefix}-value`);
    const trend = document.getElementById(`${prefix}-trend`);
    const bar = document.getElementById(`${prefix}-bar`);
    if (!value || !trend || !bar) return;
    value.textContent = metric.value;
    trend.className = `trend_text ${metric.direction}`;
    trend.innerHTML = `${metric.trend} <small>${comparison}</small>`;
    bar.style.width = `${metric.bar}%`;
  }

  function showTrafficPeriod(period) {
    const data = trafficData[period];
    if (!data) return;
    activePeriod = period;
    document.querySelectorAll("[data-traffic-period]").forEach(function (button) {
      const isActive = button.dataset.trafficPeriod === period;
      button.classList.toggle("is_active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    const language = document.documentElement.lang || "en";
    const comparison = (comparisonCopy[language] || comparisonCopy.en)[period];
    updateMetric("subscriber", data.subscribers, comparison);
    updateMetric("conversion", data.conversion, comparison);
  }

  document.querySelectorAll("[data-traffic-period]").forEach(function (button) {
    button.addEventListener("click", function () { showTrafficPeriod(button.dataset.trafficPeriod); });
  });
  document.addEventListener("techanor:languagechange", function () {
    showTrafficPeriod(activePeriod);
    updateChartLanguage();
    if (activeChartIndex !== null) showChartPoint(activeChartIndex);
  });
  showTrafficPeriod(activePeriod);

  const chart = document.querySelector(".traffic_chart");
  const chartCard = document.querySelector(".traffic_chart_card");
  const cursorLine = document.getElementById("traffic-cursor-line");
  const primaryPoint = document.getElementById("traffic-primary-point");
  const secondaryPoint = document.getElementById("traffic-secondary-point");
  const tooltip = document.getElementById("traffic-tooltip");
  const chartTotal = document.getElementById("traffic-chart-total");
  const chartTrend = document.getElementById("traffic-chart-trend");

  function getChartLanguage() {
    return chartCopy[document.documentElement.lang] || chartCopy.en;
  }

  function updateChartLanguage() {
    if (chart) chart.setAttribute("aria-label", getChartLanguage().aria);
  }

  function showChartPoint(index) {
    if (!chart || !chartCard || !tooltip || !cursorLine || !primaryPoint || !secondaryPoint) return;
    const point = chartData[index];
    if (!point) return;
    activeChartIndex = index;
    const copy = getChartLanguage();
    cursorLine.setAttribute("x1", String(point.x));
    cursorLine.setAttribute("x2", String(point.x));
    primaryPoint.setAttribute("cx", String(point.x));
    primaryPoint.setAttribute("cy", String(point.primary));
    secondaryPoint.setAttribute("cx", String(point.x));
    secondaryPoint.setAttribute("cy", String(point.secondary));
    tooltip.innerHTML = `<strong>${copy.months[index]} 2026</strong><span><i></i>${copy.impressions}: ${point.impressions}</span><span><i></i>${copy.engagement}: ${point.engagement}</span>`;
    const chartRect = chart.getBoundingClientRect();
    const cardRect = chartCard.getBoundingClientRect();
    tooltip.style.left = `${chartRect.left - cardRect.left + (point.x / 760) * chartRect.width}px`;
    tooltip.style.top = `${chartRect.top - cardRect.top + (point.primary / 280) * chartRect.height - 10}px`;
    tooltip.classList.add("is_visible");
    chartCard.classList.add("is_tracking");
    if (chartTotal) chartTotal.textContent = point.total;
    if (chartTrend) chartTrend.textContent = point.trend;
  }

  function resetChart() {
    activeChartIndex = null;
    tooltip?.classList.remove("is_visible");
    chartCard?.classList.remove("is_tracking");
    if (chartTotal) chartTotal.textContent = "$9,758.00";
    if (chartTrend) chartTrend.textContent = "+7.96%";
  }

  function trackChart(event) {
    if (!chart) return;
    const rect = chart.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const svgX = (relativeX / rect.width) * 760;
    const index = chartData.reduce(function (closestIndex, point, pointIndex) {
      return Math.abs(point.x - svgX) < Math.abs(chartData[closestIndex].x - svgX) ? pointIndex : closestIndex;
    }, 0);
    showChartPoint(index);
  }
  chart?.addEventListener("pointermove", trackChart);
  chart?.addEventListener("pointerleave", resetChart);
  chart?.addEventListener("focus", function () {
    showChartPoint(activeChartIndex ?? chartData.length - 1);
  });
  chart?.addEventListener("blur", resetChart);
  chart?.addEventListener("keydown", function (event) {
    const keyDirections = { ArrowLeft: -1, ArrowRight: 1 };
    if (!(event.key in keyDirections) && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    let nextIndex = activeChartIndex ?? chartData.length - 1;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = chartData.length - 1;
    else nextIndex = Math.max(0, Math.min(chartData.length - 1, nextIndex + keyDirections[event.key]));
    showChartPoint(nextIndex);
  });

  const campaignSearch = document.getElementById("product-search");
  const campaignEmpty = document.getElementById("campaign-search-empty");
  function updateCampaignEmptyState() {
    if (!campaignSearch || !campaignEmpty) return;
    const rows = Array.from(document.querySelectorAll(".campaign_row[data-search-row]"));
    campaignEmpty.hidden = !campaignSearch.value.trim() || rows.some(function (row) { return !row.hidden; });
  }
  campaignSearch?.addEventListener("input", function () {
    window.setTimeout(updateCampaignEmptyState, 0);
  });
  document.querySelector(".sidebar_logout")?.addEventListener("click", function (event) {
    const message = logoutCopy[document.documentElement.lang] || logoutCopy.en;
    if (!window.confirm(message)) event.preventDefault();
  });
  updateChartLanguage();
})();
