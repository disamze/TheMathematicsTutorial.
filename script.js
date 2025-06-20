// ——— PRELOADER FADE-OUT ———
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  pre.classList.add('fade-out');
  setTimeout(() => pre.remove(), 900);
});

document.addEventListener('DOMContentLoaded', () => {
  // ——— MOBILE MENU TOGGLE ———
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  if (nav && navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  // ——— DYNAMIC NOTES & QUESTIONS ———
  const notes = [
    { title: 'SST', file: 'SST99days.pdf' },
    // → add your own here
  ];
  const questions = [
    { title: 'Maths Formulas For class 10', file: 'SST99days.pdf' },
    // → add yours here
  ];
  function renderList(items, containerId) {
    const ul = document.getElementById(containerId);
    if (!ul) return;
    items.forEach(({ title, file }) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${title}</span>
        <a href="${file}" target="_blank" rel="noopener">Download</a>
      `;
      ul.appendChild(li);
    });
  }
  renderList(notes, 'notes-list');
  renderList(questions, 'questions-list');

  // ——— THEME TOGGLE ———
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
      themeBtn.setAttribute('aria-expanded', String(isDark));
      themeBtn.innerHTML = isDark
        ? '<i class="bx bx-moon"></i>'
        : '<i class="bx bx-sun"></i>';
    });
  }

  // ——— SCROLLREVEAL ———
  if (window.ScrollReveal) {
    ScrollReveal().reveal(
      [
        '.hero-info',
        '.about-info',
        '.info-cards .card',
        '.skills-list li',
        '.item-list li',
        '.testimonial-card',
        '.contact-form',
        '.theme-toggle'
      ],
      {
        distance: '40px',
        duration: 800,
        easing: 'ease-out',
        interval: 200
      }
    );
  }
});
