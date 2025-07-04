// ========== CORE SEARCH MODULE ========== //
const SearchEngine = {
  cachedResults: [],       // Stores all parsed data
  currentResults: [],      // Filtered results
  currentPage: 1,          // Pagination tracking
  resultsPerPage: 10,      // Adjust as needed
  debounceTimer: null,     // For input delay
  lastQuery: "",           // Track recent searches

  // Initialize (Load all data at startup)
  async init() {
    try {
      this.showLoading(true);
      this.cachedResults = await this.loadAllFiles();
      this.setupEventListeners();
      this.showLoading(false);
    } catch (error) {
      this.showError("Failed to load search data. Refresh the page.");
    }
  },

  // Load & parse all HTML files
  async loadAllFiles() {
    const fetchPromises = filePages.map(async (page) => {
      try {
        const response = await fetch(page);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return this.extractData(doc);
      } catch (error) {
        console.error(`Error loading ${page}:`, error);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    return results.flat(); // Flatten all results into one array
  },

  // Extract data from each container
  extractData(doc) {
    const items = [];
    const containers = doc.querySelectorAll(".container");

    containers.forEach(container => {
      const title = container.querySelector(".heading-title")?.innerText.trim() || "Untitled";
      const img = container.querySelector("img")?.src || "";
      const language = container.querySelector(".language")?.innerText.replace("Language: ", "").trim().toUpperCase() || "UNKNOWN";
      const link = this.extractLink(container, doc);

      // Type 1: Direct link
      if (link && !link.includes("modal")) {
        items.push({ title, img, link, language });
      }
      // Type 2 & 3: Modal links
      else if (link) {
        const modalLinks = this.extractModalLinks(doc, link);
        items.push(...modalLinks);
      }
    });

    return items;
  },

  // Extract modal links (Type 2 & 3)
  extractModalLinks(doc, modalId) {
    const modal = doc.getElementById(modalId);
    if (!modal) return [];

    const links = modal.querySelectorAll("a.ad-link");
    const subtitles = modal.querySelectorAll("ul li");

    // Type 2: Multiple links with subtitles
    if (links.length > 1 && subtitles.length === 0) {
      return Array.from(links).map(link => ({
        title: link.innerText.trim(),
        img: "",
        link: link.href,
        language: "UNKNOWN"
      }));
    }
    // Type 3: Single link with subtitles
    else if (subtitles.length > 0) {
      const mainLink = links[0]?.href || "#";
      return Array.from(subtitles).map(sub => ({
        title: sub.innerText.trim(),
        img: "",
        link: mainLink,
        language: "UNKNOWN"
      }));
    }
    return [];
  },

  // Main search function (with fuzzy matching)
  search(query) {
    this.lastQuery = query;
    if (!query.trim()) {
      this.showResults([]);
      return;
    }

    const filtered = this.cachedResults.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
      const langMatch = item.language.toLowerCase().includes(query.toLowerCase());
      return titleMatch || langMatch;
    });

    this.currentResults = filtered;
    this.currentPage = 1;
    this.showResults(filtered);
  },

  // Apply filters (language, etc.)
  applyFilters() {
    const language = document.getElementById("languageFilter").value;
    let filtered = [...this.currentResults];

    if (language) {
      filtered = filtered.filter(item => item.language === language);
    }

    this.showResults(filtered);
  },

  // Pagination logic
  paginate(results) {
    const start = (this.currentPage - 1) * this.resultsPerPage;
    const end = start + this.resultsPerPage;
    return results.slice(start, end);
  },

  // Display results (with highlighting)
  showResults(results) {
    const container = document.getElementById("searchResults");
    container.innerHTML = "";

    if (results.length === 0) {
      container.innerHTML = `<p>No results found for "${this.lastQuery}"</p>`;
      document.getElementById("pagination").style.display = "none";
      return;
    }

    const paginatedResults = this.paginate(results);
    paginatedResults.forEach(item => {
      const highlightedTitle = this.highlightMatches(item.title, this.lastQuery);
      const resultHTML = `
        <div class="result-item" tabindex="0">
          <img src="${item.img}" alt="${item.title}" width="100">
          <div>
            <h4>${highlightedTitle}</h4>
            <p class="language">${item.language}</p>
            <a href="${item.link}" target="_blank">⬇ Download</a>
          </div>
        </div>
      `;
      container.innerHTML += resultHTML;
    });

    // Show pagination if needed
    if (results.length > this.resultsPerPage) {
      document.getElementById("pagination").style.display = "flex";
      document.getElementById("pageInfo").textContent = `Page ${this.currentPage}`;
    } else {
      document.getElementById("pagination").style.display = "none";
    }
  },

  // Highlight search matches in results
  highlightMatches(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, '<span class="highlight">$1</span>');
  },

  // Event Listeners
  setupEventListeners() {
    // Debounced Search
    document.getElementById("searchBar").addEventListener("input", (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.search(e.target.value);
      }, 300);
    });

    // Filters
    document.getElementById("languageFilter").addEventListener("change", () => {
      this.applyFilters();
    });

    // Pagination
    document.getElementById("nextPage").addEventListener("click", () => {
      if (this.currentPage < Math.ceil(this.currentResults.length / this.resultsPerPage)) {
        this.currentPage++;
        this.showResults(this.currentResults);
      }
    });

    document.getElementById("prevPage").addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.showResults(this.currentResults);
      }
    });

    // Keyboard Navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        // Navigate results (example)
        const items = document.querySelectorAll(".result-item");
        if (items.length > 0) {
          // ... (logic to move focus)
        }
      } else if (e.key === "Enter") {
        // Open focused result
        const focused = document.querySelector(".result-item:focus");
        if (focused) focused.querySelector("a").click();
      }
    });
  },

  // UI Helpers
  showLoading(show) {
    document.getElementById("searchLoader").style.display = show ? "block" : "none";
  },

  showError(message) {
    const errorEl = document.getElementById("searchError");
    errorEl.textContent = message;
    errorEl.style.display = "block";
    setTimeout(() => errorEl.style.display = "none", 3000);
  }
};

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => SearchEngine.init());
