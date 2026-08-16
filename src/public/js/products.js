/* Techanor admin product management */

$(function () {
  const productForm = $("#product-form");
  const processButton = $("#process-btn");

  processButton.on("click", function () {
    productForm.slideDown(350, function () {
      document.getElementById("product-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    processButton.prop("disabled", true);
  });

  $("#cancel-btn").on("click", function () {
    productForm.slideUp(250);
    processButton.prop("disabled", false);
  });

  $("#reset-btn").on("click", function () {
    window.setTimeout(resetImagePreviews, 0);
  });

  $(".new-product-status").on("change", async function (event) {
    const statusSelect = $(event.currentTarget);
    const productId = statusSelect.data("product-id");
    const productStatus = statusSelect.val();

    try {
      const response = await axios.post(`/admin/product/${productId}`, {
        productStatus,
      });

      if (!response.data.data) throw new Error("Product update failed");
      statusSelect.blur();
    } catch (error) {
      console.error("Error, updateProductStatus:", error);
      alert("Product update failed!");
      window.location.reload();
    }
  });

  $("input[name='productImages']").on("change", function (event) {
    previewProductImage(event.currentTarget);
  });

  productForm.on("submit", function (event) {
    if (!event.currentTarget.checkValidity()) {
      event.preventDefault();
      event.currentTarget.reportValidity();
    }
  });

  initializeProductSearch();
  initializeLanguagePicker();
  initializeSidebar();
  initializeThemeToggle();
  initializeComingSoon();
});

const productTranslations = {
  en: {
    general: "GENERAL", home: "Home", products: "Products", marketing: "Marketing", users: "Users",
    blogs: "Blogs", logout: "Logout", systemOnline: "SYSTEM ONLINE",
    search: "Search products...", catalog: "STORE CATALOG",
    productManagement: "Product Management",
    productSubtitle: "Manage your Techanor products, stock and availability.",
    addProduct: "Add Product", productList: "Product List",
    totalProducts: "Total products", number: "No.", product: "Product",
    category: "Category", brand: "Brand", condition: "Condition", price: "Price",
    stock: "Stock", status: "Status", emptyProducts: "No products have been added yet.",
  },
  ko: {
    general: "일반", home: "홈", products: "제품", marketing: "마케팅", users: "사용자",
    blogs: "블로그", logout: "로그아웃", systemOnline: "시스템 온라인",
    search: "제품 검색...", catalog: "스토어 카탈로그",
    productManagement: "제품 관리",
    productSubtitle: "Techanor 제품, 재고 및 판매 상태를 관리하세요.",
    addProduct: "제품 추가", productList: "제품 목록",
    totalProducts: "전체 제품", number: "번호", product: "제품",
    category: "카테고리", brand: "브랜드", condition: "상태", price: "가격",
    stock: "재고", status: "판매 상태", emptyProducts: "등록된 제품이 없습니다.",
  },
  uz: {
    general: "ASOSIY", home: "Bosh sahifa", products: "Mahsulotlar", marketing: "Marketing", users: "Foydalanuvchilar",
    blogs: "Bloglar", logout: "Chiqish", systemOnline: "TIZIM ISHLAMOQDA",
    search: "Mahsulotlarni qidirish...", catalog: "DO‘KON KATALOGI",
    productManagement: "Mahsulotlarni boshqarish",
    productSubtitle: "Techanor mahsulotlari, zaxirasi va mavjudligini boshqaring.",
    addProduct: "Mahsulot qo‘shish", productList: "Mahsulotlar ro‘yxati",
    totalProducts: "Jami mahsulotlar", number: "№", product: "Mahsulot",
    category: "Kategoriya", brand: "Brend", condition: "Holati", price: "Narxi",
    stock: "Zaxira", status: "Status", emptyProducts: "Hozircha mahsulot qo‘shilmagan.",
  },
};

Object.assign(productTranslations.ko, {
  general:"일반",home:"홈",products:"제품",marketing:"마케팅",users:"사용자",blogs:"블로그",logout:"로그아웃",systemOnline:"시스템 온라인",
  search:"제품 검색...",catalog:"스토어 카탈로그",productManagement:"제품 관리",productSubtitle:"Techanor 제품, 재고 및 판매 상태를 관리하세요.",
  addProduct:"제품 추가",productList:"제품 목록",totalProducts:"전체 제품",number:"번호",product:"제품",category:"카테고리",brand:"브랜드",
  condition:"상태",price:"가격",stock:"재고",status:"판매 상태",emptyProducts:"등록된 제품이 없습니다."
});
Object.assign(productTranslations.uz, {
  catalog:"DO‘KON KATALOGI",addProduct:"Mahsulot qo‘shish",productList:"Mahsulotlar ro‘yxati",number:"№"
});

const pageTextTranslations = {
  ko: {
    "MENU":"메뉴","GENERAL":"일반","ADMIN PANEL":"관리자 패널","Home":"홈","Products":"제품","Analytics":"분석","Marketing":"마케팅","Users":"사용자","Blogs":"블로그","Logout":"로그아웃","SYSTEM ONLINE":"시스템 온라인","AI Assistant":"AI 어시스턴트","Admin":"관리자","NEW":"신규","vs last month":"지난달 대비","than last week":"지난주 대비",
    "Search analytics...":"분석 검색...","Search campaigns...":"캠페인 검색...","12 months":"12개월","30 days":"30일","7 days":"7일","24 hours":"24시간",
    "Unique Visitors":"순 방문자","Total Pageviews":"총 페이지뷰","Bounce Rate":"이탈률","Visit Duration":"방문 시간","Techanor visitor analytics":"Techanor 방문자 분석",
    "Top Channels":"상위 채널","Top Pages":"상위 페이지","Active Users":"활성 사용자","Live":"실시간","Live visitors":"실시간 방문자","Avg. Daily":"일일 평균","Avg. Weekly":"주간 평균","Avg. Monthly":"월간 평균",
    "Acquisition Channels":"유입 채널","Sessions by Device":"기기별 세션","LAPTOP 52%":"노트북 52%","GAMING 30%":"게이밍 30%","TV 18%":"TV 18%","Customers Demographic":"고객 분포","Techanor customers by country":"국가별 Techanor 고객","Customers":"고객","2,379 Customers":"고객 2,379명","1,248 Customers":"고객 1,248명","892 Customers":"고객 892명",
    "Recent Orders":"최근 주문","Filter":"필터","☷ Filter":"☷ 필터","See all":"전체 보기","Product":"제품","Category":"카테고리","Country":"국가","Status":"상태","Value":"금액","Source":"소스","Visitors":"방문자","Page":"페이지","Views":"조회수","Completed":"완료","Pending":"대기","Canceled":"취소","South Korea":"대한민국","Uzbekistan":"우즈베키스탄","Germany":"독일","France":"프랑스",
    "Marketing Overview":"마케팅 개요","Track campaign performance and audience growth.":"캠페인 성과와 고객 증가를 확인하세요.","Avg. Client Rating":"평균 고객 평점","Social Followers":"소셜 팔로워","Instagram Followers":"인스타그램 팔로워","Total Revenue":"총매출","Vs last month":"지난달 대비",
    "Impression & Data Traffic":"노출 및 데이터 트래픽","Impressions & Data Traffic":"노출 및 데이터 트래픽","Impressions":"노출","Engagement":"참여","Traffic Stats":"트래픽 통계","Today":"오늘","Week":"주","Month":"월","New Subscribers":"신규 구독자","Conversion Rate":"전환율",
    "Featured Campaigns":"주요 캠페인","Creator":"제작자","Campaign":"캠페인","Ads campaign":"광고 캠페인","Success":"성공","Failed":"실패","Top Traffic Sources":"상위 트래픽 소스","View All":"전체 보기"
  },
  uz: {
    "MENU":"MENYU","GENERAL":"ASOSIY","ADMIN PANEL":"ADMIN PANEL","Home":"Bosh sahifa","Products":"Mahsulotlar","Analytics":"Tahlil","Marketing":"Marketing","Users":"Foydalanuvchilar","Blogs":"Bloglar","Logout":"Chiqish","SYSTEM ONLINE":"TIZIM ISHLAMOQDA","AI Assistant":"AI yordamchi","Admin":"Administrator","NEW":"YANGI","vs last month":"o‘tgan oyga nisbatan","than last week":"o‘tgan haftaga nisbatan",
    "Search analytics...":"Tahlillarni qidirish...","Search campaigns...":"Kampaniyalarni qidirish...","12 months":"12 oy","30 days":"30 kun","7 days":"7 kun","24 hours":"24 soat",
    "Unique Visitors":"Noyob tashrifchilar","Total Pageviews":"Jami ko‘rishlar","Bounce Rate":"Chiqib ketish darajasi","Visit Duration":"Tashrif davomiyligi","Techanor visitor analytics":"Techanor tashrifchilar tahlili",
    "Top Channels":"Asosiy kanallar","Top Pages":"Asosiy sahifalar","Active Users":"Faol foydalanuvchilar","Live":"Jonli","Live visitors":"Jonli tashrifchilar","Avg. Daily":"Kunlik o‘rtacha","Avg. Weekly":"Haftalik o‘rtacha","Avg. Monthly":"Oylik o‘rtacha",
    "Acquisition Channels":"Tashrif kanallari","Sessions by Device":"Qurilmalar bo‘yicha seanslar","LAPTOP 52%":"NOUTBUK 52%","GAMING 30%":"O‘YIN QURILMALARI 30%","TV 18%":"TV 18%","Customers Demographic":"Mijozlar demografiyasi","Techanor customers by country":"Davlatlar bo‘yicha Techanor mijozlari","Customers":"Mijoz","2,379 Customers":"2 379 ta mijoz","1,248 Customers":"1 248 ta mijoz","892 Customers":"892 ta mijoz",
    "Recent Orders":"So‘nggi buyurtmalar","Filter":"Filtr","☷ Filter":"☷ Filtr","See all":"Barchasini ko‘rish","Product":"Mahsulot","Category":"Kategoriya","Country":"Davlat","Status":"Holat","Value":"Qiymat","Source":"Manba","Visitors":"Tashrifchilar","Page":"Sahifa","Views":"Ko‘rishlar","Completed":"Bajarildi","Pending":"Kutilmoqda","Canceled":"Bekor qilindi","South Korea":"Janubiy Koreya","Uzbekistan":"O‘zbekiston","Germany":"Germaniya","France":"Fransiya",
    "Marketing Overview":"Marketing ko‘rsatkichlari","Track campaign performance and audience growth.":"Kampaniya natijalari va auditoriya o‘sishini kuzating.","Avg. Client Rating":"Mijozlarning o‘rtacha bahosi","Social Followers":"Ijtimoiy tarmoq kuzatuvchilari","Instagram Followers":"Instagram kuzatuvchilari","Total Revenue":"Jami daromad","Vs last month":"O‘tgan oyga nisbatan",
    "Impression & Data Traffic":"Ko‘rishlar va trafik","Impressions & Data Traffic":"Ko‘rishlar va trafik","Impressions":"Ko‘rishlar","Engagement":"Faollik","Traffic Stats":"Trafik statistikasi","Today":"Bugun","Week":"Hafta","Month":"Oy","New Subscribers":"Yangi obunachilar","Conversion Rate":"Konversiya darajasi",
    "Featured Campaigns":"Tanlangan kampaniyalar","Creator":"Muallif","Campaign":"Kampaniya","Ads campaign":"Reklama kampaniyasi","Success":"Muvaffaqiyatli","Failed":"Muvaffaqiyatsiz","Top Traffic Sources":"Asosiy trafik manbalari","View All":"Barchasini ko‘rish"
  }
};
const originalPageText = new WeakMap();

function initializeLanguagePicker() {
  const languageSelect = document.getElementById("language-select");
  if (!languageSelect) return;

  const savedLanguage = localStorage.getItem("techanor-admin-language") || "en";
  languageSelect.value = savedLanguage;
  applyProductLanguage(savedLanguage);
  languageSelect.addEventListener("change", function () {
    applyProductLanguage(languageSelect.value);
    localStorage.setItem("techanor-admin-language", languageSelect.value);
  });
}

function applyProductLanguage(language) {
  const translations = productTranslations[language] || productTranslations.en;
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach(function (element) {
    const translation = translations[element.dataset.i18n];
    if (translation) element.textContent = translation;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
    const translation = translations[element.dataset.i18nPlaceholder];
    if (translation) element.placeholder = translation;
  });

  translatePageText(language);
  document.dispatchEvent(new CustomEvent("techanor:languagechange", { detail: { language } }));
}

function translatePageText(language) {
  const dictionary = pageTextTranslations[language] || {};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest("script,style,select,[data-i18n]") || !node.nodeValue.trim()) continue;
    if (!originalPageText.has(node)) originalPageText.set(node, node.nodeValue);
    const original = originalPageText.get(node);
    const key = original.trim();
    const translated = language === "en" ? key : dictionary[key];
    if (translated) node.nodeValue = original.replace(key, translated);
  }
  const search = document.getElementById("product-search");
  if (search && !search.hasAttribute("data-i18n-placeholder")) {
    const englishPlaceholder = document.body.classList.contains("analytics_page") ? "Search analytics..." : "Search campaigns...";
    search.placeholder = language === "en" ? englishPlaceholder : (dictionary[englishPlaceholder] || englishPlaceholder);
  }
}

function initializeProductSearch() {
  const searchInput = document.getElementById("product-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLocaleLowerCase(document.documentElement.lang || "en");
    document.querySelectorAll(".product_row, [data-search-row]").forEach(function (row) {
      const searchableText = `${row.dataset.search || ""} ${row.textContent || ""}`
        .replace(/\s+/g, " ")
        .toLocaleLowerCase(document.documentElement.lang || "en");
      const searchMismatch = Boolean(query && !searchableText.includes(query));
      row.hidden = searchMismatch || row.dataset.filterHidden === "true";
    });
  });
}

