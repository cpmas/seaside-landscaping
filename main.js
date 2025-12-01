// Main client-side script for Seaside Landscaping
// Handles partial loading, UI interactions, gallery, and contact form

const startTime = Date.now();

// --- Sticky Header Scroll Effect ---
// FIXED: Moved selector inside the listener to prevent crashing if header isn't found immediately
window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (!header) return; // Safety check

    // Add .scrolled class if user scrolls more than 50px, otherwise remove it
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

async function loadPartial(id, url) {
  const container = document.getElementById(id);
  if (!container) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    container.innerHTML = await res.text();
    return container;
  } catch (e) {
    console.warn(e);
  }
}

document.addEventListener('DOMContentLoaded', function() {
    const dropdownToggle = document.querySelector('.main-nav .dropdown > a');
    const menuToggle = document.querySelector('.menu-toggle');

    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(event) {
            // Check if the mobile menu button is visible
            const isMobileMenu = window.getComputedStyle(menuToggle).display !== 'none';
            
            if (isMobileMenu) {
                // Prevent the link from being followed
                event.preventDefault();
                // Toggle an 'open' class on the parent <li>
                this.parentElement.classList.toggle('open');
            }
        });
    }

    // Optional: Close dropdown when clicking elsewhere
    document.addEventListener('click', function(event) {
        const openDropdown = document.querySelector('.dropdown.open');
        if (openDropdown && !openDropdown.contains(event.target)) {
            openDropdown.classList.remove('open');
        }
    });
});

function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const toggle = header.querySelector('.menu-toggle');
  const navList = header.querySelector('.nav-list');

  toggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

function initFooter() {
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
}

function observeSections() {
  // FIXED: If reduced motion is on, show everything immediately instead of returning early (which left opacity at 0)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

function initGallery() {
  const dataEl = document.getElementById('project-data');
  const gallery = document.getElementById('project-gallery');
  const modal = document.getElementById('project-modal');
  if (!dataEl || !gallery || !modal) return;

  const projects = JSON.parse(dataEl.textContent);
  const buttons = document.querySelectorAll('.filter-button');
  const items = gallery.querySelectorAll('.gallery-item');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.display = show ? '' : 'none';
      });
    });
  });

  const closeModal = () => modal.classList.remove('open');
  const modalClose = modal.querySelector('.modal-close');
  const beforeAfterBtn = modal.querySelector('.before-after-toggle');
  const beforeImg = modal.querySelector('.before-image');
  const afterImg = modal.querySelector('.current-image');

  function openModal(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    modal.querySelector('#modal-title').textContent = project.title;
    modal.querySelector('.modal-subtitle').textContent = project.subtitle;
    modal.querySelector('.modal-suburb').textContent = project.suburb;
    modal.querySelector('.modal-scope').textContent = project.scope;
    modal.querySelector('.modal-materials').textContent = project.materials;
    modal.querySelector('.modal-description').textContent = project.description;
    afterImg.src = project.afterImage;
    afterImg.alt = `After image of ${project.title}`;
    beforeImg.src = project.beforeImage;
    beforeImg.alt = `Before image of ${project.title}`;
    beforeImg.style.display = 'none';
    afterImg.style.display = 'block';
    modal.classList.add('open');
  }

  items.forEach(item => {
    item.addEventListener('click', () => {
      openModal(parseInt(item.dataset.projectId, 10));
    });
  });

  beforeAfterBtn.addEventListener('click', () => {
    const showBefore = beforeImg.style.display === 'none';
    beforeImg.style.display = showBefore ? 'block' : 'none';
    afterImg.style.display = showBefore ? 'none' : 'block';
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ✅ Carousel with Arrows
function initCarousels() {
  document.querySelectorAll('.carousel-js').forEach(carousel => {
    const slides = carousel.querySelectorAll('.slides img');
    const prevBtn = carousel.querySelector('.carousel-btn--prev');
    const nextBtn = carousel.querySelector('.carousel-btn--next');
    let currentIndex = 0;
    const totalSlides = slides.length;

    if (totalSlides <= 1) {
        if(prevBtn) prevBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'none';
        return; // Don't initialize if there's only one slide
    }

    function showSlide(index) {
      slides.forEach((slide, i) => {
        const isActive = i === index;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', !isActive);
      });
      currentIndex = index;
    }

    nextBtn.addEventListener('click', () => {
      let newIndex = (currentIndex + 1) % totalSlides;
      showSlide(newIndex);
    });

    prevBtn.addEventListener('click', () => {
      let newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      showSlide(newIndex);
    });

    // Init first slide
    showSlide(0);
  });
}


// ✅ Init everything
async function init() {
  await loadPartial('header-placeholder', 'partials/header.html');
  await loadPartial('footer-placeholder', 'partials/footer.html');
  initHeader();
  initFooter();
  observeSections();
  initGallery();
  initCarousels();
}

document.addEventListener('DOMContentLoaded', init);