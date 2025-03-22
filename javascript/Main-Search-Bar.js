const FilesPages = [
    { url: "pages/Anime-English.html", category: "Anime", language: "English" },
    { url: "pages/Anime-Japanese.html", category: "Anime", language: "Japanese" },
    { url: "pages/Anime-Hindi.html", category: "Anime", language: "Hindi" },
    { url: "pages/Movies-English.html", category: "Movies", language: "English" },
    { url: "pages/Movies-Hindi.html", category: "Movies", language: "Hindi" },
    { url: "pages/WebSeries.html", category: "Web Series", language: "Mixed" },
    { url: "pages/Cartoons.html", category: "Cartoons", language: "English" },
    { url: "pages/Dramas.html", category: "Dramas", language: "Mixed" }
];

let filesData = [];

// Function to Fetch Data from All Files
async function fetchFilesData() {
    let requests = FilesPages.map(file =>
        fetch(file.url).then(response => response.text().then(html => ({ html, file })))
    );

    let pages = await Promise.all(requests);

    pages.forEach(({ html, file }) => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        let containers = doc.querySelectorAll(".container");

        containers.forEach(container => {
            let titleElement = container.querySelector(".heading-title");
            let imageElement = container.querySelector("img");
            let linkElement = container.querySelector("a");

            if (titleElement && imageElement && linkElement) {
                filesData.push({
                    title: titleElement.innerText,
                    image: imageElement.src,
                    link: file.url,  // Link to respective page
                    category: file.category,
                    language: file.language
                });
            }
        });
    });
}

// Function to Search and Display Results
function searchFiles() {
    let query = document.getElementById("searchBar").value.toLowerCase();
    let searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = ""; // Clear previous results

    let filteredResults = filesData.filter(file => file.title.toLowerCase().includes(query));

    if (filteredResults.length === 0) {
        searchResults.innerHTML = "<p>No results found</p>";
        return;
    }

    filteredResults.forEach(file => {
        let resultHTML = `
            <div class="search-item">
                <a href="${file.link}" target="_blank" class="search-link">
                    <img src="${file.image}" alt="${file.title}" class="search-img">
                    <div class="search-info">
                        <h4>${file.title}</h4>
                        <p class="category-tag">${file.category}</p>
                        <p class="language-tag">${file.language}</p>
                    </div>
                </a>
            </div>
        `;
        searchResults.innerHTML += resultHTML;
    });
}

// Fetch Data Once at Start
fetchFilesData();
