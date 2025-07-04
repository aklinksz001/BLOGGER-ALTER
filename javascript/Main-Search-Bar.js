// List of HTML files in the same directory
const filePages = [
    "../posts/Adult-Movies-Series.html",
    "../posts/Anime-English.html",
    "../posts/Cartoon-Anime-Tamil.html",
    "../posts/Dubbed-Movie-Series-Tamil.html",
    "../posts/Dubbed-Solo-Movies.html",
    "../posts/Filmography.html",
    "../posts/Korean-Drama-Tamil.html",
    "../posts/NEW-HD-PRINT.html",
    "../posts/NEW-THEATRE-PRINT.html",
    "../posts/Special-Shows-Series.html",
    "../posts/Tamil-Webseries.html",
    "../posts/1500-Webseries/0Numbers.html",
"../posts/1500-Webseries/AAA.html",
"../posts/1500-Webseries/BBB.html",
"../posts/1500-Webseries/CCC.html",
"../posts/1500-Webseries/DDD.html",
"../posts/1500-Webseries/EEE.html",
"../posts/1500-Webseries/FFF.html",
"../posts/1500-Webseries/GGG.html",
"../posts/1500-Webseries/HHH.html",
"../posts/1500-Webseries/III.html",
"../posts/1500-Webseries/JJJ.html",
"../posts/1500-Webseries/KKK.html",
"../posts/1500-Webseries/LLL.html",
"../posts/1500-Webseries/MMM.html",
"../posts/1500-Webseries/NNN.html",
"../posts/1500-Webseries/OOO.html",
"../posts/1500-Webseries/PPP.html",
"../posts/1500-Webseries/QQQ.html",
"../posts/1500-Webseries/RRR.html",
"../posts/1500-Webseries/SSS.html",
"../posts/1500-Webseries/TTT.html",
"../posts/1500-Webseries/UUU.html",
"../posts/1500-Webseries/VVV.html",
"../posts/1500-Webseries/WWW.html",
"../posts/1500-Webseries/XXX.html",
"../posts/1500-Webseries/YYY.html",
"../posts/1500-Webseries/ZZZ.html"
];

// Function to fetch and search data
async function searchFiles(query) {
    let results = [];
    let searchLower = query.toLowerCase().trim(); // Convert search query to lowercase

    let fetchPromises = filePages.map(async (page) => {
        try {
            let response = await fetch(page);
            let data = await response.text();
            let parser = new DOMParser();
            let doc = parser.parseFromString(data, "text/html");

            let containers = doc.querySelectorAll(".container");

            containers.forEach(container => {
                let titleElement = container.querySelector(".heading-title");
                let imgElement = container.querySelector("img");
                let linkElement = container.querySelector("a.trigger-modal") || container.querySelector("a[href^='../others/Ads.html']");
                let languageElement = container.querySelector(".language");

                let title = titleElement ? titleElement.innerText.trim() : "Unknown Title";
                let img = imgElement ? imgElement.src : "";
                let language = languageElement ? languageElement.innerText.replace("Language: ", "").trim().toUpperCase() : "UNKNOWN";
                
                let titleLower = title.toLowerCase();
                let languageLower = language.toLowerCase();

                // **Type 1: Direct link (No modal)**
                if (linkElement && !linkElement.classList.contains("trigger-modal")) {
                    let directLink = linkElement.href;
                    if (titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                        results.push({ title, img, link: directLink, language });
                    }
                }

                // **Type 2 & Type 3: Modal links**
                if (linkElement && linkElement.classList.contains("trigger-modal")) {
                    let modalId = linkElement.getAttribute("data-modal-id");
                    let modal = doc.getElementById(modalId);

                    if (modal) {
                        let modalLinks = modal.querySelectorAll("a.ad-link"); // Get all links
                        let subtitleElements = modal.querySelectorAll("ul li"); // Get all subtitles

                        if (modalLinks.length > 1 && subtitleElements.length === 0) {
                            // **Type 2: Multiple links with corresponding subtitles**
                            modalLinks.forEach((modalLink) => {
                                let subtitleText = modalLink.innerText.trim(); // Extract subtitle from link text
                                let subtitleLower = subtitleText.toLowerCase();
                                if (subtitleLower.includes(searchLower) || titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                                    results.push({ title: subtitleText, img, link: modalLink.href, language });
                                }
                            });
                        } else if (subtitleElements.length > 0 && modalLinks.length === 1) {
                            // **Type 3: Show each subtitle separately with the same link**
                            let sharedLink = modalLinks[0].href;

                            // Include **Main Title Separately**
                            if (titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                                results.push({ title, img, link: sharedLink, language });
                            }

                            // Add each subtitle as its own entry
                            subtitleElements.forEach((subtitle) => {
                                let subtitleText = subtitle.innerText.trim();
                                let subtitleLower = subtitleText.toLowerCase();
                                if (subtitleLower.includes(searchLower) || titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                                    results.push({ title: subtitleText, img, link: sharedLink, language });
                                }
                            });
                        } else {
                            // If no subtitles and only one link
                            if (titleLower.includes(searchLower) || languageLower.includes(searchLower)) {
                                results.push({ title, img, link: modalLinks.length > 0 ? modalLinks[0].href : "#", language });
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error(`Error loading ${page}:`, error);
        }
    });

    await Promise.all(fetchPromises);
    showResults(results);
}

// Function to display search results directly below search bar
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
