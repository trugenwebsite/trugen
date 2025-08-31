document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionContent = header.nextElementSibling;
            const isActive = header.classList.contains('active');
            
            // First remove active class and reset max-height on all accordions
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.classList.remove('active');
                    const otherContent = otherHeader.nextElementSibling;
                    otherContent.classList.remove('active');
                    otherContent.style.maxHeight = null;
                }
            });
            
            // Toggle current accordion with a slight delay to ensure smooth transition
            if (!isActive) {
                header.classList.add('active');
                accordionContent.classList.add('active');
                // Set max-height to scrollHeight to enable animation
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
            } else {
                header.classList.remove('active');
                accordionContent.classList.remove('active');
                accordionContent.style.maxHeight = null;
            }
        });
    });
    
    // Open first accordion by default after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (accordionHeaders.length > 0) {
            accordionHeaders[0].click();
        }
    }, 100);
});
