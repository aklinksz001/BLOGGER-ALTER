document.getElementById('searchBar').addEventListener('input', function() {
            var query = this.value.toLowerCase();
            var containers = document.querySelectorAll('.container');
            
            containers.forEach(function(container) {
                var heading = container.querySelector('.heading-title').textContent.toLowerCase();
                var id = container.id;

                if (heading.includes(query)) {
                    container.classList.remove('hidden');
                    if (container.scrollIntoView) {
                        container.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    container.classList.add('hidden');
                }
            });
        });
