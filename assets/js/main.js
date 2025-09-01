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

  initializeCarousel()
  handleContactForm()
})

let currentSlide = 0
let carouselInterval
let totalImages = 0

function initializeCarousel() {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  // Get total number of images
  const images = track.querySelectorAll(".carousel-image")
  totalImages = images.length
  
  console.log("Total images found:", totalImages)

  // Initialize modal functionality
  const modal = document.getElementById('carouselImageModal');
  const modalImg = document.getElementById('carouselModalImage');
  const closeBtn = modal?.querySelector('.close-modal');

  // Function to open modal
  function openModal(imgSrc, altText) {
    if (modal && modalImg) {
      modalImg.src = imgSrc;
      modalImg.alt = altText;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  // Function to close modal
  function closeModal() {
    if (modal && modalImg) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      setTimeout(() => {
        modalImg.src = '';
      }, 300);
    }
  }

  // Add click event to carousel images
  if (track) {
    track.addEventListener('click', (e) => {
      const img = e.target.closest('.carousel-image');
      if (img) {
        openModal(img.src, img.alt);
      }
    });
  }

  // Modal event listeners
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('show')) {
      closeModal();
    }
  });

  // Initialize carousel
  updateCarouselDisplay()
  startCarouselAutoPlay()

  // Handle window resize
  let resizeTimeout
  window.addEventListener("resize", () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      // Reset to first slide on resize to avoid issues
      currentSlide = 0
      updateCarouselDisplay()
    }, 150)
  })
}

function updateCarouselDisplay() {
  const track = document.getElementById("carouselTrack")
  const prevBtn = document.querySelector('.prev-btn')
  const nextBtn = document.querySelector('.next-btn')
  
  if (!track || totalImages === 0) return

  const imagesPerView = getImagesPerView()
  const maxSlide = Math.max(0, totalImages - imagesPerView)
  
  // Ensure currentSlide is within bounds
  currentSlide = Math.max(0, Math.min(currentSlide, maxSlide))
  
  console.log("Current slide:", currentSlide, "Max slide:", maxSlide, "Images per view:", imagesPerView)

  // Calculate transform
  const slideWidth = 100 / imagesPerView
  const translateX = currentSlide * slideWidth
  track.style.transform = `translateX(-${translateX}%)`
  
  // Update navigation buttons
  if (prevBtn && nextBtn) {
    const isAtStart = currentSlide === 0
    const isAtEnd = currentSlide >= maxSlide
    
    prevBtn.disabled = isAtStart
    nextBtn.disabled = isAtEnd
    
    prevBtn.style.opacity = isAtStart ? "0.5" : "1"
    nextBtn.style.opacity = isAtEnd ? "0.5" : "1"
    
    console.log("Navigation - At start:", isAtStart, "At end:", isAtEnd)
  }
}

function changeSlide(direction) {
  if (totalImages === 0) return
  
  const imagesPerView = getImagesPerView()
  const maxSlide = Math.max(0, totalImages - imagesPerView)
  
  // Stop auto-play when user manually controls
  stopCarouselAutoPlay()
  
  // Calculate new slide position
  const newSlide = currentSlide + direction
  
  // Ensure we stay within bounds
  if (newSlide >= 0 && newSlide <= maxSlide) {
    currentSlide = newSlide
    updateCarouselDisplay()
  }
  
  console.log("Change slide direction:", direction, "New slide:", currentSlide)
  
  // Restart auto-play after delay
  setTimeout(startCarouselAutoPlay, 3000)
}

function startCarouselAutoPlay() {
  stopCarouselAutoPlay()
  carouselInterval = setInterval(() => {
    if (totalImages === 0) return
    
    const imagesPerView = getImagesPerView()
    const maxSlide = Math.max(0, totalImages - imagesPerView)
    
    if (currentSlide >= maxSlide) {
      // Reset to beginning for continuous loop
      currentSlide = 0
    } else {
      currentSlide++
    }
    
    updateCarouselDisplay()
  }, 4000)
}

function stopCarouselAutoPlay() {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
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

function getImagesPerView() {
  if (window.innerWidth <= 480) return 1
  if (window.innerWidth <= 768) return 2
  return 4
}
