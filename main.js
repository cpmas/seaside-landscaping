// Main client-side script for Seaside Landscaping
// Handles partial loading, UI interactions, gallery, and contact form

const startTime = Date.now();

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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const timeField = document.getElementById('time-on-page');
  const messages = document.getElementById('form-messages');
  const submitBtn = document.getElementById('submit-button');

  form.addEventListener('submit', async e => {
    if (!form.checkValidity()) return;
    e.preventDefault();
    if (form.dataset.submitting) return;
    form.dataset.submitting = 'true';
    submitBtn.disabled = true;
    timeField.value = Math.round((Date.now() - startTime) / 1000);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        messages.textContent = "Thanks! We'll be in touch soon.";
        form.reset();
      } else {
        messages.textContent = 'Sorry, there was a problem. Please try again.';
      }
    } catch (err) {
      messages.textContent = 'Network error. Please try again.';
    }
    submitBtn.disabled = false;
    form.dataset.submitting = '';
  });
}

async function init() {
  await loadPartial('header-placeholder', 'partials/header.html');
  await loadPartial('footer-placeholder', 'partials/footer.html');
  initHeader();
  initFooter();
  observeSections();
  initGallery();
  initContactForm();
}

document.addEventListener('DOMContentLoaded', init);

