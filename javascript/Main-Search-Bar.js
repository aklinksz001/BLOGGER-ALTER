<!-- Include Fuse.js (keep this in your page head or before the script) -->
<script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.basic.min.js"></script>

<!-- Your existing input stays the same -->
<input type="text" id="searchBar" placeholder="Search Here..." onclick="openSearchPage()">

<!-- Optional controls and results (place near the input) -->
<button id="refreshIndex">Refresh Index</button>
<label style="margin-left:8px">
  <input type="checkbox" id="strictToggle"> Strict mode
</label>
<div id="searchResults"></div>

<script>
// ---------- CONFIG (update jsonFiles to match your paths) ----------
const jsonFiles = [
  "../posts/index1.json",
  "../posts/index2.json",
  "../posts/1500-Webseries/index.json"
];

// Fuse base options (year included so combined queries work)
const fuseBaseOptions = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "language", weight: 0.2 },
    { name: "year", weight: 0.1 }
  ],
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 1
};

// ---------- STATE ----------
let allItems = [];
let fuse = null;
let isLoaded = false;

// ---------- HELPERS ----------
function escapeHtml(unsafe) {
  return String(unsafe || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function debounce(fn, wait = 180) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function buildFuse(threshold = 0.35) {
  const opts = Object.assign({}, fuseBaseOptions, { threshold });
  fuse = new Fuse(allItems, opts);
}

// ---------- LOAD & INDEX ----------
async function preloadJSON() {
  isLoaded = false;
  allItems = [];

  const promises = jsonFiles.map(async (path) => {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
      const json = await res.json();
      const items = Array.isArray(json.items) ? json.items : [];
      return items.map(it => ({
        title: String(it.title || "Unknown Title").trim(),
        img: String(it.img || "").trim(),
        language: String(it.language || "UNKNOWN").replace(/^Language:\s*/i, "").trim().toUpperCase(),
        link: String(it.link || "#").trim(),
        year: it.year ? String(it.year).trim() : ""
      }));
    } catch (err) {
      console.error(`Error loading ${path}:`, err);
      return [];
    }
  });

  const results = await Promise.all(promises);
  const flat = results.flat();

  // Deduplicate by exact link (preserve first)
  const seen = new Set();
  for (const it of flat) {
    if (!seen.has(it.link)) {
      seen.add(it.link);
      allItems.push(it);
    }
  }

  // Build default Fuse
  buildFuse(); // default threshold 0.35
  isLoaded = true;
  console.info(`Index built: ${allItems.length} items`);
}

// Public refresh function
async function refreshIndex() {
  const btn = document.getElementById("refreshIndex");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Refreshing...";
  }
  try {
    await preloadJSON();
  } catch (e) {
    console.error("Refresh failed:", e);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Refresh Index";
    }
  }
}

// ---------- SEARCH (no year-only special case) ----------
function searchQuery(query, maxResults = 200, strict = false) {
  if (!isLoaded || !fuse) return [];
  const q = String(query || "").trim();
  if (!q) return [];

  // Rebuild fuse according to strict toggle (cheap for small-mid datasets)
  buildFuse(strict ? 0.20 : 0.35);

  // Use Fuse fuzzy search across title, language, and year.
  // This lets queries like "Avengers 2012" match title + year, and numeric titles match normally.
  const raw = fuse.search(q, { limit: maxResults });
  return raw.map(r => r.item);
}

// ---------- UI: render ----------
function showResults(results) {
  const container = document.getElementById("searchResults");
  if (!container) return;
  container.innerHTML = "";

  if (!results || results.length === 0) {
    container.innerHTML = "<p>No results found</p>";
    return;
  }

  const frag = document.createDocumentFragment();
  results.forEach(item => {
    const safeTitle = escapeHtml(item.title);
    const safeImg = escapeHtml(item.img);
    const safeLink = escapeHtml(item.link);
    const safeLanguage = escapeHtml(item.language || "UNKNOWN");
    const safeYear = escapeHtml(item.year || "");

    const wrap = document.createElement("div");
    wrap.classList.add("result-item");
    wrap.innerHTML = `
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
    frag.appendChild(wrap);
  });

  container.appendChild(frag);
}

// ---------- WIRING ----------
function attachHandlers() {
  const searchBar = document.getElementById("searchBar");
  const refreshBtn = document.getElementById("refreshIndex");
  const strictToggle = document.getElementById("strictToggle");

  const onInput = debounce(() => {
    if (!searchBar) return;
    const q = searchBar.value || "";
    if (!q.trim()) {
      const c = document.getElementById("searchResults");
      if (c) c.innerHTML = "";
      return;
    }
    const strict = strictToggle ? strictToggle.checked : false;
    const results = searchQuery(q, 200, strict);
    showResults(results);
  }, 160);

  if (searchBar) {
    // preserve existing inline onclick — this only adds the input listener
    searchBar.addEventListener("input", onInput);
  }

  if (refreshBtn) refreshBtn.addEventListener("click", refreshIndex);
}

// ---------- INIT ----------
(async function init() {
  attachHandlers();
  await preloadJSON();
})();
</script>
