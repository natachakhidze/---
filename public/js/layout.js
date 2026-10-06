// public/js/layout.js – საერთო ნაწილები: ჰედერი, მენიუ, ფუტერი, ქვედა ნავიგაცია
(function () {
  const SITE = {
    name: "სამშენებლო ნდობა",
    tagline: "სამშენებლო და სარემონტო მომსახურება უმაღლესი სტანდარტით",
    phone: "+995 592 001 949",
    whatsapp: "995592001949", // WhatsApp ნომერი + ქვეყნის კოდი, ფორმატის გარეშე
    address: "თბილისი, საქართველო",
    hours: "ორშ-შაბ: 09:00 - 19:00",
  };
  window.SITE = SITE;

  // HTML-ის დაცვა (გამოიყენება დინამიური შიგთავსისთვის)
  window.esc = function (value) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return String(value ?? "").replace(/[&<>"']/g, (ch) => map[ch]);
  };

  const page = document.body.dataset.page; // home | projects | order
  const telHref = "tel:" + SITE.phone.replace(/[^+\d]/g, "");

  const links = [
    { key: "home", href: "/", label: "მთავარი", icon: "house" },
    {
      key: "projects",
      href: "/projects",
      label: "პროექტები",
      icon: "layout-grid",
    },
    { key: "order", href: "/order", label: "შეკვეთა", icon: "calculator" },
  ];
  const active = (key) => (key === page ? "active" : "");

  const headerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <button class="icon-btn" id="menuBtn" aria-label="მენიუს გახსნა" aria-expanded="false">
          <i data-lucide="menu" class="ic-lg"></i>
        </button>
        <a href="/" class="brand">${SITE.name}</a>
        <span class="header-spacer"></span>
        <nav class="desktop-nav">
          ${links.map((l) => `<a href="${l.href}" class="${active(l.key)}">${l.label}</a>`).join("")}
        </nav>
        <a href="${telHref}" class="icon-btn tint" aria-label="დარეკვა">
          <i data-lucide="phone-call" class="ic-lg"></i>
        </a>
      </div>
    </header>

    <div class="drawer-overlay" id="drawerOverlay"></div>
    <aside class="drawer" id="drawer" aria-label="მენიუ">
      <div class="drawer-head">
        <span class="brand">${SITE.name}</span>
        <button class="icon-btn" id="drawerClose" aria-label="მენიუს დახურვა">
          <i data-lucide="x" class="ic-lg"></i>
        </button>
      </div>
      ${links
        .map(
          (l) => `<a href="${l.href}" class="link ${active(l.key)}">
            <i data-lucide="${l.icon}" class="ic"></i>${l.label}</a>`,
        )
        .join("")}
      <div class="drawer-contact">
        <a class="btn btn-primary" href="${telHref}"><i data-lucide="phone" class="ic"></i>${SITE.phone}</a>
        <a class="btn btn-soft" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">
          <i data-lucide="message-circle" class="ic"></i>WhatsApp
        </a>
      </div>
    </aside>`;

  const footerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-name">${SITE.name}</div>
        <p class="section-sub">${SITE.tagline}</p>
        <ul class="footer-list">
          <li><i data-lucide="phone" class="ic"></i><a href="${telHref}">${SITE.phone}</a></li>
          <li><i data-lucide="map-pin" class="ic"></i>${SITE.address}</li>
          <li><i data-lucide="clock" class="ic"></i>${SITE.hours}</li>
        </ul>
        <div class="footer-links">
          ${links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
        </div>
        <p class="copyright">© ${new Date().getFullYear()} ${SITE.name}. ყველა უფლება დაცულია.</p>
      </div>
    </footer>

    <nav class="bottom-nav" aria-label="ძირითადი ნავიგაცია">
      ${links
        .map(
          (l) => `<a href="${l.href}" class="${active(l.key)}">
            <i data-lucide="${l.icon}" class="ic-lg"></i><span>${l.label}</span></a>`,
        )
        .join("")}
    </nav>`;

  document.body.insertAdjacentHTML("afterbegin", headerHTML);
  document.body.insertAdjacentHTML("beforeend", footerHTML);

  // მენიუს გახსნა/დახურვა
  const menuBtn = document.getElementById("menuBtn");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setMenu(true));
  document
    .getElementById("drawerClose")
    .addEventListener("click", () => setMenu(false));
  document
    .getElementById("drawerOverlay")
    .addEventListener("click", () => setMenu(false));
  document.addEventListener(
    "keydown",
    (e) => e.key === "Escape" && setMenu(false),
  );

  // იკონების დახატვა (Lucide)
  if (window.lucide) window.lucide.createIcons();
})();
