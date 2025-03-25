// List of all file pages in the same directory
const filePages = [
    "../posts/Korean-Drama-Tamil.html",
    "../posts/Anime-English.html",
    "../posts/Dubbed-Movie-Series-Tamil.html",
    "../posts/Cartoon-Anime-Tamil.html",
    "../posts/Tamil-Webseries.html",
];

// Function to normalize text by removing spaces, hyphens, and underscores
function normalizeText(text) {
    return text.toLowerCase().replace(/[\s-_]+/g, "");
}

// Function to fetch and search data
function searchFiles(query) {
    let results = [];
    let searchNormalized = normalizeText(query.trim()); // Normalize search query

    let fetchPromises = filePages.map(page =>
        fetch(page)
            .then(response => response.text())
            .then(data => {
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

                    let titleNormalized = normalizeText(title); // Normalize title for comparison
                    let languageNormalized = normalizeText(language);

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

                    // Match query with title or language
                    if (titleNormalized.includes(searchNormalized) || languageNormalized.includes(searchNormalized)) {
                        results.push({ title, img, link, language });
                    }

                    // Check subtitles inside modal
                    if (modalId) {
                        let modal = doc.getElementById(modalId);
                        if (modal) {
                            let subtitles = modal.querySelectorAll("ul li");
                            subtitles.forEach(subtitle => {
                                let subtitleText = subtitle.innerText.trim();
                                let subtitleNormalized = normalizeText(subtitleText);
                                if (subtitleNormalized.includes(searchNormalized)) {
                                    results.push({ title: subtitleText, img, link, language });
                                }
                            });
                        }
                    }
                });
            })
            .catch(error => console.error(`Error loading ${page}:`, error))
    );

    // After all fetch requests complete, show results
    Promise.all(fetchPromises).then(() => showResults(results));
}

// Function to display search results
function showResults(results) {
    let resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = ""; // Clear previous results

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
                        <p style="margin: 2px 0; font-size: 14px;"><strong style="color: #000;">LANGUAGE:</strong> <span style="color: #00FF00;">${item.language}</span></p>
                        <a href="${item.link}" target="_blank" style="color: red; text-decoration: none; font-weight: bold;">➥ DOWNLOAD</a>
                    </div>
                </div>
            `;
            resultContainer.appendChild(resultItem);
        });
    }
}

// Attach search function to input field
document.getElementById("searchBar").addEventListener("input", function () {
    let query = this.value.trim();
    if (query.length > 0) {
        searchFiles(query);
    } else {
        document.getElementById("searchResults").style.display = "none";
    }
});
