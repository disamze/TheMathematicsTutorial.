// ——— PRELOADER FADE-OUT & THREE.JS LOADER ———
let scene, camera, renderer, object;
let preloaderCanvas;

function initThreeJsLoader() {
  preloaderCanvas = document.getElementById('preloader-canvas');
  if (!preloaderCanvas) {
    console.error("Preloader canvas not found!");
    return;
  }

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, preloaderCanvas.clientWidth / preloaderCanvas.clientHeight, 0.1, 1000);
  camera.position.z = 2;

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: preloaderCanvas, antialias: true, alpha: true });
  renderer.setSize(preloaderCanvas.clientWidth, preloaderCanvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Geometry (e.g., DodecahedronGeometry for a more complex shape)
  const geometry = new THREE.DodecahedronGeometry(1); // Radius 1
  const material = new THREE.MeshPhongMaterial({
    color: 0x007bff, // Primary color from CSS variable
    specular: 0x28a745, // Accent color for highlights
    shininess: 50,
    flatShading: true
  });
  object = new THREE.Mesh(geometry, material);
  scene.add(object);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(1, 1, 1).normalize();
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight2.position.set(-1, -1, -1).normalize();
  scene.add(directionalLight2);

  // Handle window resize
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  if (preloaderCanvas) {
    camera.aspect = preloaderCanvas.clientWidth / preloaderCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(preloaderCanvas.clientWidth, preloaderCanvas.clientHeight);
  }
}

function animateThreeJsLoader() {
  requestAnimationFrame(animateThreeJsLoader);

  if (object) {
    object.rotation.x += 0.005;
    object.rotation.y += 0.008;
  }

  if (renderer) {
    renderer.render(scene, camera);
  }
}

