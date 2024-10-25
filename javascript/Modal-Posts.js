document.addEventListener('DOMContentLoaded', function() {
        // Function to open the modal
        function openModal(modalId) {
            var modal = document.getElementById(modalId);
            modal.style.display = "flex"; // Display the modal
        }

        // Function to close the modal
        function closeModal(modal) {
            modal.style.display = "none"; // Hide the modal
        }

        // Attach click event to all elements with class 'trigger-modal'
        var triggerModals = document.querySelectorAll('.trigger-modal');
        triggerModals.forEach(function(trigger) {
            trigger.onclick = function(event) {
                event.preventDefault(); // Prevent default action
                var modalId = this.getAttribute('data-modal-id');
                openModal(modalId);
            };
        });

        // Attach click event to all close buttons
        var closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(function(closeButton) {
            closeButton.onclick = function() {
                var modal = this.closest('.modal');
                closeModal(modal);
            };
        });

        // Close the modal when clicking outside of it
        window.onclick = function(event) {
            var modals = document.querySelectorAll('.modal');
            modals.forEach(function(modal) {
                if (event.target == modal) {
                    closeModal(modal);
                }
            });
        };
    });
