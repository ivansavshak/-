document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.scroll-btn')
  const contactForm = document.getElementById('footer-contact-form')
  const phoneLinks = document.querySelectorAll('.phone-link-modal') // всі номери

  if (buttons && buttons.length > 0) {
    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault()

        const isMobile = window.innerWidth <= 768

        if (contactForm) {
          contactForm.scrollIntoView({ behavior: 'smooth' })
        }

        if (isMobile && phoneLinks.length > 0) {
          // Створюємо список номерів у модалці
          let phonesHTML = ''
          phoneLinks.forEach((link) => {
            const phoneNumber = link.getAttribute('href').replace('tel:', '')
            const phoneDisplay = link.textContent.trim()
            phonesHTML += `<a href="tel:${phoneNumber}" class="phone-link-modal">${phoneDisplay}</a><br/>`
          })

          let modal = document.createElement('div')
          modal.classList.add('phone-modal')

          modal.innerHTML = `
        <div class="phone-modal-content">
          <p>Зателефонуйте нам:</p>
          ${phonesHTML}
        </div>
      `

          document.body.appendChild(modal)

          modal.addEventListener('click', (event) => {
            if (event.target === modal) {
              document.body.removeChild(modal)
            }
          })
        }
      })
    })
  }

  // Меню-бургер
  const btn = document.getElementById('hamburger-btn')
  const popup = document.getElementById('menu-popup')

  if (btn && popup) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = popup.style.display === 'block'
      popup.style.display = isOpen ? 'none' : 'block'
      popup.setAttribute('aria-hidden', isOpen ? 'true' : 'false')
    })

    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !popup.contains(e.target)) {
        popup.style.display = 'none'
        popup.setAttribute('aria-hidden', 'true')
      }
    })
  }

  // Галерея
  const galleryContainer = document.getElementById('gallery')

  if (galleryContainer) {
    fetch('monuments.json')
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.json()
      })
      .then((data) => {
        galleryContainer.innerHTML = ''
        data.forEach((item) => {
          const itemDiv = document.createElement('div')
          itemDiv.className = 'gallery-item'

          const imageBox = document.createElement('div')
          imageBox.className = 'image-box'

          const img = document.createElement('img')
          img.src = item.image
          img.alt = item.name

          imageBox.appendChild(img)
          itemDiv.appendChild(imageBox)

          const nameP = document.createElement('p')
          nameP.textContent = item.name
          itemDiv.appendChild(nameP)

          if (item.price) {
            const priceP = document.createElement('p')
            priceP.textContent = item.price
            priceP.style.fontWeight = 'bold'
            itemDiv.appendChild(priceP)
          }

          galleryContainer.appendChild(itemDiv)
          enableImageZoom()
        })
      })
      .catch((error) => {
        console.error('Error loading monument data:', error)
        galleryContainer.textContent = 'Не вдалося завантажити галерею'
      })
  }

  // Карусель
  const track = document.querySelector('.carousel-track')
  const slides = track ? Array.from(track.children) : []
  const prevBtn = document.querySelector('.carousel-btn.prev')
  const nextBtn = document.querySelector('.carousel-btn.next')

  let currentSlide = 0

  function updateCarousel() {
    const slideWidth = track.offsetWidth
    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`
  }

  if (nextBtn && prevBtn && track) {
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slides.length
      updateCarousel()
    })

    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length
      updateCarousel()
    })

    window.addEventListener('resize', updateCarousel)
  }

  // розкривання відповідей на питання
  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.nextElementSibling
      const expanded = button.getAttribute('aria-expanded') === 'true'

      if (expanded) {
        button.setAttribute('aria-expanded', 'false')
        answer.classList.remove('open')
        setTimeout(() => (answer.hidden = true), 400) // ховаємо після анімації
      } else {
        button.setAttribute('aria-expanded', 'true')
        answer.hidden = false
        setTimeout(() => answer.classList.add('open'), 10)
      }
    })
  })

  // форма для надсилання в гугл таблицю
  const form = document.getElementById('footer-contact-form')
  const scriptURL =
    'https://script.google.com/macros/s/AKfycbxW6kyLp7MufjGiMHIq7T0AVcns4qFu6ANqrYYwyqNmG4QMdcxiv1iu9_jU1XZ1v3KL/exec'
  const submitBtn = document.getElementById('submit-button')

  let timeoutId

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    submitBtn.disabled = true
    submitBtn.textContent = 'Надсилаємо...'

    const name = form.name.value.trim()
    const phone = form.phone.value.trim()
    const message = form.message.value.trim()

    const formData = new FormData(form)

    fetch(scriptURL, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          form.reset()
          showSuccessPopup(name, phone, message)
        } else {
          alert('Помилка відправки. Спробуйте пізніше.')
        }
      })
      .catch((error) => {
        alert('Помилка: ' + error.message)
      })
      .finally(() => {
        submitBtn.disabled = false
        submitBtn.textContent = 'Відправити'
      })
  })

  function showSuccessPopup(name, phone, message) {
    const overlay = document.createElement('div')
    overlay.className = 'overlay'

    const content = document.createElement('div')
    content.className = 'overlay-content'

    content.innerHTML = `
      <h2>✅ Заявку надіслано!</h2>
      <p><strong>Імʼя:</strong> ${name || '-'}</p>
      <p><strong>Телефон:</strong> ${phone || '-'}</p>
      <p><strong>Повідомлення:</strong> ${message || '-'}</p>
    `

    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Закрити'
    closeBtn.onclick = () => {
      overlay.classList.remove('show')
      setTimeout(() => {
        document.body.removeChild(overlay)
      }, 300)
      clearTimeout(timeoutId)
    }

    content.appendChild(closeBtn)
    overlay.appendChild(content)
    document.body.appendChild(overlay)

    setTimeout(() => {
      overlay.classList.add('show')
    }, 10)

    timeoutId = setTimeout(() => {
      if (document.body.contains(overlay)) {
        overlay.classList.remove('show')
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay)
          }
        }, 300)
      }
    }, 10000)
  }

  // збільшує фото в каталозі та виставці
  function enableImageZoom() {
    // ⛔ Обмеження: не запускати на малих екранах
    if (window.innerWidth < 1024) return

    const galleryImages = document.querySelectorAll('.gallery .image-box img')

    galleryImages.forEach((img) => {
      if (!img.classList.contains('zoom-enabled')) {
        img.classList.add('zoom-enabled')

        img.addEventListener('click', () => {
          const overlay = document.createElement('div')
          overlay.classList.add('image-zoom-overlay')

          const zoomedImg = document.createElement('img')
          zoomedImg.src = img.src
          zoomedImg.alt = img.alt

          overlay.appendChild(zoomedImg)
          document.body.appendChild(overlay)

          setTimeout(() => overlay.classList.add('active'), 10)

          overlay.addEventListener('click', () => {
            overlay.classList.remove('active')
            setTimeout(() => document.body.removeChild(overlay), 300)
          })
        })
      }
    })
  }
  enableImageZoom()

  // ефект випливання
  const animatedElements = document.querySelectorAll('.scroll-animate')

  const observer = new IntersectionObserver(
    (entries, observerSelf) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observerSelf.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.5,
    }
  )

  animatedElements.forEach((el) => observer.observe(el))
})
