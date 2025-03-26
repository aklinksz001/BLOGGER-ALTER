// List of all file pages in the same directory
const filePages = [
    "../posts/Korean-Drama-Tamil.html",
    "../posts/Anime-English.html",
    "../posts/Dubbed-Solo-Movies.html",
    "../posts/Cartoon-Anime-Tamil.html",
    "../posts/Tamil-Webseries.html",
    // Add more files here
];

// Default image for Type 4
const defaultImage = "https://raw.githubusercontent.com/Alex27ak/Img-Collections/main/Files/6Zz3iCPe.jpeg";

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
                    let titleLinkElement = container.querySelector("a.Title-Link"); // Type 4

                    let title = titleElement ? titleElement.innerText.trim() : null;
                    let img = imgElement ? imgElement.src : "";
                    let language = languageElement ? languageElement.innerText.replace("Language: ", "").trim() : "Unknown";
                    let titleLower = title ? title.toLowerCase() : "";
                    let languageLower = language.toLowerCase();

                    // Handling Type 4 (Direct title link)
                    if (titleLinkElement) {
                        let titleText = titleLinkElement.innerText.trim();
                        let link = titleLinkElement.href;
                        results.push({
                            title: titleText.toUpperCase(),
                            img: defaultImage,
                            link: link,
                            language: "UNKNOWN"
                        });
                    }

                    // Type 1: Single title with direct link
                    if (!linkElement && titleElement) {
                        let directLinkElement = container.querySelector("a[href]");
                        if (directLinkElement) {
                            let directLink = directLinkElement.href;
                            results.push({
                                title: title.toUpperCase(),
                                img: img,
                                link: directLink,
                                language: language.toUpperCase()
                            });
                        }
                    }

                    // Type 2 & 3: Titles inside modal
                    if (linkElement) {
                        let modalId = linkElement.getAttribute("data-modal-id");
                        let link = "#";
                        if (modalId) {
                            let modal = doc.getElementById(modalId);
                            if (modal) {
                                let modalLinks = modal.querySelectorAll("a.ad-link");
                                let subtitles = modal.querySelectorAll("ul li");
                                
                                // Type 2: Multiple links with different subtitles
                                if (modalLinks.length > 1) {
                                    modalLinks.forEach((modalLink, index) => {
                                        let subtitleText = modalLink.innerText.trim();
                                        let link = modalLink.href;
                                        results.push({
                                            title: subtitleText.toUpperCase(),
                                            img: img,
                                            link: link,
                                            language: language.toUpperCase()
                                        });
                                    });
                                } 
                                // Type 3: Multiple subtitles with same link
                                else if (modalLinks.length === 1) {
                                    let singleLink = modalLinks[0].href;
                                    results.push({
                                        title: title.toUpperCase(), // Include main title
                                        img: img,
                                        link: singleLink,
                                        language: language.toUpperCase()
                                    });

                                    subtitles.forEach(subtitle => {
                                        let subtitleText = subtitle.innerText.trim();
                                        results.push({
                                            title: subtitleText.toUpperCase(),
                                            img: img,
                                            link: singleLink,
                                            language: language.toUpperCase()
                                        });
                                    });
                                }
                            }
                        }
                    }

                    // Search match check
                    if (titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                        results.push({
                            title: title.toUpperCase(),
                            img: img,
                            link: "#",
                            language: language.toUpperCase()
                        });
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
                <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ddd;">
                    <img src="${item.img}" alt="${item.title}" width="100" style="border-radius: 5px; margin-bottom: 10px;">
                    <h4 style="margin: 0;">${item.title}</h4>
                    <p style="margin: 2px 0; font-size: 14px; font-weight: bold; color: #00FF00;">${item.language}</p>
                    <a href="${item.link}" target="_blank" style="color: red; font-weight: bold; font-size: 16px; text-decoration: none;">
                        <span style="color: black;">➥</span> DOWNLOAD
                    </a>
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
        document.getElementById("resultContainer").innerHTML = "";
    }
});
