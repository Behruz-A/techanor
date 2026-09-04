/* Techanor admin product management */

$(window).on("load", function () {
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
    productForm.slideUp(250, function () {
      document.querySelector(".products_card")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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
      statusSelect.removeClass("status_pause status_process status_delete").addClass(`status_${String(productStatus).toLowerCase()}`);
      statusSelect.closest(".product_row").attr("data-status", productStatus);
      statusSelect.blur();
    } catch (error) {
      console.error("Error, updateProductStatus:", error);
      alert("Product update failed!");
      window.location.reload();
    }
  });

  $(".new-product-condition").on("change", async function (event) {
    const conditionSelect = $(event.currentTarget);
    const productId = conditionSelect.data("product-id");
    const productCondition = conditionSelect.val();
    const previousCondition = productCondition === "NEW" ? "USED" : "NEW";

    conditionSelect.prop("disabled", true);
    try {
      const response = await axios.post(`/admin/product/${productId}`, { productCondition });
      if (!response.data.data) throw new Error("Product condition update failed");
      conditionSelect.removeClass("condition_new condition_used").addClass(`condition_${String(productCondition).toLowerCase()}`);
      conditionSelect.closest(".product_row").attr("data-condition", productCondition);
      document.dispatchEvent(new CustomEvent("techanor:producttablechange"));
      conditionSelect.blur();
    } catch (error) {
      console.error("Error, updateProductCondition:", error);
      conditionSelect.val(previousCondition);
      alert("Product condition update failed!");
    } finally {
      conditionSelect.prop("disabled", false);
    }
  });

  $("input[name='productImages']").on("change", function (event) {
    previewProductImage(event.currentTarget);
  });

  productForm.on("submit", function (event) {
    const description = document.getElementById("product-description");
    const value = description?.value.trim() || "";
    const testCopy = /\b(test|lorem ipsum)\b|this is really good product|good product/i;
    if (description && value && (value.length < 20 || testCopy.test(value))) {
      event.preventDefault();
      const language = document.documentElement.lang || "en";
      const message = language === "ko"
        ? "설명은 의미 있는 20자 이상으로 작성하고 테스트 문구를 사용하지 마세요."
        : language === "uz"
          ? "Tavsif kamida 20 ta mazmunli belgidan iborat bo‘lsin va test matnlaridan foydalanmang."
          : "Use at least 20 meaningful characters and remove test or placeholder wording.";
      description.setCustomValidity(message);
      description.reportValidity();
      description.focus();
      return;
    }
    description?.setCustomValidity("");
    if (!event.currentTarget.checkValidity()) {
      event.preventDefault();
      event.currentTarget.reportValidity();
      return;
    }
    const submitButton = event.currentTarget.querySelector("[data-submit-product]");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Creating...";
    }
  });
  document.getElementById("product-description")?.addEventListener("input", function (event) {
    event.currentTarget.setCustomValidity("");
  });

  initializeProductSearch();
  initializeProductTable();
  initializeProductActions();
  initializeLanguagePicker();
  initializeMemoryField();
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

