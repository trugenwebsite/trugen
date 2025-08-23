document.addEventListener("DOMContentLoaded", () => {
  // --- Reusable Component Loader ---
  const loadComponent = (componentPath, placeholderId) => {
    fetch(componentPath)
      .then((response) => (response.ok ? response.text() : Promise.reject("Component not found.")))
      .then((data) => {
        document.getElementById(placeholderId).innerHTML = data
        setTimeout(initializeNavbar, 100)
      })
      .catch((error) => console.error(`Error loading ${placeholderId}:`, error))
  }

  loadComponent("components/navbar.html", "navbar-placeholder")
  loadComponent("components/footer.html", "footer-placeholder")

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
})

let currentSlide = 0
let carouselInterval

function initializeCarousel() {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  const images = track.querySelectorAll(".carousel-image")
  const totalImages = images.length
  const imagesPerView = getImagesPerView()

  // Start auto-increment
  startCarouselAutoPlay()

  // Handle window resize for responsive images per view
  window.addEventListener("resize", () => {
    const newImagesPerView = getImagesPerView()
    updateCarouselPosition(newImagesPerView)
  })
}

function getImagesPerView() {
  if (window.innerWidth <= 480) return 1
  if (window.innerWidth <= 768) return 2
  return 4
}

function updateCarouselPosition(imagesPerView) {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  const slideWidth = 100 / imagesPerView
  track.style.transform = `translateX(-${currentSlide * slideWidth}%)`
}

function changeSlide(direction) {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  const images = track.querySelectorAll(".carousel-image")
  const totalImages = images.length
  const imagesPerView = getImagesPerView()
  const maxSlides = totalImages - imagesPerView

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

  const images = track.querySelectorAll(".carousel-image")
  const totalImages = images.length
  const imagesPerView = getImagesPerView()
  const maxSlides = totalImages - imagesPerView

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
      window.location.href = "products/capsules.html"
      break
    case "tablets":
      window.location.href = "products/tablets.html"
      break
    case "sachets":
      window.location.href = "products/sachets.html"
      break
    case "syrups":
      window.location.href = "products/syrups.html"
      break
    default:
      console.log("Product page not found")
  }
}

function downloadBrochure() {
  // Create a temporary link element to trigger download
  const link = document.createElement("a")
  link.href = "assets/documents/trugen-brochure.pdf" // You'll need to add the actual brochure file
  link.download = "Trugen-Pharmaceuticals-Brochure.pdf"
  link.style.display = "none"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Fallback: show alert if file doesn't exist
  setTimeout(() => {
    alert("Brochure download will be available soon. Please contact us for more information.")
  }, 100)
}
