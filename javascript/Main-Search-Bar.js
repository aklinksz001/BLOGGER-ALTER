// List of all file pages in the same directory
const filePages = [
    "../posts/Korean-Drama-Tamil.html",
    "../posts/Anime-English.html",
    "../posts/Dubbed-Movie-Series-Tamil.html",
    "../posts/Cartoon-Anime-Tamil.html",
    "../posts/Tamil-Webseries.html"
];

// Function to fetch and search data
function searchFiles(query) {
    let results = [];
    let searchLower = query.toLowerCase().trim();

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
                    let link = linkElement && linkElement.href !== "#" ? linkElement.href : "#";
                    let language = languageElement ? languageElement.innerText.replace("Language: ", "").trim() : "Unknown";

                    let titleLower = title.toLowerCase();
                    let languageLower = language.toLowerCase();

                    // Search by title or language
                    if (titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                        results.push({ title, img, link, language });
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
                    <div>
                        <h4 style="margin: 0;">${item.title}</h4>
                        <p style="margin: 2px 0; font-size: 14px;">Language: ${item.language}</p>
                        <a href="${item.link}" target="_blank" style="color: blue; text-decoration: underline;">Download</a>
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
        document.getElementById("searchResults").innerHTML = "";
    }
});

// Auto-focus search bar and scroll smoothly if redirected
document.addEventListener("DOMContentLoaded", function () {
    if (sessionStorage.getItem("scrollToSearch") === "true") {
        sessionStorage.removeItem("scrollToSearch");
        document.getElementById("searchBar").focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});