window.addEventListener('load', () => {
  // Initialize Three.js loader
  if (typeof THREE !== 'undefined') { // Check if Three.js is loaded
    initThreeJsLoader();
    animateThreeJsLoader();
  } else {
    console.warn("Three.js not loaded. Falling back to basic preloader fade-out.");
  }

  const pre = document.getElementById('preloader');
  if (pre) {
    // Give a small delay for the Three.js animation to be visible
    setTimeout(() => {
      pre.classList.add('fade-out');
      setTimeout(() => pre.remove(), 900);
    }, 1500); // Show loader for at least 1.5 seconds
  }

  // Check for user session on load
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

// ——— MOBILE MENU TOGGLE ———
document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  if (nav && navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  // ——— DYNAMIC NOTES & QUESTIONS & BOOKS ———
  // Initial static lists (these will be augmented by fetched files)
  const initialNotes = [
    { title: 'SST', file: 'SST99days.pdf' },
    { title: 'Algebra Basics', file: 'algebra_basics.pdf' },
    { title: 'Calculus Fundamentals', file: 'calculus_fundamentals.pdf' },
    { title: 'Geometry Theorems', file: 'geometry_theorems.pdf' },
    { title: 'Probability Concepts', file: 'probability_concepts.pdf' },
    { title: 'Advanced Calculus', file: 'advanced_calculus.pdf' }, // Added for testing 'More'
  ];
  const initialQuestions = [
    { title: 'Maths Formulas For class 10', file: 'SST99days.pdf' },
    { title: 'Advanced Algebra Problems', file: 'advanced_algebra.pdf' },
    { title: 'Trigonometry Practice Set', file: 'trigonometry_practice.pdf' },
    { title: 'Physics Numerical Problems', file: 'physics_numerical.pdf' },
    { title: 'Statistics Case Studies', file: 'statistics_case_studies.pdf' },
    { title: 'Geometry Problems', file: 'geometry_problems.pdf' }, // Added for testing 'More'
  ];
  const initialBooks = [ // New array for books
    { title: 'NCERT Maths Class 10', file: 'ncert_maths_class10.pdf' },
    { title: 'RD Sharma Class 11', file: 'rd_sharma_class11.pdf' },
    { title: 'Concepts of Physics Vol 1', file: 'hc_verma_physics_vol1.pdf' },
    { title: 'Advanced Math for Engineers', file: 'advanced_math_engineers.pdf' }, // Added for testing 'More'
    { title: 'Calculus by Spivak', file: 'calculus_spivak.pdf' },
    { title: 'Linear Algebra Done Right', file: 'linear_algebra_done_right.pdf' }, // Added for testing 'More'
  ];

  let allNotes = [...initialNotes];
  let allQuestions = [...initialQuestions];
  let allBooks = [...initialBooks]; // New variable for all books

  // Function to fetch files from a directory (client-side limitation)
  // IMPORTANT: JavaScript in a browser cannot directly list files in a directory
  // for security reasons. To make this truly "automatic," you would need:
  // 1. A server-side script that lists files in a directory and serves them as JSON.
  // 2. A build process that generates a JSON file containing file names.
  // For this example, we'll simulate it or assume files are manually added to the arrays.
  async function fetchFiles(directoryPath, type) {
    // Placeholder: In a real scenario, you'd make an AJAX request here
    // e.g., const response = await fetch(`/api/list-files?dir=${directoryPath}`);
    // const files = await response.json();
    // return files.map(file => ({ title: file.replace('.pdf', '').replace(/_/g, ' '), file: file }));

    // For demonstration, we'll just return an empty array or add some dummy files
    // You would replace this with actual logic to get file names from your server/build
    console.warn(`Client-side JavaScript cannot directly list files from '${directoryPath}'.
                  You need a server-side solution or a pre-generated list of files.`);
    
    // Example of how you might manually add new files if you don't have a server
    if (type === 'notes') {
      return [
        { title: 'New Fetched Note 1', file: 'new_fetched_note_1.pdf' },
        { title: 'New Fetched Note 2', file: 'new_fetched_note_2.pdf' },
      ];
    } else if (type === 'questions') {
      return [
        { title: 'New Fetched Question 1', file: 'new_fetched_question_1.pdf' },
        { title: 'New Fetched Question 2', file: 'new_fetched_question_2.pdf' },
      ];
    } else if (type === 'books') { // New type for books
      return [
        { title: 'New Fetched Book 1', file: 'new_fetched_book_1.pdf' },
        { title: 'New Fetched Book 2', file: 'new_fetched_book_2.pdf' },
      ];
    }
    return [];
  }

  // Fetch additional files and combine with initial lists
  const fetchedNotes = await fetchFiles('notes_directory', 'notes'); // Replace 'notes_directory' with actual path if using server
  allNotes = [...new Map([...initialNotes, ...fetchedNotes].map(item => [item.file, item])).values()]; // Deduplicate

  const fetchedQuestions = await fetchFiles('questions_directory', 'questions'); // Replace 'questions_directory' with actual path if using server
  allQuestions = [...new Map([...initialQuestions, ...fetchedQuestions].map(item => [item.file, item])).values()]; // Deduplicate

  const fetchedBooks = await fetchFiles('books_directory', 'books'); // New fetch for books
  allBooks = [...new Map([...initialBooks, ...fetchedBooks].map(item => [item.file, item])).values()]; // Deduplicate


  function renderList(items, containerId, showMoreCard = false) {
    const ul = document.getElementById(containerId);
    if (!ul) return;
    ul.innerHTML = ''; // Clear existing content

    const initialDisplayLimit = 5; // Number of items to show initially

    // Determine which items to display for the initial view
    // If showMoreCard is true, display only up to initialDisplayLimit
    // Otherwise, display all items (for the full-screen overlay)
    const itemsToRender = showMoreCard ? items.slice(0, initialDisplayLimit) : items;

    itemsToRender.forEach(({ title, file }) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${title}</span>
        <a href="${file}" target="_blank" rel="noopener">Download</a>
      `;
      ul.appendChild(li);
    });

    // Add "More" card if applicable AND there are more items than the initial limit
    if (showMoreCard && items.length > initialDisplayLimit) {
      const moreCard = document.createElement('li');
      moreCard.classList.add('more-card');
      let cardText = '';
      if (containerId === 'notes-list') {
        cardText = 'More Notes';
      } else if (containerId === 'questions-list') {
        cardText = 'More Questions';
      } else if (containerId === 'books-list') {
        cardText = 'More Books';
      }
      moreCard.innerHTML = `<span>${cardText}</span>`;
      moreCard.addEventListener('click', () => openFullScreenOverlay(containerId));
      ul.appendChild(moreCard);
    }
  }

  // Initial render for main sections with "More" cards
  renderList(allNotes, 'notes-list', true);
  renderList(allQuestions, 'questions-list', true);
  renderList(allBooks, 'books-list', true); // Render books section with 'More' card logic

  // Full-screen overlay logic
  const fullScreenOverlay = document.getElementById('full-screen-overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayList = document.getElementById('overlay-list');
  const closeBtn = fullScreenOverlay.querySelector('.close-btn');

  function openFullScreenOverlay(listType) {
    let itemsToDisplay = [];
    let title = '';

    if (listType === 'notes-list') {
      itemsToDisplay = allNotes;
      title = 'All Downloadable Notes';
    } else if (listType === 'questions-list') {
      itemsToDisplay = allQuestions;
      title = 'All Practice Questions';
    } else if (listType === 'books-list') {
      itemsToDisplay = allBooks;
      title = 'All Recommended Books';
    }

    overlayTitle.textContent = title;
    overlayList.innerHTML = ''; // Clear previous content

    itemsToDisplay.forEach(({ title, file }) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${title}</span>
        <a href="${file}" target="_blank" rel="noopener">Download</a>
      `;
      overlayList.appendChild(li);
    });

    fullScreenOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling body when overlay is open
  }

  closeBtn.addEventListener('click', () => {
    fullScreenOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scrolling
  });

  // Close overlay if clicked outside content (on the overlay itself)
  fullScreenOverlay.addEventListener('click', (e) => {
    if (e.target === fullScreenOverlay) {
      fullScreenOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });


  // ——— THEME TOGGLE ———
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    // Set initial icon based on current theme
    themeBtn.innerHTML = document.documentElement.dataset.theme === 'dark'
      ? '<i class="bx bx-sun"></i>'
      : '<i class="bx bx-moon"></i>';

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
    // Default reveal options for most elements
    const defaultRevealOptions = {
      distance: '50px',
      duration: 1000,
      easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      interval: 150,
      origin: 'bottom',
      mobile: true
    };

    // Elements that do NOT have conflicting CSS transforms/animations
    ScrollReveal().reveal(
      [
        '.hero-info',
        '.skills-list li',
        '.logo',
        '.nav a',
        '.footer p',
        // Removed: .info-cards .card, .item-list li, .testimonial-card, .contact-form, .theme-toggle, .back-top
        // These have custom hover/animation effects that ScrollReveal would interfere with.
      ],
      defaultRevealOptions
    );

    // Specific reveal for section headings (h2)
    ScrollReveal().reveal('h2', {
      distance: '30px',
      duration: 900,
      easing: 'ease-out',
      origin: 'top',
      interval: 0,
      mobile: true
    });

    // Specific reveal for hero image (re-added if it doesn't have conflicting CSS animation)
    // If hero-img img has a CSS animation, remove it from here.
    ScrollReveal().reveal('.hero-img img', {
      distance: '80px',
      duration: 1200,
      easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      origin: 'right',
      mobile: true
    });

    // Specific reveal for about image (re-added if it doesn't have conflicting CSS animation)
    // If about-grid img has a CSS animation, remove it from here.
    ScrollReveal().reveal('.about-grid img', {
      distance: '80px',
      duration: 1200,
      easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      origin: 'left',
      mobile: true
    });

    // Ensure about-info is revealed
    ScrollReveal().reveal('.about-info', defaultRevealOptions);
  }

  // Close nav when a nav link is clicked
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
});

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
};
