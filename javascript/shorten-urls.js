document.addEventListener('DOMContentLoaded', async function() {
    async function shortenUrl(url) {
        const apiToken = '17950084501a0650a1be53be2dc8437fa202f0ce';
        const encodedUrl = encodeURIComponent(url);
        const apiUrl = `https://modijiurl.com/api?api=${apiToken}&url=${encodedUrl}`;
        
        try {
            const response = await fetch(apiUrl);
            const result = await response.json();
            if (result.status === 'success') {
                return result.shortenedUrl;
            } else {
                console.error('Error shortening URL:', result.message);
                return url;
            }
        } catch (error) {
            console.error('Error:', error);
            return url;
        }
    }

    const links = document.querySelectorAll('a');
    for (const link of links) {
        const originalUrl = link.href;
        try {
            const shortenedUrl = await shortenUrl(originalUrl);
            link.href = shortenedUrl;
        } catch (error) {
            console.error('Failed to shorten URL for', originalUrl, error);
        }
    }
});