Object.assign(productTranslations.en, {
  productList: "Products List", productListSubtitle: "Manage inventory, availability and product details.",
  export: "Export", filter: "Filter", allCategories: "All categories", allStatuses: "All statuses",
  clearFilters: "Clear filters", active: "Active", paused: "Paused", deleted: "Deleted", added: "Added", newCondition: "New", usedCondition: "Used",
  actions: "Actions", viewMore: "View More", deleteProduct: "Delete", stock: "Product Left Count",
  filterProducts: "Filter products", filterHint: "Results update automatically", allBrands: "All brands", allConditions: "All conditions",
  memoryStorage: "Memory / Storage", addMemory: "Add memory / storage", selectMemory: "Select memory",
  screenSize: "Screen size", addScreenSize: "Add TV screen size", selectScreenSize: "Select screen size", optional: "Optional",
  navigationSearch: "Search pages...", tableSearchLabel: "Search this table", tableSearch: "Search products...",
  deleteSelected: "Delete selected", changeStatus: "Change status", chooseStatus: "Choose status", descriptionHelp: "If provided, use at least 20 meaningful characters.",
  brands: "Brands", searchCategory: "Search category...", searchBrands: "Search brands...", applyFilters: "Apply"
});
Object.assign(productTranslations.ko, {
  productList: "제품 목록", productListSubtitle: "재고, 판매 상태 및 제품 정보를 관리하세요.",
  export: "내보내기", filter: "필터", allCategories: "모든 카테고리", allStatuses: "모든 상태",
  clearFilters: "필터 초기화", active: "활성", paused: "일시 중지", deleted: "삭제됨", added: "등록일", newCondition: "신품", usedCondition: "중고",
  actions: "작업", viewMore: "자세히 보기", deleteProduct: "삭제", stock: "남은 제품 수량",
  filterProducts: "제품 필터", filterHint: "결과가 자동으로 업데이트됩니다", allBrands: "모든 브랜드", allConditions: "모든 상태",
  memoryStorage: "메모리 / 저장 용량", addMemory: "메모리 / 저장 용량 추가", selectMemory: "용량 선택",
  screenSize: "화면 크기", addScreenSize: "TV 화면 크기 추가", selectScreenSize: "화면 크기 선택", optional: "선택 사항",
  navigationSearch: "페이지 검색...", tableSearchLabel: "이 표에서 검색", tableSearch: "제품 검색...",
  deleteSelected: "선택 항목 삭제", changeStatus: "상태 변경", chooseStatus: "상태 선택", descriptionHelp: "입력하는 경우 의미 있는 20자 이상을 사용하세요.",
  brands: "브랜드", searchCategory: "카테고리 검색...", searchBrands: "브랜드 검색...", applyFilters: "적용"
});
Object.assign(productTranslations.uz, {
  productList: "Mahsulotlar ro‘yxati", productListSubtitle: "Zaxira, mavjudlik va mahsulot ma’lumotlarini boshqaring.",
  export: "Eksport", filter: "Filtr", allCategories: "Barcha kategoriyalar", allStatuses: "Barcha statuslar",
  clearFilters: "Filtrlarni tozalash", active: "Faol", paused: "To‘xtatilgan", deleted: "O‘chirilgan", added: "Qo‘shilgan", newCondition: "Yangi", usedCondition: "Ishlatilgan",
  actions: "Amallar", viewMore: "Batafsil", deleteProduct: "O‘chirish", stock: "Qolgan mahsulot soni",
  filterProducts: "Mahsulotlarni filtrlash", filterHint: "Natijalar avtomatik yangilanadi", allBrands: "Barcha brendlar", allConditions: "Barcha holatlar",
  memoryStorage: "Xotira / saqlash hajmi", addMemory: "Xotira hajmini qo‘shish", selectMemory: "Xotira hajmini tanlang",
  screenSize: "Ekran o‘lchami", addScreenSize: "TV ekran o‘lchamini qo‘shish", selectScreenSize: "Ekran o‘lchamini tanlang", optional: "Ixtiyoriy",
  navigationSearch: "Sahifalarni qidiring...", tableSearchLabel: "Shu jadvaldan qidirish", tableSearch: "Mahsulotlarni qidiring...",
  deleteSelected: "Tanlanganlarni o‘chirish", changeStatus: "Statusni o‘zgartirish", chooseStatus: "Statusni tanlang", descriptionHelp: "Kiritilsa, kamida 20 ta mazmunli belgidan foydalaning.",
  brands: "Brendlar", searchCategory: "Kategoriyani qidiring...", searchBrands: "Brendlarni qidiring...", applyFilters: "Qo‘llash"
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
    "Impression & Data Traffic":"노출 및 데이터 트래픽","Impressions & Data Traffic":"노출 및 데이터 트래픽","Impressions & Traffic":"노출 및 트래픽","Impressions":"노출","Engagement":"참여","Traffic Stats":"트래픽 통계","Today":"오늘","Week":"주","Month":"월","New Subscribers":"신규 구독자","Conversion Rate":"전환율","Jan 1, 2026 – Aug 17, 2026":"2026년 1월 1일 – 2026년 8월 17일",
    "Featured Campaigns":"주요 캠페인","Creator":"제작자","Campaign":"캠페인","Ads campaign":"광고 캠페인","Grow your brand visibility":"브랜드 인지도 높이기","Make better product ideas":"더 나은 제품 아이디어 만들기","Increase your website traffic":"웹사이트 트래픽 늘리기","Digital marketing that works":"성과를 만드는 디지털 마케팅","Self branding":"셀프 브랜딩","Success":"성공","Pending":"대기","Failed":"실패","No campaigns match your search.":"검색과 일치하는 캠페인이 없습니다.","Top Traffic Sources":"상위 트래픽 소스","View All":"전체 보기"
  },
  uz: {
    "MENU":"MENYU","GENERAL":"ASOSIY","ADMIN PANEL":"ADMIN PANEL","Home":"Bosh sahifa","Products":"Mahsulotlar","Analytics":"Tahlil","Marketing":"Marketing","Users":"Foydalanuvchilar","Blogs":"Bloglar","Logout":"Chiqish","SYSTEM ONLINE":"TIZIM ISHLAMOQDA","AI Assistant":"AI yordamchi","Admin":"Administrator","NEW":"YANGI","vs last month":"o‘tgan oyga nisbatan","than last week":"o‘tgan haftaga nisbatan",
    "Search analytics...":"Tahlillarni qidirish...","Search campaigns...":"Kampaniyalarni qidirish...","12 months":"12 oy","30 days":"30 kun","7 days":"7 kun","24 hours":"24 soat",
    "Unique Visitors":"Noyob tashrifchilar","Total Pageviews":"Jami ko‘rishlar","Bounce Rate":"Chiqib ketish darajasi","Visit Duration":"Tashrif davomiyligi","Techanor visitor analytics":"Techanor tashrifchilar tahlili",
    "Top Channels":"Asosiy kanallar","Top Pages":"Asosiy sahifalar","Active Users":"Faol foydalanuvchilar","Live":"Jonli","Live visitors":"Jonli tashrifchilar","Avg. Daily":"Kunlik o‘rtacha","Avg. Weekly":"Haftalik o‘rtacha","Avg. Monthly":"Oylik o‘rtacha",
    "Acquisition Channels":"Tashrif kanallari","Sessions by Device":"Qurilmalar bo‘yicha seanslar","LAPTOP 52%":"NOUTBUK 52%","GAMING 30%":"O‘YIN QURILMALARI 30%","TV 18%":"TV 18%","Customers Demographic":"Mijozlar demografiyasi","Techanor customers by country":"Davlatlar bo‘yicha Techanor mijozlari","Customers":"Mijoz","2,379 Customers":"2 379 ta mijoz","1,248 Customers":"1 248 ta mijoz","892 Customers":"892 ta mijoz",
    "Recent Orders":"So‘nggi buyurtmalar","Filter":"Filtr","☷ Filter":"☷ Filtr","See all":"Barchasini ko‘rish","Product":"Mahsulot","Category":"Kategoriya","Country":"Davlat","Status":"Holat","Value":"Qiymat","Source":"Manba","Visitors":"Tashrifchilar","Page":"Sahifa","Views":"Ko‘rishlar","Completed":"Bajarildi","Pending":"Kutilmoqda","Canceled":"Bekor qilindi","South Korea":"Janubiy Koreya","Uzbekistan":"O‘zbekiston","Germany":"Germaniya","France":"Fransiya",
    "Marketing Overview":"Marketing ko‘rsatkichlari","Track campaign performance and audience growth.":"Kampaniya natijalari va auditoriya o‘sishini kuzating.","Avg. Client Rating":"Mijozlarning o‘rtacha bahosi","Social Followers":"Ijtimoiy tarmoq kuzatuvchilari","Instagram Followers":"Instagram kuzatuvchilari","Total Revenue":"Jami daromad","Vs last month":"O‘tgan oyga nisbatan",
    "Impression & Data Traffic":"Ko‘rishlar va trafik","Impressions & Data Traffic":"Ko‘rishlar va trafik","Impressions & Traffic":"Ko‘rishlar va trafik","Impressions":"Ko‘rishlar","Engagement":"Faollik","Traffic Stats":"Trafik statistikasi","Today":"Bugun","Week":"Hafta","Month":"Oy","New Subscribers":"Yangi obunachilar","Conversion Rate":"Konversiya darajasi","Jan 1, 2026 – Aug 17, 2026":"2026-yil 1-yanvar – 17-avgust",
    "Featured Campaigns":"Tanlangan kampaniyalar","Creator":"Muallif","Campaign":"Kampaniya","Ads campaign":"Reklama kampaniyasi","Grow your brand visibility":"Brendingiz tanilishini oshiring","Make better product ideas":"Yaxshiroq mahsulot g‘oyalarini yarating","Increase your website traffic":"Sayt tashriflarini oshiring","Digital marketing that works":"Natija beradigan raqamli marketing","Self branding":"Shaxsiy brending","Success":"Muvaffaqiyatli","Pending":"Kutilmoqda","Failed":"Muvaffaqiyatsiz","No campaigns match your search.":"Qidiruvingizga mos kampaniya topilmadi.","Top Traffic Sources":"Asosiy trafik manbalari","View All":"Barchasini ko‘rish"
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

  if (document.body.classList.contains("products_page")) {
    const destinations = [
      { words: ["product", "products", "mahsulot", "제품"], url: "/admin/product/all" },
      { words: ["analytics", "analysis", "tahlil", "분석"], url: "/admin/analytics" },
      { words: ["marketing", "마케팅"], url: "/admin/marketing" },
      { words: ["user", "users", "foydalanuvchi", "사용자"], url: "/admin/user/all" },
      { words: ["blog", "blogs", "블로그"], url: "/admin/blog/all" },
      { words: ["home", "dashboard", "bosh", "홈"], url: "/admin" },
    ];
    searchInput.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      const query = searchInput.value.trim().toLocaleLowerCase(document.documentElement.lang || "en");
      const destination = destinations.find((item) => item.words.some((word) => query.includes(word)));
      if (destination) window.location.assign(destination.url);
    });
    return;
  }

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

