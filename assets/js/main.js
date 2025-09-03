document.addEventListener("DOMContentLoaded", () => {
  // --- Reusable Component Loader ---
  const loadComponent = (componentPath, placeholderId, callback = null) => {
    fetch(componentPath)
      .then((response) => (response.ok ? response.text() : Promise.reject("Component not found.")))
      .then((data) => {
        document.getElementById(placeholderId).innerHTML = data
        if (callback) callback()
      })
      .catch((error) => console.error(`Error loading ${placeholderId}:`, error))
  }

  // Load navbar first and initialize it
  loadComponent("/components/navbar.html", "navbar-placeholder", initializeNavbar)
  loadComponent("/components/contactFooter.html", "footer-placeholder")

  function initializeNavbar() {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById("mobile-menu-button")
    const navLinks = document.getElementById("nav-links")

    if (mobileMenuButton && navLinks) {
      mobileMenuButton.addEventListener("click", (e) => {
        e.preventDefault()
        navLinks.classList.toggle("active")
        mobileMenuButton.classList.toggle("active")
      })
    }

    // Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll(".dropdown")

    dropdowns.forEach((dropdown) => {
      const dropdownToggle = dropdown.querySelector(".dropdown-toggle")

      if (dropdownToggle) {
        dropdownToggle.addEventListener("click", (e) => {
          // Only prevent default and toggle on mobile
          if (window.innerWidth <= 992) {
            e.preventDefault()
            dropdown.classList.toggle("active")

            // Close other dropdowns
            dropdowns.forEach((otherDropdown) => {
              if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove("active")
              }
            })
          }
        })
      }
    })

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".main-nav")) {
        navLinks?.classList.remove("active")
        mobileMenuButton?.classList.remove("active")

        // Close all mobile dropdowns
        dropdowns.forEach((dropdown) => {
          dropdown.classList.remove("active")
        })
      }
    })

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) {
        navLinks?.classList.remove("active")
        mobileMenuButton?.classList.remove("active")

        // Close all mobile dropdowns
        dropdowns.forEach((dropdown) => {
          dropdown.classList.remove("active")
        })
      }
    })
  }

  initializeFacilityModal()
  handleContactForm()
})

function initializeFacilityModal() {
  // Initialize modal functionality for facility images
  const modal = document.getElementById('facilityImageModal');
  const modalImg = document.getElementById('facilityModalImage');
  const closeBtn = modal?.querySelector('.close-modal');

  if (!modal || !modalImg || !closeBtn) return;

  // Close modal when clicking the close button
  closeBtn.addEventListener('click', closeFacilityModal);

  // Close modal when clicking outside the image
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeFacilityModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeFacilityModal();
    }
  });
}

function openFacilityModal(imgSrc, altText) {
  const modal = document.getElementById('facilityImageModal');
  const modalImg = document.getElementById('facilityModalImage');
  
  if (!modal || !modalImg) return;
  
  modalImg.src = imgSrc;
  modalImg.alt = altText;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeFacilityModal() {
  const modal = document.getElementById('facilityImageModal');
  const modalImg = document.getElementById('facilityModalImage');
  
  if (!modal || !modalImg) return;
  
  modal.classList.remove('show');
  document.body.style.overflow = ''; // Restore scrolling
  setTimeout(() => {
    modalImg.src = ''; // Clear the source after animation
  }, 300);
}

function redirectToProduct(productType) {
  // Redirect to respective product pages
  switch (productType) {
    case "capsules":
      window.location.href = "pages/products/capsules.html"
      break
    case "tablets":
      window.location.href = "pages/products/tablets.html"
      break
    case "sachets":
      window.location.href = "pages/products/sachets.html"
      break
    case "syrups":
      window.location.href = "pages/products/syrups.html"
      break
    default:
      console.log("Product page not found")
  }
}

function downloadBrochure() {
  // Create a temporary link element to trigger download
  const link = document.createElement("a")
  link.href = "/assets/pdf/brochure.pdf"
  link.download = "Trugen-Pharmaceuticals-Brochure.pdf"
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadProductList(type) {
  const link = document.createElement("a")
  if (type === 'domestic') {
    link.href = "/assets/pdf/domestic-product.pdf"
    link.download = "Trugen-Domestic-Product-List.pdf"
  } else {
    link.href = "/assets/pdf/export-product.pdf"
    link.download = "Trugen-Export-Product-List.pdf"
  }
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleContactForm() {
  const contactForm = document.getElementById("contactForm")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(contactForm)
      const name = formData.get("name")
      const number = formData.get("number")
      const company = formData.get("company")
      const products = formData.get("products")
      const message = formData.get("message")

      // Basic validation
      if (!name || !number || !products || !message) {
        alert("Please fill in all required fields.")
        return
      }

      // Create email body
      const emailBody = `Name: ${name}%0D%0APhone: ${number}%0D%0ACompany: ${company || "Not specified"}%0D%0AProduct Interest: ${products}%0D%0AMessage: ${message}`

      // Create mailto link
      const mailtoLink = `mailto:query@trugenpharma.com?subject=Contact Form Inquiry from ${name}&body=${emailBody}`

      // Open email client
      window.location.href = mailtoLink

      // Show success message
      alert("Thank you for your inquiry! Your email client will open to send the message.")

      // Reset form
      contactForm.reset()
    })
  }
}
