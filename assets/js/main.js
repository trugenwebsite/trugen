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

  // Initialize Intersection Observer for lazy loading
  const carouselSection = document.querySelector('.carousel-section')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Initialize carousel only when it's visible
          initializeCarouselContent()
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

function filterCarouselImages() {
  const filterValue = document.getElementById("facilityFilter").value
  const track = document.getElementById("carouselTrack")

  if (!track) return

  // Stop auto-play during filtering
  stopCarouselAutoPlay()

  // Show/hide images based on filter
  allImages.forEach((img) => {
    if (filterValue === "all" || img.dataset.category === filterValue) {
      img.style.display = "block"
    } else {
      img.style.display = "none"
    }
  })

  // Update filtered images array
  filteredImages = allImages.filter((img) => filterValue === "all" || img.dataset.category === filterValue)

  // Reset current slide and update position
  currentSlide = 0
  const imagesPerView = getImagesPerView()
  updateCarouselPosition(imagesPerView)

  // Restart auto-play with filtered images
  setTimeout(startCarouselAutoPlay, 1000)
}

function updateCarouselPosition(imagesPerView) {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  const slideWidth = 100 / imagesPerView
  track.style.transform = `translateX(-${currentSlide * slideWidth}%)`
  
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

  currentSlide += direction

  if (currentSlide < 0) {
    track.style.transition = "none"
    currentSlide = maxSlides
    updateCarouselPosition(imagesPerView)
    setTimeout(() => {
      track.style.transition = "transform 0.5s ease"
    }, 50)
  } else if (currentSlide > maxSlides) {
    track.style.transition = "none"
    currentSlide = 0
    updateCarouselPosition(imagesPerView)
    setTimeout(() => {
      track.style.transition = "transform 0.5s ease"
    }, 50)
  } else {
    updateCarouselPosition(imagesPerView)
  }

  // Restart auto-play after manual control
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

  currentSlide++

  if (currentSlide > maxSlides) {
    // Disable transition for seamless loop
    track.style.transition = "none"
    currentSlide = 0
    updateCarouselPosition(imagesPerView)

    // Re-enable transition after a brief delay
    setTimeout(() => {
      track.style.transition = "transform 0.5s ease"
    }, 50)
  } else {
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
    link.href = "/assets/pdf/export.pdf"
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
