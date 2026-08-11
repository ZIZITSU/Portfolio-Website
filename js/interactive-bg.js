// ============ Interactive dot-grid background (whole page) ============
// Original implementation: a fixed, viewport-covering field of dots that
// glow purple and swell near the cursor, easing back to baseline when it
// moves away — sits behind all content, visible no matter where you've
// scrolled. Not derived from any reference site's code/assets.
(function () {
  const canvas = document.querySelector(".bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;

  const SPACING = 30;
  const RADIUS_BASE = 1.1;
  const RADIUS_MAX = 2.6;
  const ALPHA_BASE = 0.16;
  const ALPHA_MAX = 0.9;
  const GLOW_RADIUS = 170;
  const EASE = 0.12;

  let dots = [];
  let w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2);
  let mouse = { x: -9999, y: -9999, active: false };

  function buildGrid() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(w / SPACING) + 1;
    const rows = Math.ceil(h / SPACING) + 1;
    dots = [];
    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        dots.push({
          x: ix * SPACING,
          y: iy * SPACING,
          r: RADIUS_BASE,
          a: ALPHA_BASE,
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      let targetR = RADIUS_BASE;
      let targetA = ALPHA_BASE;

      if (mouse.active) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < GLOW_RADIUS) {
          const t = 1 - dist / GLOW_RADIUS;
          targetR = RADIUS_BASE + (RADIUS_MAX - RADIUS_BASE) * t;
          targetA = ALPHA_BASE + (ALPHA_MAX - ALPHA_BASE) * t;
        }
      }

      d.r += (targetR - d.r) * EASE;
      d.a += (targetA - d.a) * EASE;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${d.a})`;
      ctx.fill();
    }
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  buildGrid();

  if (reduceMotion) {
    draw(); // one static frame, no animation, no reactivity
    window.addEventListener("resize", () => { buildGrid(); draw(); }, { passive: true });
    return;
  }

  if (canHover) {
    window.addEventListener("pointermove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    // mouse truly left the browser viewport (not just moved over a child element)
    document.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget) mouse.active = false;
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildGrid, 150);
  }, { passive: true });

  requestAnimationFrame(loop);
})();
