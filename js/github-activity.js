// ============ Live GitHub contribution heatmap ============
// Real data fetched client-side from a public, no-auth-required API
// (not a pre-rendered screenshot). Rendered as a scalable inline SVG so
// it always fits its box instead of needing horizontal scroll.
const USERNAME = "ZIZITSU";
const WEEKS_TO_SHOW = 40; // ~9 months — bigger cells than a full year, still real data

const LEVEL_COLORS = [
  "rgba(255,255,255,0.06)",
  "rgba(167,139,250,0.35)",
  "rgba(167,139,250,0.55)",
  "rgba(167,139,250,0.78)",
  "rgba(167,139,250,1)",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildSVG(days) {
  const cell = 14;
  const gap = 3.5;
  const step = cell + gap;
  const labelRow = 18;

  // Pad the front so the first day lands in the correct weekday row (0=Sun).
  const firstDow = new Date(days[0].date + "T00:00:00").getDay();
  const padded = Array(firstDow).fill(null).concat(days);
  const weeks = Math.ceil(padded.length / 7);

  const width = weeks * step;
  const height = 7 * step + labelRow;

  let cells = "";
  let labels = "";
  let lastMonth = -1;

  for (let i = 0; i < padded.length; i++) {
    const day = padded[i];
    const col = Math.floor(i / 7);
    const row = i % 7;
    const x = col * step;
    const y = row * step + labelRow;

    if (day) {
      const d = new Date(day.date + "T00:00:00");
      if (d.getDate() <= 7 && d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        labels += `<text x="${x}" y="${labelRow - 6}" font-size="11" style="fill:var(--muted)" font-family="var(--font-body)">${MONTHS[lastMonth]}</text>`;
      }
      cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${LEVEL_COLORS[day.level] || LEVEL_COLORS[0]}"><title>${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}</title></rect>`;
    }
  }

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="display:block;height:auto;" role="img" aria-label="GitHub contribution activity, last 12 months">${labels}${cells}</svg>`;
}

async function mount() {
  const wrap = document.querySelector(".github-chart-wrap");
  if (!wrap) return;

  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`);
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const data = await res.json();
    const recent = data.contributions.slice(-WEEKS_TO_SHOW * 7);

    wrap.innerHTML = buildSVG(recent);

    const statsEl = document.querySelector(".github-stats");
    if (statsEl) {
      statsEl.textContent = `${data.total.lastYear} contributions in the last 12 months`;
    }
  } catch (err) {
    console.error("GitHub activity fetch failed:", err);
    wrap.innerHTML = `<p class="github-fallback">Couldn't load live activity right now — <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener">see it on GitHub ↗</a></p>`;
  }
}

document.addEventListener("DOMContentLoaded", mount);
