// List of all file pages in the same directory
const filePages = [
    "posts/Korean-Drama-Tamil.html",
    "posts/Anime-English.html",
    "posts/Dubbed-Movie-Series-Tamil.html",
    "posts/Cartoon-Anime-Tamil.html",
    "posts/Tamil-Webseries.html"
    // Add more files here
];

// Function to fetch and search data
function searchFiles(query) {
    let results = [];
    let searchLower = query.toLowerCase().trim(); // Convert query to lowercase

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
                    let linkElement = container.querySelector("a");
                    let languageElement = container.querySelector(".language");

                    let title = titleElement ? titleElement.innerText.trim() : "Unknown Title";
                    let img = imgElement ? imgElement.src : "";
                    let link = linkElement ? linkElement.href : "#";
                    let modalId = linkElement ? linkElement.getAttribute("data-modal-id") : null;
                    let language = languageElement ? languageElement.innerText.replace("Language:", "").trim().toUpperCase() : "UNKNOWN";

                    let titleLower = title.toLowerCase();
                    let languageLower = language.toLowerCase();

                    // TYPE 1 - Direct Download Link (No Modal)
                    if (linkElement && linkElement.href.includes("video=") && !modalId) {
                        results.push({
                            title,
                            img,
                            link,
                            language
                        });
                    }

                    // TYPE 2 & 3 - Modal-based extraction
                    if (modalId) {
                        let modal = doc.getElementById(modalId);
                        if (modal) {
                            let modalLinks = modal.querySelectorAll("a.ad-link"); // Get all download links
                            let subtitles = modal.querySelectorAll("ul li"); // Get all subtitles

                            if (modalLinks.length > 1) {
                                // TYPE 2 - If multiple links exist, treat each separately
                                modalLinks.forEach((modalLink) => {
                                    results.push({
                                        title,
                                        img,
                                        link: modalLink.href,
                                        language
                                    });
                                });
                            } else if (subtitles.length > 0 && modalLinks.length === 1) {
                                // TYPE 3 - If multiple subtitles but one link, show each title separately
                                subtitles.forEach((subtitle) => {
                                    let subtitleText = subtitle.innerText.trim();
                                    results.push({
                                        title: subtitleText,
                                        img,
                                        link: modalLinks[0].href,
                                        language
                                    });
                                });
                            } else if (modalLinks.length === 1) {
                                // Single title, single link (common case)
                                results.push({
                                    title,
                                    img,
                                    link: modalLinks[0].href,
                                    language
                                });
                            }
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
    let resultContainer = document.getElementById("searchResults");
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
                    <div style="text-align: center; flex-grow: 1;">
                        <h4 style="margin: 0;">${item.title}</h4>
                        <p style="margin: 2px 0; font-size: 14px; color: #00FF00; font-weight: bold;">${item.language}</p>
                        <a href="${item.link}" target="_blank" style="color: red; font-weight: bold; font-size: 16px; text-decoration: none;">
                            <span style="color: black;">➥</span> DOWNLOAD
                        </a>
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
        document.getElementById("searchResults").innerHTML = ""; // Clear results
    }
});
