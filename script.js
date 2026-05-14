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
let editActive = false;

// Assign stable keys to all editable elements
let keyIndex = 0;
EDIT_SELECTORS.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.dataset.editKey = keyIndex++;
  });
});

function saveEdits() {
  const data = {};
  document.querySelectorAll('[data-edit-key]').forEach(el => {
    data[el.dataset.editKey] = el.innerHTML;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadEdits() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll('[data-edit-key]').forEach(el => {
    if (data[el.dataset.editKey] !== undefined) {
      el.innerHTML = data[el.dataset.editKey];
    }
  });
}

function activateEditMode() {
  if (editActive) return;
  editActive = true;

  document.body.classList.add('edit-mode');
  editToggleBtn.style.display = 'none';

  EDIT_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.contentEditable = 'true';
      el.spellcheck = false;
    });
  });

  document.addEventListener('input', saveEdits);

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
      <button id="edit-exit">✕ Exit</button>
    </div>
  `;
  document.body.appendChild(toolbar);

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

  document.getElementById('edit-exit').addEventListener('click', () => {
    location.reload();
  });

  document.getElementById('edit-download').addEventListener('click', () => {
    saveEdits();

    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });
    clone.querySelectorAll('[data-edit-key]').forEach(el => {
      el.removeAttribute('data-edit-key');
    });
    clone.querySelector('.edit-toolbar')?.remove();
    clone.querySelector('.edit-toggle-btn')?.remove();
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

// Restore saved edits on every page load
loadEdits();

// Floating pencil button — always visible, bottom-right corner
const editToggleBtn = document.createElement('button');
editToggleBtn.className = 'edit-toggle-btn';
editToggleBtn.title = 'Edit page text';
editToggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Page`;
document.body.appendChild(editToggleBtn);

editToggleBtn.addEventListener('click', () => {
  const input = prompt('Enter password to edit:');
  if (input === 'hellophonespringvale') {
    activateEditMode();
  } else if (input !== null) {
    alert('Incorrect password.');
  }
});

// Also support ?edit in the URL
if (new URLSearchParams(window.location.search).has('edit')) {
  activateEditMode();
}
