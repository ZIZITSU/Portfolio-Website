// ============ Real cover art for the "Music I listen to" row ============
// Fetches each track's actual artwork client-side from Apple's public,
// no-auth iTunes Search API (returns real cover art, not fabricated URLs),
// then upsizes the thumbnail Apple normally serves at 100x100.
async function loadCover(img) {
  const title = img.dataset.title;
  const artist = img.dataset.artist;
  const term = encodeURIComponent(`${title} ${artist}`);

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`
    );
    if (!res.ok) throw new Error(`iTunes API responded ${res.status}`);
    const data = await res.json();
    const track = data.results && data.results[0];
    if (!track || !track.artworkUrl100) throw new Error("No artwork found");

    const hiRes = track.artworkUrl100.replace("100x100", "600x600");
    img.src = hiRes;
    img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
  } catch (err) {
    console.error(`Cover art fetch failed for "${title}":`, err);
    img.closest(".music-item").classList.add("music-item--fallback");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".music-cover img[data-title]").forEach(loadCover);
});
