// public/js/home.js – მთავარი გვერდის ლოგიკა
(function () {
  // ---------- სერვისების ჩატვირთვა ----------
  fetch("/api/services")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) return;
      const grid = document.getElementById("servicesGrid");
      grid.innerHTML = data.services
        .map(
          (s) => `
        <div class="card service-card">
          <div class="service-icon"><i data-lucide="${s.icon}" class="ic-lg"></i></div>
          <h3>${window.esc(s.title)}</h3>
          <p>${window.esc(s.description)}</p>
          <span class="service-feature"><i data-lucide="check-circle-2" class="ic"></i>${window.esc(s.feature)}</span>
        </div>`,
        )
        .join("");
      if (window.lucide) window.lucide.createIcons();
    })
    .catch(() => {});

  // ---------- კალკულატორი ----------
  const range = document.getElementById("calcRange");
  const areaValue = document.getElementById("calcAreaValue");
  const priceEl = document.getElementById("calcPrice");
  const ctaLink = document.getElementById("calcCta");

  function formatMoney(n) {
    return "₾ " + n.toLocaleString("ka-GE");
  }

  let debounceTimer = null;
  function updateCalc() {
    const area = Number(range.value);
    areaValue.textContent = area + " მ²";
    ctaLink.href = "/order?area=" + area;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetch("/api/calc?area=" + area)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) priceEl.textContent = formatMoney(data.total);
        })
        .catch(() => {
          // თუ სერვერთან კავშირი ვერ მოხერხდა, ლოკალურად ვთვლით
          priceEl.textContent = formatMoney(area * 350);
        });
    }, 150);
  }

  range.addEventListener("input", updateCalc);
  updateCalc();
})();
