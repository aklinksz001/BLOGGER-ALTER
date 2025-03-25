// List of all file pages in the same directory
const filePages = [
    "../posts/Korean-Drama-Tamil.html",
    "../posts/Anime-English.html",
    "../posts/Dubbed-Movie-Series-Tamil.html",
    "../posts/Cartoon-Anime-Tamil.html",
    "../posts/Tamil-Webseries.html"
];

// Inject CSS dynamically
const style = document.createElement("style");
style.innerHTML = `
    .result-item {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 10px;
    }
    .result-item img {
        border-radius: 5px;
        margin-right: 10px;
        width: 100px;
    }
    .result-item div {
        text-align: center;
    }
    .result-item h4 {
        margin: 0;
        text-transform: uppercase;
    }
    .result-item p {
        margin: 2px 0;
        font-size: 14px;
        color: #00FF00;
        font-weight: bold;
    }
    .result-item a {
        text-decoration: none;
        font-weight: bold;
        color: red;
    }
    .result-item a span {
        color: black;
    }
`;
document.head.appendChild(style);

// Function to fetch and search data
async function searchFiles(query) {
    let results = [];
    let searchLower = query.toLowerCase().trim();

    if (searchLower.length === 0) {
        showResults([]); // Clear results if query is empty
        return;
    }

    let fetchPromises = filePages.map(async (page) => {
        try {
            let response = await fetch(page);
            let data = await response.text();
            let parser = new DOMParser();
            let doc = parser.parseFromString(data, "text/html");

            let containers = doc.querySelectorAll(".container");
            containers.forEach((container) => {
                let titleElement = container.querySelector(".heading-title");
                let imgElement = container.querySelector("img");
                let linkElement = container.querySelector("a.trigger-modal, a:not(.trigger-modal)");
                let languageElement = container.querySelector(".language");

                let title = titleElement ? titleElement.innerText.trim() : "Unknown Title";
                let img = imgElement ? imgElement.src : "";
                let link = linkElement ? linkElement.href : "#";
                let language = languageElement ? languageElement.innerText.replace("Language: ", "").trim() : "Unknown";

                let titleLower = title.toLowerCase();
                let languageLower = language.toLowerCase();

                let modalId = linkElement?.getAttribute("data-modal-id");
                if (modalId) {
                    let modal = doc.getElementById(modalId);
                    if (modal) {
                        let modalLinks = modal.querySelectorAll("a.ad-link");
                        let subtitles = modal.querySelectorAll("ul li");

                        if (subtitles.length > 0) {
                            results.push({ title, img, link: modalLinks[0]?.href || "#", language });

                            subtitles.forEach((subtitle) => {
                                let subtitleText = subtitle.innerText.trim();
                                results.push({ title: subtitleText, img, link: modalLinks[0]?.href || "#", language });
                            });
                        } else {
                            modalLinks.forEach((modalLink) => {
                                let linkText = modalLink.innerText.trim();
                                results.push({ title: linkText, img, link: modalLink.href, language });
                            });
                        }
                    }
                } else {
                    results.push({ title, img, link, language });
                }
            });
        } catch (error) {
            console.error(`Error loading ${page}:`, error);
        }
    });

    await Promise.all(fetchPromises);
    showResults(results);
}

// Function to display search results
function showResults(results) {
    let resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = ""; // Clear previous results

    if (results.length === 0) {
        resultContainer.innerHTML = "<p>No results found</p>";
        return;
    }

    results.forEach((item) => {
        let resultItem = document.createElement("div");
        resultItem.classList.add("result-item");
        resultItem.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ddd;">
                <img src="${item.img}" alt="${item.title}" width="100" style="border-radius: 5px; margin-right: 10px;">
                <div style="text-align: center;">
                    <h4 style="margin: 0;">${item.title.toUpperCase()}</h4>
                    <p style="margin: 2px 0; font-size: 14px;"><strong style="color: #00FF00;">${item.language.toUpperCase()}</strong></p>
                    <a href="${item.link}" target="_blank" style="color: red; text-decoration: none; font-weight: bold;">
                        <span style="color: black;">➥</span> DOWNLOAD
                    </a>
                </div>
            </div>
        `;
        resultContainer.appendChild(resultItem);
    });
}

// Attach search function to input field
document.getElementById("searchBar").addEventListener("input", function () {
    let query = this.value.trim();
    if (query.length > 0) {
        searchFiles(query);
    } else {
        document.getElementById("resultContainer").innerHTML = "";
    }
});
