document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionContent = header.nextElementSibling;
            const isActive = header.classList.contains('active');
            
            // Close all accordions
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.classList.remove('active');
                }
            });
            
            // Toggle current accordion
            header.classList.toggle('active');
            accordionContent.classList.toggle('active');
            
            // Set max-height for animation
            if (!isActive) {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
            } else {
                accordionContent.style.maxHeight = "0px";
            }
        });
    });
    
    // Open first accordion by default
    if (accordionHeaders.length > 0) {
        accordionHeaders[0].click();
    }
});
