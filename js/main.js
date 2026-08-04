// ============ Sticky nav: frosted dark background on scroll ============
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ============ Scroll reveals (blur + rise) ============
const revealEls = document.querySelectorAll(".reveal");
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
revealEls.forEach((el) => io.observe(el));

// ============ Custom cursor dot ============
const dot = document.querySelector(".cursor-dot");
if (dot && matchMedia("(hover: hover)").matches) {
  let x = innerWidth / 2, y = innerHeight / 2;
  let tx = x, ty = y;
  addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => dot.classList.add("is-hovering"));
    el.addEventListener("mouseleave", () => dot.classList.remove("is-hovering"));
  });
}

// ============ Drag-to-scroll for the design row ============
document.querySelectorAll("[data-drag-scroll]").forEach((row) => {
  let isDown = false, startX = 0, startScroll = 0, moved = false;
  row.addEventListener("pointerdown", (e) => {
    isDown = true;
    moved = false;
    startX = e.clientX;
    startScroll = row.scrollLeft;
    row.classList.add("dragging");
  });
  addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    row.scrollLeft = startScroll - dx;
  });
  addEventListener("pointerup", () => {
    isDown = false;
    row.classList.remove("dragging");
  });
  // don't trigger clicks after a drag
  row.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
});

// ============ Magnetic pull on the big contact button ============
document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2;
    const my = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${mx * 0.15}px, ${my * 0.3}px)`;
  });
  el.addEventListener("mouseleave", () => { el.style.transform = ""; });
});

// ============ Footer year ============
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ Contact form (Web3Forms) ============
(function () {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("contact-submit");
  const submitText = document.getElementById("submit-text");
  const statusEl = document.getElementById("form-status");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable button & show sending state
    submitBtn.disabled = true;
    submitText.textContent = "Sending…";

    // Clear previous status
    statusEl.className = "form-status";
    statusEl.textContent = "";

    try {
      const formData = new FormData(form);
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        statusEl.textContent = "✓ Message sent! I'll get back to you soon.";
        statusEl.className = "form-status show success";
        form.reset();
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Form error:", err);
      statusEl.textContent = "Something went wrong. Please try again or email me directly.";
      statusEl.className = "form-status show error";
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = "Send Message";
    }
  });
})();