function initializeSidebar() {
  const toggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("admin-sidebar");
  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", function () {
    sidebar.classList.toggle("is_open");
  });
}

function initializeThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  function updateThemeControl(theme) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );
  }

  const currentTheme = document.documentElement.dataset.theme || "light";
  updateThemeControl(currentTheme);

  themeToggle.addEventListener("click", function () {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    updateThemeControl(nextTheme);

    try {
      localStorage.setItem("techanor-admin-theme", nextTheme);
    } catch (error) {
      console.warn("Theme preference could not be saved.");
    }
  });
}

function initializeComingSoon() {
  document.querySelectorAll("[data-coming-soon]").forEach(function (button) {
    button.addEventListener("click", function () {
      const feature = button.dataset.comingSoon || "AI";
      const overlay = document.createElement("div");
      overlay.className = "coming_soon_overlay";
      overlay.innerHTML = `<section class="coming_soon_card" role="dialog" aria-modal="true" aria-labelledby="coming-soon-title"><span>AI</span><h2 id="coming-soon-title">${feature} is coming soon</h2><p>We are building a smarter Techanor experience to help you work faster and make better decisions. This feature will be available in a future update.</p><button type="button">Got it</button></section>`;
      document.body.appendChild(overlay);
      const close = function () { overlay.remove(); };
      overlay.querySelector("button").addEventListener("click", close);
      overlay.addEventListener("click", function (event) { if (event.target === overlay) close(); });
      document.addEventListener("keydown", function escape(event) { if (event.key === "Escape") { close(); document.removeEventListener("keydown", escape); } });
      overlay.querySelector("button").focus();
    });
  });
}

function previewProductImage(input) {
  const file = input.files[0];
  if (!file) return;

  const validImageTypes = ["image/jpeg", "image/png"];
  if (!validImageTypes.includes(file.type)) {
    input.value = "";
    alert("Please upload only JPG, JPEG or PNG images.");
    return;
  }

  const previewIndex = input.dataset.previewIndex;
  const previewImage = document.getElementById(`image-preview-${previewIndex}`);
  const uploadBox = input.closest(".upload_box");
  const reader = new FileReader();

  reader.addEventListener("load", function () {
    previewImage.src = reader.result;
    uploadBox.classList.add("has_preview");
  });
  reader.readAsDataURL(file);
}

function resetImagePreviews() {
  document.querySelectorAll(".upload_box").forEach(function (uploadBox, index) {
    const previewImage = uploadBox.querySelector("img");
    previewImage.src = "/img/upload.svg";
    previewImage.alt = `Image ${index + 1} preview`;
    uploadBox.classList.remove("has_preview");
  });
}
