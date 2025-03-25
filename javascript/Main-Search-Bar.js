// List of all file pages to fetch
const filePages = [
    "../posts/Korean-Drama-Tamil.html",
    "../posts/Anime-English.html",
    "../posts/Dubbed-Movie-Series-Tamil.html",
    "../posts/Cartoon-Anime-Tamil.html",
    "../posts/Tamil-Webseries.html"
];

let cacheData = {}; // Local cache for stored pages
let debounceTimer; // Debounce timer for optimized searching

// Function to normalize text (case-insensitive & removes spaces, hyphens, underscores)
function normalizeText(text) {
    return text.toLowerCase().replace(/[\s\-_]+/g, "");
}

// Function to highlight matched search terms
function highlightMatch(text, query) {
    let regex = new RegExp(query, "gi");
    return text.replace(regex, (match) => `<span style="background-color: yellow; font-weight: bold;">${match}</span>`);
}

// Function to fetch and search data
function searchFiles(query) {
    let results = [];
    let searchLower = normalizeText(query.trim());

    let fetchPromises = filePages.map(page => {
        if (cacheData[page]) {
            return Promise.resolve(cacheData[page]); // Use cached data if available
        } else {
            return fetch(page)
                .then(response => response.text())
                .then(data => {
                    cacheData[page] = data; // Store data in cache
                    return data;
                })
                .catch(error => console.error(`Error loading ${page}:`, error));
        }
    });

    Promise.all(fetchPromises).then(pagesData => {
        pagesData.forEach((data, index) => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(data, "text/html");

            let containers = doc.querySelectorAll(".container");
            containers.forEach(container => {
                let titleElement = container.querySelector(".heading-title");
                let imgElement = container.querySelector("img");
                let linkElement = container.querySelector("a.trigger-modal");
                let languageElement = container.querySelector(".language");

                let title = titleElement ? titleElement.innerText.trim() : "Unknown Title";
                let img = imgElement ? imgElement.src : "";
                let modalId = linkElement ? linkElement.getAttribute("data-modal-id") : null;
                let language = languageElement ? languageElement.innerText.replace("Language: ", "").trim() : "Unknown";

                let titleLower = normalizeText(title);
                let languageLower = normalizeText(language);

                let link = "#";
                if (modalId) {
                    let modal = doc.getElementById(modalId);
                    if (modal) {
                        let modalLink = modal.querySelector("a.ad-link");
                        if (modalLink) {
                            link = modalLink.href;
                        }
                    }
                }

                // Check if search query matches title or language
                if (titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                    results.push({ 
                        title: highlightMatch(title, query), 
                        img, 
                        link, 
                        language: highlightMatch(language, query) 
                    });
                }

                // Check subtitles inside modal
                if (modalId) {
                    let modal = doc.getElementById(modalId);
                    if (modal) {
                        let subtitles = modal.querySelectorAll("ul li");
                        subtitles.forEach(subtitle => {
                            let subtitleText = subtitle.innerText.trim();
                            let subtitleLower = normalizeText(subtitleText);
                            if (subtitleLower.includes(searchLower)) {
                                results.push({ 
                                    title: highlightMatch(subtitleText, query), 
                                    img, 
                                    link, 
                                    language: highlightMatch(language, query) 
                                });
                            }
                        });
                    }
                }
            });
        });

        showResults(results);
    });
}

// Function to display search results
function showResults(results) {
    let resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = "";

    if (results.length === 0) {
        resultContainer.innerHTML = "<p>No results found</p>";
    } else {
        results.forEach(item => {
            let resultItem = document.createElement("div");
            resultItem.classList.add("result-item");
            resultItem.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ddd;">
                    <img src="${item.img}" alt="${item.title}" width="100" style="border-radius: 5px; margin-right: 10px;">
                    <div style="text-align: center;">
                        <h4 style="margin: 0;">${item.title}</h4>
                        <p style="margin: 2px 0; font-size: 14px;"><strong style="color: #00FF00;">LANGUAGE:</strong> <span style="color: #00FF00;">${item.language.toUpperCase()}</span></p>
                        <a href="${item.link}" target="_blank" style="color: red; font-weight: bold; text-decoration: none;">
                            <span style="color: black;">➥</span> DOWNLOAD
                        </a>
                    </div>
                </div>
            `;
            resultContainer.appendChild(resultItem);
        });
    }

    document.getElementById("searchResults").style.display = "block";
}

// Function to handle input with debounce (search after user stops typing)
document.getElementById("searchBar").addEventListener("input", function () {
    let query = this.value.trim();
    clearTimeout(debounceTimer); // Clear previous timer
    if (query.length > 0) {
        debounceTimer = setTimeout(() => searchFiles(query), 300); // Delay search by 300ms
    } else {
        document.getElementById("searchResults").style.display = "none";
    }
});

// Close modal when clicking outside
window.onclick = function (event) {
    let resultModal = document.getElementById("searchResults");
    if (event.target == resultModal) {
        resultModal.style.display = "none";
    }
};
