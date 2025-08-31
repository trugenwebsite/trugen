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

    console.log("[v0] Mobile menu button:", mobileMenuButton)
    console.log("[v0] Nav links:", navLinks)

    if (mobileMenuButton && navLinks) {
      mobileMenuButton.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("[v0] Mobile menu button clicked")
        navLinks.classList.toggle("active")
        mobileMenuButton.classList.toggle("active")
        console.log("[v0] Nav links active:", navLinks.classList.contains("active"))
      })
    } else {
      console.error("[v0] Mobile menu elements not found")
    }

    // Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll(".dropdown")
    console.log("[v0] Found dropdowns:", dropdowns.length)

    dropdowns.forEach((dropdown) => {
      const dropdownToggle = dropdown.querySelector(".dropdown-toggle")

      if (dropdownToggle) {
        dropdownToggle.addEventListener("click", (e) => {
          // Only prevent default and toggle on mobile
          if (window.innerWidth <= 992) {
            e.preventDefault()
            console.log("[v0] Mobile dropdown clicked")
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
let allImages = [] // Store all images for filtering
let filteredImages = [] // Store currently filtered images

function initializeCarousel() {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  // Initialize modal functionality
  const modal = document.getElementById('carouselImageModal');
  const modalImg = document.getElementById('carouselModalImage');
  const closeBtn = modal.querySelector('.close-modal');

  // Function to open modal
  function openModal(imgSrc, altText) {
    modalImg.src = imgSrc;
    modalImg.alt = altText;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  // Function to close modal
  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
    setTimeout(() => {
      modalImg.src = ''; // Clear the source after animation
    }, 300);
  }

  // Add click event to carousel images
  track.addEventListener('click', (e) => {
    const img = e.target.closest('.carousel-image');
    if (img) {
      openModal(img.src, img.alt);
    }
  });

  // Close modal when clicking the close button
  closeBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside the image
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  // Initialize Intersection Observer for lazy loading
  const carouselSection = document.querySelector('.carousel-section')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Initialize carousel only when it's visible
          initializeCarouselContent()
          initializeFilteredImages() // Initialize all images as filtered
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  if (carouselSection) {
    observer.observe(carouselSection)
  }
}

function initializeCarouselContent() {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  // Pre-load only visible images initially
  const imagesPerView = getImagesPerView()
  allImages = Array.from(track.querySelectorAll(".carousel-image"))
  
  // Set display: none for non-visible images initially
  allImages.forEach((img, index) => {
    if (index >= imagesPerView) {
      img.style.display = 'none'
    }
  })

  filteredImages = [...allImages]

  // Start auto-increment
  startCarouselAutoPlay()

  // Optimize resize handler with debounce
  let resizeTimeout
  window.addEventListener("resize", () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      const newImagesPerView = getImagesPerView()
      updateCarouselPosition(newImagesPerView)
    }, 150)
  })
}

function initializeFilteredImages() {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  // Set all images to be visible and part of filtered images
  allImages.forEach((img) => {
    img.style.display = "block"
  })

  // All images are now filtered images
  filteredImages = [...allImages]

  const imagesPerView = getImagesPerView()
  currentSlide = 0

  // Show navigation arrows
  const prevBtn = document.querySelector('.prev-btn')
  const nextBtn = document.querySelector('.next-btn')
  if (prevBtn && nextBtn) {
    prevBtn.style.display = "block"
    nextBtn.style.display = "block"
    prevBtn.disabled = currentSlide === 0
    nextBtn.disabled = currentSlide >= filteredImages.length - imagesPerView
  }

  updateCarouselPosition(imagesPerView)
  startCarouselAutoPlay()
}

function updateCarouselPosition(imagesPerView) {
  const track = document.getElementById("carouselTrack")
  const prevBtn = document.querySelector('.prev-btn')
  const nextBtn = document.querySelector('.next-btn')
  if (!track) return

  const totalImages = filteredImages.length
  const maxSlides = Math.max(0, totalImages - imagesPerView)

  const slideWidth = 100 / imagesPerView
  track.style.transform = `translateX(-${currentSlide * slideWidth}%)`
  
  // Update navigation buttons
  if (prevBtn && nextBtn) {
    prevBtn.disabled = currentSlide === 0
    nextBtn.disabled = currentSlide >= maxSlides
    
    // Add visual indication for disabled state
    prevBtn.style.opacity = currentSlide === 0 ? "0.5" : "1"
    nextBtn.style.opacity = currentSlide >= maxSlides ? "0.5" : "1"
  }

  // Show images that will be visible in the next few slides
  const buffer = 2 // Number of extra slides to preload
  filteredImages.forEach((img, index) => {
    const isInViewportRange = (
      index >= currentSlide - (imagesPerView * buffer) && 
      index <= currentSlide + (imagesPerView * (1 + buffer))
    )
    img.style.display = isInViewportRange ? 'block' : 'none'
  })
}

function changeSlide(direction) {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  const totalImages = filteredImages.length
  const imagesPerView = getImagesPerView()
  const maxSlides = Math.max(0, totalImages - imagesPerView)

  // Stop auto-play when user manually controls
  stopCarouselAutoPlay()

  // Calculate new slide position
  const newSlide = currentSlide + direction

  // Check bounds and wrap around if needed
  if (direction > 0 && currentSlide >= maxSlides) {
    // If going forward at the end, stay at the end
    return;
  } else if (direction < 0 && currentSlide <= 0) {
    // If going backward at the start, stay at the start
    return;
  }

  // Update current slide
  currentSlide = newSlide;
  updateCarouselPosition(imagesPerView)

  // Restart auto-play after delay
  setTimeout(startCarouselAutoPlay, 2000)
}

function startCarouselAutoPlay() {
  stopCarouselAutoPlay()
  carouselInterval = setInterval(() => {
    changeSlideAuto()
  }, 4000)
}

function stopCarouselAutoPlay() {
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
}

function changeSlideAuto() {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  const totalImages = filteredImages.length
  const imagesPerView = getImagesPerView()
  const maxSlides = Math.max(0, totalImages - imagesPerView)

  // If we're at the last slide, go back to the beginning
  if (currentSlide >= maxSlides) {
    // Disable transition for seamless loop
    track.style.transition = "none"
    currentSlide = 0
    updateCarouselPosition(imagesPerView)

    // Re-enable transition after a brief delay
    setTimeout(() => {
      track.style.transition = "transform 0.5s ease"
    }, 50)
  } else {
    currentSlide++
    updateCarouselPosition(imagesPerView)
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
