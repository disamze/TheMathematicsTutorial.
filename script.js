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
});


  // ——— DYNAMIC NOTES & QUESTIONS ———
  const notes = [
    { title: 'SST', file: 'SST99days.pdf' },
    { title: 'Algebra Basics', file: 'algebra_basics.pdf' },
    { title: 'Calculus Fundamentals', file: 'calculus_fundamentals.pdf' },
    { title: 'Geometry Theorems', file: 'geometry_theorems.pdf' },
    { title: 'Probability Concepts', file: 'probability_concepts.pdf' },
    // → add your own here
  ];
  const questions = [
    { title: 'Maths Formulas For class 10', file: 'SST99days.pdf' },
    { title: 'Advanced Algebra Problems', file: 'advanced_algebra.pdf' },
    { title: 'Trigonometry Practice Set', file: 'trigonometry_practice.pdf' },
    { title: 'Physics Numerical Problems', file: 'physics_numerical.pdf' },
    { title: 'Statistics Case Studies', file: 'statistics_case_studies.pdf' },
    // → add yours here
  ];

  function renderList(items, containerId) {
    const ul = document.getElementById(containerId);
    if (!ul) return;
    ul.innerHTML = ''; // Clear existing content to prevent duplicates on re-render
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
    // Set initial icon based on current theme
    if (document.documentElement.dataset.theme === 'dark') {
      themeBtn.innerHTML = '<i class="bx bx-sun"></i>';
    } else {
      themeBtn.innerHTML = '<i class="bx bx-moon"></i>';
    }

    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
      themeBtn.setAttribute('aria-expanded', String(isDark));
      themeBtn.innerHTML = isDark
        ? '<i class="bx bx-moon"></i>' // Switch to moon icon for light theme
        : '<i class="bx bx-sun"></i>'; // Switch to sun icon for dark theme
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
        '.theme-toggle',
        '.logo',
        '.nav a',
        '.footer p',
        '.back-top'
      ],
      {
        distance: '50px', // Increased distance
        duration: 1000, // Longer duration
        easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)', // Smoother easing
        interval: 150, // Slightly faster interval
        origin: 'bottom', // Default origin from bottom
        mobile: true // Ensure animations work on mobile
      }
    );

    // Specific reveal for hero image
    ScrollReveal().reveal('.hero-img img', {
      distance: '80px',
      duration: 1200,
      easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      origin: 'right',
      mobile: true
    });

    // Specific reveal for about image
    ScrollReveal().reveal('.about-grid img', {
      distance: '80px',
      duration: 1200,
      easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      origin: 'left',
      mobile: true
    });

    // Reveal for section headings
    ScrollReveal().reveal('h2', {
      distance: '30px',
      duration: 900,
      easing: 'ease-out',
      origin: 'top',
      interval: 0,
      mobile: true
    });
  }
});

// Close nav when a nav link is clicked
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav a');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Testimonial Slider (Drag functionality)
const slider = document.querySelector('.testimonial-grid');
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed
    slider.scrollLeft = scrollLeft - walk;
  });

  // Touch events for mobile
  slider.addEventListener('touchstart', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.touches[0].pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('touchend', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  slider.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });
}


// ——— GOOGLE SIGN-IN LOGIC ———
// Google Sign-In callback must be globally accessible
window.handleCredentialResponse = function (response) {
  const data = parseJwt(response.credential);
  if (!data || !data.name || !data.picture) return;

  // Save user data in sessionStorage
  sessionStorage.setItem('user', JSON.stringify(data));
  showMainUI(data);
};

// Parse JWT token to extract user info
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// Display UI after successful login or session restore
function showMainUI(data) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
  document.getElementById('main-header').style.display = 'flex'; // Use flex for header

  const profileDiv = document.getElementById('profile-info');
  if (profileDiv && data.picture && data.name) {
    profileDiv.innerHTML = `
      <img src="${data.picture}" alt="Profile Picture">
      <span>${data.name.split(' ')[0]}</span> <!-- Display first name -->
    `;
    profileDiv.style.display = 'flex';
  }

  // Set data for signout popup
  document.getElementById('popup-name').textContent = data.name;
  document.getElementById('popup-pic').src = data.picture;
}

// Handle sign out
const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) {
  signoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('user');
    // Google Sign-out (if using Google's JS API for sign-out)
    // google.accounts.id.disableAutoSelect(); // This might be needed depending on your GSI setup
    // google.accounts.id.revoke(data.email, done => {
    //   console.log('consent revoked', done);
    // });

    document.getElementById('popup-overlay').style.display = 'none';
    document.getElementById('signout-popup').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('profile-info').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex'; // Show login screen
  });
}


// Handle profile click to show popup
document.addEventListener('click', (e) => {
  const profileInfo = e.target.closest('#profile-info');
  if (profileInfo) {
    const data = JSON.parse(sessionStorage.getItem('user'));
    if (data) {
      document.getElementById('popup-name').textContent = data.name;
      document.getElementById('popup-pic').src = data.picture;
      document.getElementById('popup-overlay').style.display = 'block';
      document.getElementById('signout-popup').style.display = 'block';
    }
  }
});

// Hide popup on outside click
const popupOverlay = document.getElementById('popup-overlay');
if (popupOverlay) {
  popupOverlay.addEventListener('click', () => {
    document.getElementById('popup-overlay').style.display = 'none';
    document.getElementById('signout-popup').style.display = 'none';
  });
}


// Preloader and session restore on initial load
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) {
    pre.classList.add('fade-out');
    setTimeout(() => pre.remove(), 900);
  }

  const userData = sessionStorage.getItem('user');
  if (userData) {
    const data = JSON.parse(userData);
    showMainUI(data);
  } else {
    // If no user data, ensure login screen is visible
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('main-header').style.display = 'none';
  }
});
