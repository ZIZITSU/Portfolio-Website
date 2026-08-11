// ============ Reusable project list renderer + preview modal ============
// Mounts into any element with [data-project-mount="featured"|"all"].
// Shared by the homepage strip and the /projects page so markup never
// has to be duplicated by hand.
import { PROJECTS } from "./projects-data.js";
import { animate } from "./motion.js";

// Curated purple/violet-family gradients for the homepage panel cards —
// each project gets its own tone but stays on the site's black+purple palette.
const PANEL_GRADIENTS = {
  arbitrator: "linear-gradient(135deg, #241442 0%, #6d28d9 100%)",
  partyjam: "linear-gradient(135deg, #3b1256 0%, #b83280 100%)",
  automech: "linear-gradient(135deg, #1a1638 0%, #4f46e5 100%)",
  chase: "linear-gradient(135deg, #3a123a 0%, #a21caf 100%)",
  "formula-iut": "linear-gradient(135deg, #0f1a3d 0%, #4338ca 100%)",
  "simracing-buttonbox": "linear-gradient(135deg, #1f1f24 0%, #6d28d9 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #201a35 0%, #6d28d9 100%)";

// ---------- /projects page: numbered row layout ----------
function rowCardHTML(project, index) {
  const num = String(index + 1).padStart(2, "0");
  const tags = project.tags.map((t) => `<span>${t}</span>`).join("");
  return `
    <article class="proj-row reveal">
      <div class="proj-info">
        <div class="proj-meta">
          <span class="proj-num">${num}</span>
          <span class="proj-cat">${project.category}</span>
        </div>
        <h3 class="proj-title"><em class="serif">${project.title}</em></h3>
        <p class="proj-desc">${project.description}</p>
        <div class="proj-tags">${tags}</div>
        ${
          project.link
            ? `<a class="proj-link" href="${project.link}" target="_blank" rel="noopener">Visit project <span class="arr">↗</span></a>`
            : `<span class="proj-link is-disabled">Coming soon</span>`
        }
      </div>
      <button class="proj-preview" type="button" data-project-id="${project.id}" aria-haspopup="dialog">
        <span class="proj-thumb-frame">
          <span class="proj-thumb-dots"><i></i><i></i><i></i></span>
        </span>
        ${
          project.image
            ? `<img src="${project.image}" alt="${project.title} screenshot" loading="lazy" />`
            : `<span class="proj-thumb-empty">Screenshot coming soon</span>`
        }
        <span class="proj-preview-badge">Preview <span class="arr">↗</span></span>
      </button>
    </article>`;
}

// ---------- Homepage: gradient panel cards ----------
function panelCardHTML(project, displayNum) {
  const num = String(displayNum).padStart(2, "0");
  const gradient = PANEL_GRADIENTS[project.id] || DEFAULT_GRADIENT;
  const tags = project.tags.map((t) => `<span>${t}</span>`).join("");
  return `
    <article class="pcard reveal">
      <div class="pcard-meta">
        <span class="proj-num">${num}</span>
        <span class="pcard-rule" aria-hidden="true"></span>
        <span class="proj-cat">${project.category}</span>
      </div>
      <h3 class="pcard-title"><em class="serif">${project.title}</em></h3>
      <button class="pcard-panel" type="button" style="background:${gradient}" data-project-id="${project.id}" aria-haspopup="dialog">
        <div class="pcard-panel-top">
          <p class="pcard-tagline">${project.description}</p>
          <span class="pcard-arrow">↗</span>
        </div>
        ${
          project.image
            ? `<div class="pcard-mockup"><img src="${project.image}" alt="${project.title} screenshot" loading="lazy" /></div>`
            : `<div class="pcard-mockup pcard-mockup-empty"><span>Screenshot coming soon</span></div>`
        }
      </button>
      <div class="proj-tags">${tags}</div>
    </article>`;
}

function observeReveals(root) {
  const els = root.querySelectorAll(".reveal:not(.in)");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${(i % 4) * 70}ms`;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

function bindCursorHover(root) {
  const dot = document.querySelector(".cursor-dot");
  if (!dot || !matchMedia("(hover: hover)").matches) return;
  root.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => dot.classList.add("is-hovering"));
    el.addEventListener("mouseleave", () => dot.classList.remove("is-hovering"));
  });
}

function mountRows(el, list) {
  el.innerHTML = list.map((p, i) => rowCardHTML(p, i)).join("");
  observeReveals(el);
  bindCursorHover(el);
}

// Two independent columns (odd items left, even items right) so the layout
// matches the reference's interleaved masonry — while still reading in
// correct 1..N order when collapsed to a single column on small screens.
function mountPanels(el, list) {
  const isDesktop = () => window.matchMedia("(min-width: 761px)").matches;

  function render() {
    if (isDesktop()) {
      const colA = [];
      const colB = [];
      list.forEach((p, i) => {
        (i % 2 === 0 ? colA : colB).push(panelCardHTML(p, i + 1));
      });
      el.innerHTML = `
        <div class="pcard-col">${colA.join("")}</div>
        <div class="pcard-col">${colB.join("")}</div>`;
    } else {
      el.innerHTML = `<div class="pcard-col">${list
        .map((p, i) => panelCardHTML(p, i + 1))
        .join("")}</div>`;
    }
    observeReveals(el);
    bindCursorHover(el);
  }

  render();
  let wasDesktop = isDesktop();
  window.addEventListener("resize", () => {
    const nowDesktop = isDesktop();
    if (nowDesktop !== wasDesktop) {
      wasDesktop = nowDesktop;
      render();
    }
  });
}

// ---------- Preview modal (shared by both layouts) ----------
function buildModal() {
  const dialog = document.createElement("dialog");
  dialog.className = "project-modal";
  dialog.innerHTML = `
    <button class="project-modal-close" type="button" aria-label="Close preview">&times;</button>
    <img class="project-modal-img" src="" alt="" />
    <div class="project-modal-body">
      <div class="proj-meta">
        <span class="proj-num"></span>
        <span class="proj-cat"></span>
      </div>
      <h3 class="proj-title"><em class="serif"></em></h3>
      <p class="proj-desc"></p>
      <div class="proj-tags"></div>
      <a class="proj-link btn btn-signal btn-sm" href="#" target="_blank" rel="noopener">
        Visit project <span class="arr">↗</span>
      </a>
    </div>`;
  document.body.appendChild(dialog);

  const closeBtn = dialog.querySelector(".project-modal-close");
  closeBtn.addEventListener("click", () => closeModal(dialog));
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeModal(dialog);
  });
  dialog.querySelector(".proj-link").addEventListener("click", (e) => {
    if (e.currentTarget.classList.contains("is-disabled")) e.preventDefault();
  });
  document.addEventListener("keydown", (e) => {
    if (dialog.open && e.key === "Escape") {
      e.preventDefault();
      closeModal(dialog);
    }
  });

  return dialog;
}

// Spring-based open/close (Motion) instead of CSS easing — a native <dialog>
// still owns focus trapping/ESC semantics, Motion just drives the motion.
function openModalAnimation(dialog) {
  dialog.classList.add("is-open"); // CSS-driven ::backdrop fade
  animate(
    dialog,
    { opacity: [0, 1], scale: [0.94, 1], y: [14, 0], filter: ["blur(6px)", "blur(0px)"] },
    { type: "spring", stiffness: 340, damping: 28 }
  );
}

function closeModal(dialog) {
  if (!dialog.open) return;
  dialog.classList.remove("is-open");
  const animation = animate(
    dialog,
    { opacity: [1, 0], scale: [1, 0.96], y: [0, 8] },
    { type: "spring", stiffness: 400, damping: 34 }
  );
  // Guaranteed close even if the animation's `finished` promise never
  // settles (throttled/backgrounded tab, interrupted animation, etc.)
  const timeout = new Promise((resolve) => setTimeout(resolve, 500));
  Promise.race([animation.finished, timeout]).then(() => {
    if (dialog.open) dialog.close();
  });
}

function openModal(dialog, project, index) {
  const num = String(index + 1).padStart(2, "0");
  const img = dialog.querySelector(".project-modal-img");
  if (project.image) {
    img.src = project.image;
    img.alt = `${project.title} screenshot`;
    img.style.display = "";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
  }
  dialog.querySelector(".proj-num").textContent = num;
  dialog.querySelector(".proj-cat").textContent = project.category;
  dialog.querySelector(".proj-title em").textContent = project.title;
  dialog.querySelector(".proj-desc").textContent = project.description;
  dialog.querySelector(".proj-tags").innerHTML = project.tags
    .map((t) => `<span>${t}</span>`)
    .join("");

  const link = dialog.querySelector(".proj-link");
  if (project.link) {
    link.href = project.link;
    link.classList.remove("is-disabled");
    link.innerHTML = `Visit project <span class="arr">↗</span>`;
  } else {
    link.href = "#";
    link.classList.add("is-disabled");
    link.innerHTML = "Coming soon";
  }

  dialog.showModal();
  openModalAnimation(dialog);
}

function initPreviewModal(list) {
  const dialog = buildModal();
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-project-id]");
    if (!trigger) return;
    const project = list.find((p) => p.id === trigger.dataset.projectId);
    const index = list.indexOf(project);
    if (project) openModal(dialog, project, index);
  });
  dialog.addEventListener("close", () => dialog.classList.remove("is-open"));
}

document.addEventListener("DOMContentLoaded", () => {
  const featuredEl = document.querySelector('[data-project-mount="featured"]');
  const allEl = document.querySelector('[data-project-mount="all"]');

  if (featuredEl) {
    const limit = Number(featuredEl.dataset.projectLimit) || PROJECTS.length;
    mountPanels(featuredEl, PROJECTS.filter((p) => p.featured).slice(0, limit));
  }
  if (allEl) {
    mountRows(allEl, PROJECTS);
  }
  if (featuredEl || allEl) {
    initPreviewModal(PROJECTS);
  }
});