function initializeProductTable() {
  const tableSearch = document.getElementById("product-table-search");
  let rows = Array.from(document.querySelectorAll(".products_table .product_row"));
  if (!tableSearch || !rows.length) return;

  const categoryFilter = document.getElementById("product-category-filter");
  const brandFilter = document.getElementById("product-brand-filter");
  const applyFilters = document.getElementById("apply-product-filters");
  const clearFilters = document.getElementById("clear-product-filters");
  const filterToggle = document.getElementById("product-filter-toggle");
  const filterPanel = document.getElementById("product-filters");
  const pagination = document.getElementById("products-pagination");
  const resultCount = document.getElementById("products-result-count");
  const activeFilterCount = document.getElementById("active-filter-count");
  const selectAll = document.getElementById("select-all-products");
  const bulkBar = document.getElementById("bulk-actions-bar");
  const selectedCount = document.getElementById("selected-products-count");
  const deleteSelected = document.getElementById("delete-selected-products");
  const bulkStatus = document.getElementById("bulk-status-select");
  const pageSize = 5;
  let page = 1;

  function checkedRows() {
    return rows.filter((row) => row.querySelector(".product_select_checkbox")?.checked);
  }

  function updateSelection() {
    const selected = checkedRows();
    const language = document.documentElement.lang || "en";
    selectedCount.textContent = language === "ko" ? `${selected.length}개 선택됨` : language === "uz" ? `${selected.length} ta tanlandi` : `${selected.length} selected`;
    bulkBar.hidden = selected.length === 0;
    const visible = rows.filter((row) => !row.hidden);
    const visibleChecked = visible.filter((row) => row.querySelector(".product_select_checkbox")?.checked).length;
    selectAll.checked = Boolean(visible.length && visibleChecked === visible.length);
    selectAll.indeterminate = visibleChecked > 0 && visibleChecked < visible.length;
  }

  function copy() {
    const language = document.documentElement.lang || "en";
    return language === "ko"
      ? { showing: (a, b, total) => `전체 ${total}개 중 ${a}–${b}개 표시`, previous: "이전", next: "다음" }
      : language === "uz"
        ? { showing: (a, b, total) => `${total} ta mahsulotdan ${a}–${b} tasi`, previous: "Oldingi", next: "Keyingi" }
        : { showing: (a, b, total) => `Showing ${a}–${b} of ${total} products`, previous: "Previous", next: "Next" };
  }

  function filteredRows() {
    const query = tableSearch.value.trim().toLocaleLowerCase(document.documentElement.lang || "en");
    return rows.filter(function (row) {
      const text = `${row.dataset.search || ""} ${row.textContent || ""}`.replace(/\s+/g, " ").toLocaleLowerCase(document.documentElement.lang || "en");
      return (!query || text.includes(query)) &&
        (!categoryFilter.value.trim() || row.dataset.category.includes(categoryFilter.value.trim().toUpperCase())) &&
        (!brandFilter.value.trim() || row.dataset.brand.includes(brandFilter.value.trim().toUpperCase()));
    });
  }

  function render() {
    const visibleRows = filteredRows();
    const filterCount = [categoryFilter.value.trim(), brandFilter.value.trim()].filter(Boolean).length;
    activeFilterCount.textContent = String(filterCount);
    activeFilterCount.hidden = filterCount === 0;
    if (clearFilters) clearFilters.disabled = filterCount === 0;
    const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
    page = Math.min(page, pageCount);
    rows.forEach((row) => { row.hidden = true; });
    const start = (page - 1) * pageSize;
    visibleRows.forEach(function (row, index) {
      const number = row.querySelector(".product_row_number");
      if (number) number.textContent = String(index + 1);
    });
    visibleRows.slice(start, start + pageSize).forEach((row) => { row.hidden = false; });
    updateSelection();
    const labels = copy();
    resultCount.textContent = visibleRows.length ? labels.showing(start + 1, Math.min(start + pageSize, visibleRows.length), visibleRows.length) : labels.showing(0, 0, 0);
    pagination.replaceChildren();

    const addButton = function (label, target, disabled, active) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = disabled;
      button.classList.toggle("is_active", active);
      if (active) button.setAttribute("aria-current", "page");
      button.addEventListener("click", function () { page = target; render(); });
      pagination.appendChild(button);
    };
    addButton("‹", page - 1, page === 1, false);
    for (let number = 1; number <= pageCount; number += 1) addButton(String(number), number, false, number === page);
    addButton("›", page + 1, page === pageCount, false);
  }

  function updateQuery(value) {
    tableSearch.value = value;
    page = 1;
    render();
  }

  tableSearch.addEventListener("input", () => updateQuery(tableSearch.value));
  rows.forEach((row) => row.querySelector(".product_select_checkbox")?.addEventListener("change", updateSelection));
  selectAll?.addEventListener("change", function () {
    rows.filter((row) => !row.hidden).forEach((row) => { row.querySelector(".product_select_checkbox").checked = selectAll.checked; });
    updateSelection();
  });
  deleteSelected?.addEventListener("click", async function () {
    const selected = checkedRows();
    if (!selected.length) return;
    const language = document.documentElement.lang || "en";
    const message = language === "ko" ? `선택한 ${selected.length}개 제품을 삭제하시겠습니까?` : language === "uz" ? `Tanlangan ${selected.length} ta mahsulot o‘chirilsinmi?` : `Delete ${selected.length} selected products?`;
    if (!window.confirm(message)) return;
    deleteSelected.disabled = true;
    try {
      await Promise.all(selected.map((row) => axios.delete(`/admin/product/${row.dataset.productId}`)));
      selected.forEach((row) => row.remove());
      document.dispatchEvent(new CustomEvent("techanor:producttablechange"));
    } catch (error) {
      console.error("Bulk product delete failed:", error);
      alert(language === "ko" ? "선택한 제품을 삭제하지 못했습니다." : language === "uz" ? "Tanlangan mahsulotlarni o‘chirib bo‘lmadi." : "Selected products could not be deleted.");
    } finally { deleteSelected.disabled = false; }
  });
  bulkStatus?.addEventListener("change", async function () {
    const productStatus = bulkStatus.value;
    const selected = checkedRows();
    if (!productStatus || !selected.length) return;
    bulkStatus.disabled = true;
    try {
      await Promise.all(selected.map((row) => axios.post(`/admin/product/${row.dataset.productId}`, { productStatus })));
      selected.forEach(function (row) {
        const select = row.querySelector(".new-product-status");
        select.value = productStatus;
        select.className = `new-product-status status_select status_${productStatus.toLowerCase()}`;
        row.dataset.status = productStatus;
      });
      document.dispatchEvent(new CustomEvent("techanor:producttablechange"));
    } catch (error) {
      console.error("Bulk product status update failed:", error);
      window.location.reload();
    } finally { bulkStatus.value = ""; bulkStatus.disabled = false; }
  });
  applyFilters?.addEventListener("click", function () { page = 1; render(); filterPanel.hidden = true; filterToggle.setAttribute("aria-expanded", "false"); });
  clearFilters?.addEventListener("click", function () {
    categoryFilter.value = "";
    brandFilter.value = "";
    page = 1;
    render();
    filterPanel.hidden = true;
    filterToggle.setAttribute("aria-expanded", "false");
  });
  [categoryFilter, brandFilter].forEach(function (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); applyFilters.click(); }
    });
  });
  filterToggle.addEventListener("click", function () {
    filterPanel.hidden = !filterPanel.hidden;
    filterToggle.setAttribute("aria-expanded", String(!filterPanel.hidden));
    if (!filterPanel.hidden) window.setTimeout(() => categoryFilter.focus(), 0);
  });
  document.addEventListener("click", function (event) {
    if (!filterPanel.hidden && !event.target.closest(".filter_control")) { filterPanel.hidden = true; filterToggle.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("techanor:languagechange", render);
  document.addEventListener("techanor:producttablechange", function () {
    rows = rows.filter((row) => row.isConnected);
    render();
  });

  render();
}

function initializeProductActions() {
  const rows = document.querySelectorAll(".products_table .product_row");
  if (!rows.length) return;

  function closeMenus(except) {
    document.querySelectorAll(".row_actions_menu").forEach(function (menu) {
      if (menu === except) return;
      menu.hidden = true;
      menu.previousElementSibling?.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll(".row_actions_toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const menu = toggle.nextElementSibling;
      const willOpen = menu.hidden;
      closeMenus(menu);
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.querySelectorAll("[data-product-action='view']").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest(".product_row");
      const cells = row.cells;
      const language = document.documentElement.lang || "en";
      const labels = language === "ko"
        ? ["카테고리", "브랜드", "상태", "가격", "남은 제품 수량", "판매 상태", "등록일"]
        : language === "uz"
          ? ["Kategoriya", "Brend", "Holati", "Narxi", "Qolgan mahsulot soni", "Status", "Qo‘shilgan"]
          : ["Category", "Brand", "Condition", "Price", "Product Left Count", "Status", "Added"];
      const values = [cells[2], cells[3], cells[4], cells[5], cells[6], cells[7], cells[8]].map(function (cell) {
        return cell.querySelector("select")?.selectedOptions[0]?.textContent || cell.textContent.trim();
      });
      const title = cells[1].querySelector("strong")?.textContent || "Product";
      const overlay = document.createElement("div");
      overlay.className = "product_details_overlay";
      overlay.innerHTML = `<section class="product_details_modal" role="dialog" aria-modal="true" aria-labelledby="product-details-title"><header><h2 id="product-details-title"></h2><button type="button" aria-label="Close">×</button></header><div class="product_details_grid"></div></section>`;
      overlay.querySelector("h2").textContent = title;
      const grid = overlay.querySelector(".product_details_grid");
      labels.forEach(function (label, index) {
        const item = document.createElement("div");
        const small = document.createElement("small");
        const strong = document.createElement("strong");
        small.textContent = label; strong.textContent = values[index]; item.append(small, strong); grid.appendChild(item);
      });
      document.body.appendChild(overlay);
      const close = () => overlay.remove();
      overlay.querySelector("button").addEventListener("click", close);
      overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
      closeMenus();
    });
  });

  document.querySelectorAll("[data-product-action='delete']").forEach(function (button) {
    button.addEventListener("click", async function () {
      const row = button.closest(".product_row");
      const statusSelect = row.querySelector(".new-product-status");
      const name = row.querySelector(".product_copy strong")?.textContent || "product";
      const language = document.documentElement.lang || "en";
      const message = language === "ko" ? `${name} 제품을 삭제 상태로 변경하시겠습니까?` : language === "uz" ? `${name} mahsulotini o‘chirishga ishonchingiz komilmi?` : `Are you sure you want to delete ${name}?`;
      if (!window.confirm(message)) return;
      button.disabled = true;
      try {
        const response = await axios.delete(`/admin/product/${statusSelect.dataset.productId}`);
        if (!response.data.data) throw new Error("Product delete failed");
        row.remove();
        document.dispatchEvent(new CustomEvent("techanor:producttablechange"));
        closeMenus();
      } catch (error) {
        console.error("Error, deleteProduct:", error);
        alert(language === "uz" ? "Mahsulotni o‘chirib bo‘lmadi." : language === "ko" ? "제품을 삭제하지 못했습니다." : "Product could not be deleted.");
      } finally {
        button.disabled = false;
      }
    });
  });

  document.addEventListener("click", () => closeMenus());
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeMenus(); });
}

