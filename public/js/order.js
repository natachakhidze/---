// public/js/order.js – შეკვეთის ფორმის ლოგიკა
(function () {
  const form = document.getElementById("orderForm");
  const submitBtn = document.getElementById("submitBtn");
  const resultEl = document.getElementById("formResult");
  const serviceSelect = document.getElementById("service");
  const areaInput = document.getElementById("area");

  // ---------- სწრაფი კონტაქტის ბმულები ----------
  const telHref = "tel:" + window.SITE.phone.replace(/[^+\d]/g, "");
  document.getElementById("callNowBtn").href = telHref;
  document.getElementById("quickPhone").textContent = window.SITE.phone;
  document.getElementById("waBtn").href =
    "https://wa.me/" + window.SITE.whatsapp;

  // ---------- URL-დან ფართობის ავტომატური ჩასმა (მთავარი გვერდიდან) ----------
  const urlArea = new URLSearchParams(location.search).get("area");
  if (urlArea) areaInput.value = urlArea;

  // ---------- სერვისების სია ----------
  fetch("/api/services")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) return;
      const options = data.services
        .map((s) => `<option value="${s.id}">${window.esc(s.title)}</option>`)
        .join("");
      serviceSelect.insertAdjacentHTML(
        "beforeend",
        options +
          `<option value="${data.other.id}">${window.esc(data.other.title)}</option>`,
      );

      // თუ მთავარი გვერდიდან სერვისი მითითებულია (?service=laminate)
      const urlService = new URLSearchParams(location.search).get("service");
      if (urlService) serviceSelect.value = urlService;
    })
    .catch(() => {});

  // ---------- ვალიდაცია ----------
  function setError(fieldId, message) {
    const field = document.getElementById(fieldId).closest(".field");
    const errorEl = document.getElementById("err-" + fieldId);
    field.classList.toggle("has-error", Boolean(message));
    if (errorEl) errorEl.textContent = message || "";
  }

  function validate() {
    let valid = true;

    const name = form.name.value.trim();
    if (name.length < 2) {
      setError("name", "გთხოვთ, მიუთითოთ სახელი და გვარი");
      valid = false;
    } else setError("name", "");

    const phone = form.phone.value.trim();
    if (!/^\+?[0-9\s()-]{9,18}$/.test(phone)) {
      setError("phone", "გთხოვთ, მიუთითოთ სწორი ტელეფონის ნომერი");
      valid = false;
    } else setError("phone", "");

    if (!form.service.value) {
      setError("service", "გთხოვთ, აირჩიოთ მომსახურება");
      valid = false;
    } else setError("service", "");

    return valid;
  }

  // ---------- გაგზავნა ----------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    resultEl.textContent = "";
    resultEl.className = "form-note";

    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "იგზავნება...";

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        website: form.website.value, // ხაფანგი ბოტებისთვის
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        address: form.address.value.trim(),
        area: form.area.value ? Number(form.area.value) : null,
        comment: form.comment.value.trim(),
      }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 201 && data.ok) {
          resultEl.textContent =
            "თქვენი მოთხოვნა მიღებულია! მალე დაგიკავშირდებით.";
          resultEl.classList.add("success");
          form.reset();
        } else if (data.errors) {
          Object.entries(data.errors).forEach(([field, msg]) =>
            setError(field, msg),
          );
          resultEl.textContent = "გთხოვთ, შეასწოროთ მონიშნული ველები";
          resultEl.classList.add("error");
        } else {
          resultEl.textContent = data.error || "შეცდომა მოხდა. სცადეთ ხელახლა.";
          resultEl.classList.add("error");
        }
      })
      .catch(() => {
        resultEl.textContent =
          "კავშირის შეცდომა. შეამოწმეთ ინტერნეტი და სცადეთ ხელახლა.";
        resultEl.classList.add("error");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i data-lucide="send" class="ic"></i>შეკვეთის გაგზავნა';
        if (window.lucide) window.lucide.createIcons();
      });
  });

  if (window.lucide) window.lucide.createIcons();
})();
