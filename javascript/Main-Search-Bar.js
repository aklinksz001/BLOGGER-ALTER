// List of all file pages in the same directory
const filePages = [
    "../posts/Korean-Drama-Tamil.html",
    "../posts/Anime-English.html",
    "../posts/Dubbed-Movie-Series-Tamil.html",
    "../posts/Cartoon-Anime-Tamil.html",
    "../posts/Tamil-Webseries.html",
    // Add more files here
];

// Default thumbnail for missing images
const defaultThumbnail = "https://raw.githubusercontent.com/Alex27ak/Img-Collections/main/Files/6Zz3iCPe.jpeg";

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
                    let linkElement = container.querySelector("a.trigger-modal");
                    let languageElement = container.querySelector(".language");

                    let title = titleElement ? titleElement.innerText.trim() : "Unknown Title";
                    let img = imgElement ? imgElement.src : defaultThumbnail;
                    let modalId = linkElement ? linkElement.getAttribute("data-modal-id") : null;
                    let language = languageElement ? languageElement.innerText.replace("Language: ", "").trim() : "Unknown";

                    let titleLower = title.toLowerCase();
                    let languageLower = language.toLowerCase();

                    // Type 1: Direct link (No modal)
                    if (!modalId) {
                        let directLink = container.querySelector("a") ? container.querySelector("a").href : "#";
                        if (titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                            results.push({ title, img, link: directLink, language });
                        }
                    }

                    // Type 2 & 3: Modal-based content
                    if (modalId) {
                        let modal = doc.getElementById(modalId);
                        if (modal) {
                            let modalLinks = modal.querySelectorAll("a.ad-link");
                            let subtitles = modal.querySelectorAll("ul li");

                            if (modalLinks.length > 0) {
                                // Type 2: Each link has its own subtitle
                                modalLinks.forEach(link => {
                                    let subtitleText = link.innerText.trim().replace("➥", "").trim();
                                    if (subtitleText.toLowerCase().includes(searchLower)) {
                                        results.push({ title: subtitleText, img, link: link.href, language });
                                    }
                                });
                            } else if (subtitles.length > 0) {
                                // Type 3: Multiple subtitles but one download link
                                let singleLink = modal.querySelector("a.ad-link") ? modal.querySelector("a.ad-link").href : "#";
                                
                                // Add the main title first
                                if (titleLower.includes(searchLower)) {
                                    results.push({ title, img, link: singleLink, language });
                                }

                                // Add all subtitles separately
                                subtitles.forEach(subtitle => {
                                    let subtitleText = subtitle.innerText.trim();
                                    if (subtitleText.toLowerCase().includes(searchLower)) {
                                        results.push({ title: subtitleText, img, link: singleLink, language });
                                    }
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
                        <h4 style="margin: 0;">${item.title.toUpperCase()}</h4>
                        <p style="margin: 2px 0; font-size: 14px;">
                            <strong style="color: black;">LANGUAGE: </strong>
                            <span style="color: #00FF00;">${item.language.toUpperCase()}</span>
                        </p>
                        <a href="${item.link}" target="_blank" style="color: red; text-decoration: none; font-weight: bold;">
                            <span style="color: black;">➥</span> DOWNLOAD
                        </a>
                    </div>
                </div>
            `;
            resultContainer.appendChild(resultItem);
        });
    }

    document.getElementById("searchResults").style.display = "block"; // Show results container
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

// Close results when clicking outside
window.onclick = function (event) {
    let resultModal = document.getElementById("searchResults");
    if (event.target == resultModal) {
        resultModal.style.display = "none";
    }
};
