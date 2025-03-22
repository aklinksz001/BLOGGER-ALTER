// List of file pages in the same directory
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
                    let link = linkElement ? linkElement.href : "#";
                    let language = languageElement ? languageElement.innerText.replace("Language: ", "").trim() : "Unknown";

                    let titleLower = title.toLowerCase();
                    let languageLower = language.toLowerCase();

                    if (titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                        results.push({ title, img, link, language });
                    }
                });
            })
            .catch(error => console.error(`Error loading ${page}:`, error))
    );

    Promise.all(fetchPromises).then(() => showResults(results));
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
                <div>
                    <img src="${item.img}" alt="${item.title}" width="100">
                    <div>
                        <h4>${item.title}</h4>
                        <p>Language: ${item.language}</p>
                        <a href="${item.link}" target="_blank">Download</a>
                    </div>
                </div>
            `;
            resultContainer.appendChild(resultItem);
        });
    }
}

// Attach live search functionality
document.getElementById("searchBar").addEventListener("input", function () {
    let query = this.value.trim();
    if (query.length > 0) {
        searchFiles(query);
    } else {
        document.getElementById("resultContainer").innerHTML = "";
    }
});
