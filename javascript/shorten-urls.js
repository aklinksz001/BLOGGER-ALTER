// shorten-urls.js

var app_url = 'https://modijiurl.com/';
var app_api_token = '17950084501a0650a1be53be2dc8437fa202f0ce';
var app_advert = 2;
var app_exclude_domains = ["Google.com"];

function shortenAndRedirect(event) {
    event.preventDefault(); // Prevent the default action

    var originalUrl = event.currentTarget.href;
    var excludeDomains = app_exclude_domains.map(domain => domain.toLowerCase());

    // Check if the original URL's domain is in the exclude list
    var domain = new URL(originalUrl).hostname.toLowerCase();
    if (excludeDomains.includes(domain)) {
        window.location.href = originalUrl; // Directly go to the original URL
    } else {
        // Construct the shortener URL with parameters
        var shortenedUrl = app_url + 'api?api=' + app_api_token + '&url=' + encodeURIComponent(originalUrl) + '&advert=' + app_advert;
        window.location.href = shortenedUrl; // Redirect to the shortened URL
    }
}

// Attach the event listener to all anchor tags once the page loads
document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('a');
    links.forEach(function (link) {
        link.addEventListener('click', shortenAndRedirect);
    });
});
