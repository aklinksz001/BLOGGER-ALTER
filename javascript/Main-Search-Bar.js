// ------- CONFIG -------
const jsonFiles = [
  "../posts/index1.json",
  "../posts/index2.json",
  "../posts/1500-Webseries/index.json"
];

// Fuse.js options
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "language", weight: 0.2 },
    { name: "year", weight: 0.1 }
  ],
  includeScore: true,
  threshold: 0.35,       // adjust: lower = stricter, higher = fuzzier
  ignoreLocation: true,
  minMatchCharLength: 1
};

// Optional auto-refresh interval (ms). Set to null or 0 to disable.
const AUTO_REFRESH_MS = null; // e.g., 5 * 60 * 1000 for 5 minutes

// ------- STATE -------
let allItems = [];   // cached items
let isLoaded = false;
let fuse = null;

// ------- UTIL -------
function escapeHtml(unsafe) {
  return String(unsafe || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ------- PRELOAD & INDEX BUILD -------
async function preloadJSON() {
  isLoaded = false;
  allItems = [];

  const promises = jsonFiles.map(async (path) => {
    try {
      const res = await fetch(path, { cache: "no-store" }); // no-store to pick fresh changes when refreshing
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
      const json = await res.json();
      const items = Array.isArray(json.items) ? json.items : [];

      return items.map(it => ({
        title: String(it.title || "Unknown Title").trim(),
        img: String(it.img || "").trim(),
        language: String(it.language || "UNKNOWN").replace(/^Language:\s*/i, "").trim().toUpperCase(),
        link: String(it.link || "#").trim(),
        year: it.year ? String(it.year).trim() : ""   // year is optional
      }));
    } catch (err) {
      console.error(`Error loading ${path}:`, err);
      return [];
    }
  });

  const results = await Promise.all(promises);
  const flat = results.flat();

  // Deduplicate by exact link (keep first occurrence)
  const seen = new Set();
  for (const it of flat) {
    if (!seen.has(it.link)) {
      seen.add(it.link);
      allItems.push(it);
    }
  }

  // Build Fuse index
  fuse = new Fuse(allItems, fuseOptions);

  isLoaded = true;
  console.info(`Index loaded: ${allItems.length} items`);
}

// Public: refresh index (re-fetch JSON and rebuild Fuse)
async function refreshIndex() {
  document.getElementById("refreshIndex").disabled = true;
  document.getElementById("refreshIndex").innerText = "Refreshing...";
  try {
    await preloadJSON();
  } catch (e) {
    console.error("Refresh failed:", e);
  } finally {
    document.getElementById("refreshIndex").disabled = false;
    document.getElementById("refreshIndex").innerText = "Refresh Index";
  }
}

// ------- SEARCH -------
function searchQuery(query, maxResults = 200) {
  if (!isLoaded || !fuse) return [];
  const q = String(query || "").trim();
  if (!q) return [];

  // Fuse returns array of { item, score }
  const raw = fuse.search(q, { limit: maxResults });
  // Optional: filter by score threshold (already set in options) or add additional logic
  return raw.map(r => r.item);
}

// ------- UI: show results -------
function showResults(results) {
  const resultContainer = document.getElementById("searchResults");
  resultContainer.innerHTML = "";

  if (!results || results.length === 0) {
    resultContainer.innerHTML = "<p>No results found</p>";
    return;
  }

  const frag = document.createDocumentFragment();

  results.forEach(item => {
    const safeTitle = escapeHtml(item.title);
    const safeImg = escapeHtml(item.img);
    const safeLink = escapeHtml(item.link);
    const safeLanguage = escapeHtml(item.language || "UNKNOWN");
    const safeYear = escapeHtml(item.year || "");

    const wrapper = document.createElement("div");
    wrapper.classList.add("result-item");
    wrapper.innerHTML = `
      <div style="display:flex;align-items:center;margin-bottom:10px;padding:10px;border-bottom:1px solid #ddd;">
        <img src="${safeImg}" alt="${safeTitle}" width="100" style="border-radius:5px;margin-right:10px;">
        <div style="text-align:center;flex-grow:1;">
          <h4 style="margin:0;">${safeTitle}${safeYear ? ` (${safeYear})` : ""}</h4>
          <p style="margin:2px 0;font-size:14px;color:#00FF00;font-weight:bold;">${safeLanguage}</p>
          <a href="${safeLink}" target="_blank" style="color:red;font-weight:bold;font-size:16px;text-decoration:none;">
            <span style="color:black;">➥</span> DOWNLOAD
          </a>
        </div>
      </div>
    `;
    frag.appendChild(wrapper);
  });

  resultContainer.appendChild(frag);
}

// ------- WIRING -------
function attachSearchHandler() {
  const searchBar = document.getElementById("searchBar");
  if (!searchBar) {
    console.warn("No searchBar element found.");
    return;
  }

  const handler = debounce(() => {
    const q = searchBar.value;
    if (!q || q.trim().length === 0) {
      document.getElementById("searchResults").innerHTML = "";
      return;
    }
    const results = searchQuery(q, 150);
    showResults(results);
  }, 160);

  searchBar.addEventListener("input", handler);
}

function attachRefreshHandler() {
  const btn = document.getElementById("refreshIndex");
  if (!btn) return;
  btn.addEventListener("click", () => refreshIndex());
}

// ------- INIT -------
(async function init() {
  attachSearchHandler();
  attachRefreshHandler();

  await preloadJSON(); // initial load

  if (AUTO_REFRESH_MS && Number.isFinite(AUTO_REFRESH_MS) && AUTO_REFRESH_MS > 0) {
    setInterval(() => {
      console.info("Auto-refreshing index...");
      preloadJSON();
    }, AUTO_REFRESH_MS);
  }
})();
