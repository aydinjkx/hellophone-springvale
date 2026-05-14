// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById('tab-' + target).classList.add('active');
  });
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    if (!isOpen) item.classList.add('open');
  });
});

// Scroll-reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-item, .contact-item, .faq-item, .hours-card, .about-content').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// =====================
// EDIT MODE
// Activate by adding ?edit to the URL:
//   https://aydinjkx.github.io/hellophone-springvale/?edit
// =====================

const EDIT_SELECTORS = [
  '.logo',
  '.hero-content h1',
  '.hero-content p',
  '.feature-item p',
  '.about-content h2',
  '.about-content p',
  '.repair-card h3',
  '.repair-card p',
  '.repairs-cta p',
  '.tab-panel h3',
  '.tab-panel p',
  '.tab-panel li',
  '.section.hours h2',
  '.hours-card .day',
  '.hours-card .time',
  '.hours-card .hours-note',
  '.contact h2',
  '.contact-item h4',
  '.contact-item p',
  '.faq-questions h2',
  '.faq-question span:first-child',
  '.faq-answer p',
  '.faq-cta p',
  '.faq-cta h3',
  '.cta-strip p',
  '.footer-logo',
  '.footer-brand p',
  '.footer-contact p',
];

const STORAGE_KEY = 'hellophone-edits';

function getEditables() {
  return document.querySelectorAll('[data-edit-key]');
}

function saveEdits() {
  const data = {};
  getEditables().forEach(el => {
    data[el.dataset.editKey] = el.innerHTML;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadEdits() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const data = JSON.parse(saved);
  getEditables().forEach(el => {
    if (data[el.dataset.editKey] !== undefined) {
      el.innerHTML = data[el.dataset.editKey];
    }
  });
}

// Assign stable keys to all editable elements
let keyIndex = 0;
EDIT_SELECTORS.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.dataset.editKey = keyIndex++;
  });
});

// Always restore saved edits on page load
loadEdits();

// Activate edit mode if ?edit is in the URL
if (new URLSearchParams(window.location.search).has('edit')) {
  document.body.classList.add('edit-mode');

  // Make elements editable
  EDIT_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.contentEditable = 'true';
      el.spellcheck = false;
    });
  });

  // Prevent links and buttons from navigating while editing
  document.querySelectorAll('[contenteditable="true"] a').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });

  // Build toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'edit-toolbar';
  toolbar.innerHTML = `
    <span class="edit-toolbar-label">✏️ Edit Mode</span>
    <span class="edit-toolbar-hint">Click any text to edit it</span>
    <div class="edit-toolbar-actions">
      <button id="edit-save">Save</button>
      <button id="edit-download">Download Updated Page</button>
      <button id="edit-reset">Reset All</button>
    </div>
  `;
  document.body.appendChild(toolbar);

  // Auto-save on every keystroke
  document.addEventListener('input', saveEdits);

  document.getElementById('edit-save').addEventListener('click', () => {
    saveEdits();
    const btn = document.getElementById('edit-save');
    btn.textContent = 'Saved ✓';
    setTimeout(() => { btn.textContent = 'Save'; }, 2000);
  });

  document.getElementById('edit-reset').addEventListener('click', () => {
    if (confirm('Reset all text back to the original? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });

  document.getElementById('edit-download').addEventListener('click', () => {
    saveEdits();

    // Clone the page and clean up edit-mode artefacts
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });
    clone.querySelectorAll('[data-edit-key]').forEach(el => {
      el.removeAttribute('data-edit-key');
    });
    clone.querySelector('.edit-toolbar')?.remove();
    clone.classList.remove('edit-mode');

    const html = '<!DOCTYPE html>\n' + clone.outerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  });
}
