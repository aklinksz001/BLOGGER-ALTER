
        document.addEventListener("DOMContentLoaded", function() {
            var placeholder = 'aklinksz.fun';
            var regexPlaceholder = /{{STREAMLINK}}/g;

            // Function to replace text in attributes
            function replaceInAttributes(attrValue) {
                return attrValue.replace(regexPlaceholder, placeholder);
            }

            // Replace in all elements' attributes
            document.querySelectorAll('*').forEach(function(element) {
                ['href', 'src', 'data-url'].forEach(function(attr) {
                    if (element.hasAttribute(attr)) {
                        var attrValue = element.getAttribute(attr);
                        var updatedValue = replaceInAttributes(attrValue);
                        element.setAttribute(attr, updatedValue);
                    }
                });
            });

            // Replace in inline scripts
            document.querySelectorAll('script').forEach(function(script) {
                if (script.textContent) {
                    script.textContent = replaceInAttributes(script.textContent);
                }
            });
        });
