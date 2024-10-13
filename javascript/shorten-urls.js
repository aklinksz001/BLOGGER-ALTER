
// Your configuration variables
var app_url = 'https://omegalinks.in/';
var app_api_token = '089f3662f187f47f1cc3f38b8e41bd71edc7da6b';
var app_advert = 2;
var app_exclude_domains = ["Google.com"];

// Dynamically load the external script
var script = document.createElement('script');
script.src = '//omegalinks.in/js/full-page-script.js';
document.head.appendChild(script);
