document.addEventListener("DOMContentLoaded", function() {
  
  // --- Reusable Component Loader ---
  const loadComponent = (componentPath, placeholderId) => {
    fetch(componentPath)
      .then(response => response.ok ? response.text() : Promise.reject('Component not found.'))
      .then(data => {
        document.getElementById(placeholderId).innerHTML = data;
      })
      .catch(error => console.error(`Error loading ${placeholderId}:`, error));
  };

  loadComponent('components/navbar.html', 'navbar-placeholder');
  loadComponent('components/contactFooter.html', 'footer-placeholder');

  
  // --- Mobile Menu Toggle ---
  // We need to wait for the navbar to be loaded before we can add event listeners to its buttons.
  // A simple way is to use a small delay. A more robust way involves Mutation Observers, but this is simpler and effective.
  setTimeout(() => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuButton && navLinks) {
      mobileMenuButton.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  }, 500); // Wait 500ms for components to load
});