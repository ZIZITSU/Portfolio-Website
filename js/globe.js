// ============ Availability globe (COBE) ============
// Dhaka as home base, arcing out to a handful of cities to back up the
// "based in Bangladesh, available globally" line. Original composition —
// not derived from any reference site's code/assets.
import createGlobe from "https://cdn.jsdelivr.net/npm/cobe@2.0.1/+esm";

const CITIES = [
  { id: "dhaka", label: "Dhaka", lat: 23.8103, lon: 90.4125, home: true },
  { id: "london", label: "London", lat: 51.5074, lon: -0.1278 },
  { id: "newyork", label: "New York", lat: 40.7128, lon: -74.006 },
  { id: "dubai", label: "Dubai", lat: 25.2048, lon: 55.2708 },
  { id: "tokyo", label: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { id: "sydney", label: "Sydney", lat: -33.8688, lon: 151.2093 },
];

function initGlobe() {
  const canvas = document.querySelector(".globe-canvas");
  if (!canvas) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dhaka = CITIES.find((c) => c.home);

  let phi = 0;
  let velocity = 0;
  let pointerDown = false;
  let pointerLastX = 0;
  let dragPhi = 0;

  const globe = createGlobe(canvas, {
    // Fixed internal resolution — CSS scales the canvas to fit its box.
    // (Resizing the WebGL backing store every frame from a variable that
    // starts at 0 before layout settles was breaking the first render.)
    devicePixelRatio: Math.min(devicePixelRatio || 1, 2),
    width: 700,
    height: 700,
    phi: 0,
    theta: 0.3,
    dark: 1,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 9,
    baseColor: [0.12, 0.09, 0.2],
    markerColor: [0.655, 0.545, 0.98],
    glowColor: [0.5, 0.4, 0.85],
    arcColor: [0.75, 0.65, 1],
    arcWidth: 1.2,
    arcHeight: 0.32,
    markerElevation: 0.03,
    scale: 1,
    markers: CITIES.map((c) => ({
      location: [c.lat, c.lon],
      size: c.home ? 0.1 : 0.05,
      id: c.id,
    })),
    arcs: CITIES.filter((c) => !c.home).map((c) => ({
      from: [dhaka.lat, dhaka.lon],
      to: [c.lat, c.lon],
      id: `arc-${c.id}`,
    })),
  });

  // cobe@2.0.1's createGlobe() draws a single synchronous frame and does not
  // run its own animation loop or read an `onRender` callback — its world-map
  // texture also finishes decoding *after* that first frame, so without a
  // loop calling globe.update() ourselves, the globe never shows the dotted
  // map and never rotates. We drive it manually here.
  let raf;
  function frame() {
    if (!pointerDown) {
      if (!reduceMotion) {
        // gentle idle auto-rotate, plus momentum decay after a drag
        phi += 0.0025 + velocity;
        velocity *= 0.92;
      }
    }
    globe.update({ phi: phi + dragPhi });
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  canvas.style.cursor = "grab";
  canvas.style.touchAction = "none";

  canvas.addEventListener("pointerdown", (e) => {
    pointerDown = true;
    pointerLastX = e.clientX;
    velocity = 0;
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointerDown) return;
    const delta = e.clientX - pointerLastX;
    pointerLastX = e.clientX;
    dragPhi += delta / 200;
    velocity = delta / 4000;
  });
  function release() {
    if (!pointerDown) return;
    pointerDown = false;
    phi += dragPhi;
    dragPhi = 0;
    canvas.style.cursor = "grab";
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  return () => {
    cancelAnimationFrame(raf);
    globe.destroy();
  };
}

document.addEventListener("DOMContentLoaded", initGlobe);
