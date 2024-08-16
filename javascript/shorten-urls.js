<script type="text/javascript">
        var app_url = 'https://modijiurl.com/';
        var app_api_token = '17950084501a0650a1be53be2dc8437fa202f0ce';
        var app_advert = 2;
        var app_exclude_domains = ["Google.com"];

        function handleLinkClick(event) {
            // Prevent default link behavior
            event.preventDefault();
            var targetUrl = event.currentTarget.getAttribute('data-url');
            
            // Logic to handle URL redirection
            if (app_exclude_domains.some(domain => targetUrl.includes(domain))) {
                console.log('Domain is excluded.');
                return;
            }
            
            // Perform redirection
            window.location.href = targetUrl;
        }
    </script>

<script src='//modijiurl.com/js/full-page-script.js'></script>