function initializeMemoryField() {
  const category = document.getElementById("product-category");
  const triggerField = document.getElementById("memory-trigger-field");
  const inputField = document.getElementById("memory-input-field");
  const memorySelect = document.getElementById("product-memory");
  const addButton = document.getElementById("add-memory-button");
  const removeButton = document.getElementById("remove-memory-button");
  const screenTriggerField = document.getElementById("screen-trigger-field");
  const screenInputField = document.getElementById("screen-input-field");
  const screenSelect = document.getElementById("product-screen-size");
  const addScreenButton = document.getElementById("add-screen-button");
  const removeScreenButton = document.getElementById("remove-screen-button");
  if (!category || !triggerField || !inputField || !memorySelect || !screenTriggerField || !screenInputField || !screenSelect) return;

  const memoryCategories = new Set(["LAPTOP", "SMARTPHONE"]);

  function removeMemory() {
    memorySelect.value = "";
    memorySelect.disabled = true;
    inputField.hidden = true;
    triggerField.hidden = !memoryCategories.has(category.value);
  }

  function removeScreenSize() {
    screenSelect.value = "";
    screenSelect.disabled = true;
    screenInputField.hidden = true;
    screenTriggerField.hidden = category.value !== "TV";
  }

  function syncCategory() {
    if (!memoryCategories.has(category.value)) {
      removeMemory();
      triggerField.hidden = true;
    } else {
      triggerField.hidden = !inputField.hidden;
    }

    if (category.value !== "TV") {
      removeScreenSize();
      screenTriggerField.hidden = true;
    } else {
      screenTriggerField.hidden = !screenInputField.hidden;
    }
  }

  category.addEventListener("change", syncCategory);
  addButton.addEventListener("click", function () {
    triggerField.hidden = true;
    inputField.hidden = false;
    memorySelect.disabled = false;
    memorySelect.focus();
  });
  removeButton.addEventListener("click", removeMemory);
  addScreenButton.addEventListener("click", function () {
    screenTriggerField.hidden = true;
    screenInputField.hidden = false;
    screenSelect.disabled = false;
    screenSelect.focus();
  });
  removeScreenButton.addEventListener("click", removeScreenSize);
  document.getElementById("reset-btn")?.addEventListener("click", function () {
    window.setTimeout(function () { removeMemory(); removeScreenSize(); triggerField.hidden = true; screenTriggerField.hidden = true; }, 0);
  });
  syncCategory();
}

function previewProductImage(input) {
  const file = input.files[0];
  if (!file) return;

  const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validImageTypes.includes(file.type)) {
    input.value = "";
    alert("Please upload only JPG, PNG or WebP images.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    input.value = "";
    alert("Each product image must be 5 MB or smaller.");
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
