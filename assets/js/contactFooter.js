// Contact Footer JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add click tracking for contact links
    const contactLinks = document.querySelectorAll('.contact-link');
    
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Log contact interaction (optional)
            if (href.startsWith('tel:')) {
                console.log('Phone number clicked:', href.replace('tel:', ''));
            } else if (href.startsWith('mailto:')) {
                console.log('Email clicked:', href.split('?')[0].replace('mailto:', ''));
            }
        });
        
        // Add keyboard accessibility
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Add smooth hover effects
    contactLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
});
