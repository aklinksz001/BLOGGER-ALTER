// Attach click event to all elements with class 'trigger-popup'
var triggerPopups = document.querySelectorAll('.trigger-popup');
triggerPopups.forEach(function(trigger) {
    trigger.onclick = function(event) {
        event.preventDefault(); // Prevent default action
        var popupId = this.getAttribute('data-popup-id');
        var popup = document.getElementById(popupId);
        popup.style.display = "block";

        // Close the popup when clicking on the close button
        var closePopup = popup.getElementsByClassName('close')[0];
        closePopup.onclick = function() {
            popup.style.display = "none";
        };

        // Close the popup when clicking outside of it
        window.onclick = function(event) {
            if (event.target == popup) {
                popup.style.display = "none";
            }
        };
    };
});
