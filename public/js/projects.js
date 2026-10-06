// public/js/projects.js – პროექტების გვერდის ლოგიკა
(function () {
  const grid = document.getElementById("projectsGrid");
  const filtersBox = document.getElementById("filters");
  let allProjects = [];
  let activeFilter = "all";

  function render() {
    const list =
      activeFilter === "all"
        ? allProjects
        : allProjects.filter((p) => p.category === activeFilter);

    if (list.length === 0) {
      grid.innerHTML =
        '<p class="section-sub">ამ კატეგორიაში პროექტები არ მოიძებნა.</p>';
      return;
    }

    grid.innerHTML = list
      .map(
        (p) => `
      <div class="card project-card">
        <div class="img-box project-image">
          <img src="${p.image}" alt="${window.esc(p.title)}" onerror="this.style.display='none'" />
          <div class="project-zoom"><i data-lucide="zoom-in" class="ic"></i></div>
        </div>
        <div class="project-body">
          <div class="project-meta">
          </div>
          <h3>${window.esc(p.title)}</h3>
        </div>
      </div>`,
      )
      .join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // ფილტრის ღილაკებზე დაჭერა
  filtersBox.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    filtersBox
      .querySelectorAll(".chip")
      .forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });

  // მონაცემების ჩატვირთვა სერვერიდან
  fetch("/api/projects")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) throw new Error("ok=false");
      allProjects = data.projects;
      render();
    })
    .catch(() => {
      grid.innerHTML =
        '<p class="section-sub">პროექტების ჩატვირთვა ვერ მოხერხდა. სცადეთ გვერდის განახლება.</p>';
    });
})();
