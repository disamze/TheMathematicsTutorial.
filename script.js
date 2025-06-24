// ——— PRELOADER FADE-OUT & THREE.JS LOADER ———
let scene, camera, renderer, object, wireframe;
let preloaderCanvas;
let animationFrameId; // To store the requestAnimationFrame ID

function initThreeJsLoader() {
  preloaderCanvas = document.getElementById('preloader-canvas');
  if (!preloaderCanvas) {
    console.error("Preloader canvas not found!");
    return;
  }

  // Set canvas dimensions explicitly for Three.js
  // Use a larger internal resolution for better quality, then scale down with CSS
  const canvasSize = 200; // Internal resolution
  preloaderCanvas.width = canvasSize;
  preloaderCanvas.height = canvasSize;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, preloaderCanvas.width / preloaderCanvas.height, 0.1, 1000);
  camera.position.z = 2;

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: preloaderCanvas, antialias: true, alpha: true });
  renderer.setSize(preloaderCanvas.width, preloaderCanvas.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // Make background transparent

  // Geometry (IcosahedronGeometry for a more complex, angular shape)
  const geometry = new THREE.IcosahedronGeometry(1); // Radius 1

  // Main object material (MeshStandardMaterial for better lighting)
  const material = new THREE.MeshStandardMaterial({
    color: 0x007bff, // Primary color
    roughness: 0.5,
    metalness: 0.8,
    flatShading: true
  });
  object = new THREE.Mesh(geometry, material);
  scene.add(object);

  // Wireframe material
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x28a745, // Accent color
    wireframe: true,
    transparent: true,
    opacity: 0.7
  });
  wireframe = new THREE.Mesh(geometry, wireframeMaterial);
  object.add(wireframe); // Add wireframe as a child of the main object

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 0.7, 100);
  pointLight2.position.set(-5, -5, -5);
  scene.add(pointLight2);

  // Handle window resize for the loader canvas
  window.addEventListener('resize', onLoaderCanvasResize, false);
}

function onLoaderCanvasResize() {
  if (preloaderCanvas && camera && renderer) {
    // Update canvas dimensions based on its CSS size
    const rect = preloaderCanvas.getBoundingClientRect();
    // Set internal canvas resolution to match CSS size for sharp rendering
    preloaderCanvas.width = rect.width;
    preloaderCanvas.height = rect.height;

    camera.aspect = preloaderCanvas.width / preloaderCanvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(preloaderCanvas.width, preloaderCanvas.height);
  }
}


function animateThreeJsLoader() {
  animationFrameId = requestAnimationFrame(animateThreeJsLoader);

  if (object) {
    object.rotation.x += 0.005;
    object.rotation.y += 0.008;
    // Subtle scale animation
    const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05; // Oscillate between 0.95 and 1.05
    object.scale.set(scale, scale, scale);
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

window.addEventListener('load', () => {
  // Initialize Three.js loader
  // Check if THREE is defined (meaning the script loaded)
  if (typeof THREE !== 'undefined') {
    initThreeJsLoader();
    animateThreeJsLoader(); // Start the animation loop
  } else {
    console.warn("Three.js not loaded. Preloader will not show 3D animation.");
  }

  const pre = document.getElementById('preloader');
  if (pre) {
    // Give a small delay for the Three.js animation to be visible
    setTimeout(() => {
      pre.classList.add('fade-out');
      // Stop the Three.js animation when fading out
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // Clean up Three.js resources (optional but good practice)
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement = null;
        renderer = null;
      }
      scene = null;
      camera = null;
      object = null;
      wireframe = null;
      preloaderCanvas = null;
      window.removeEventListener('resize', onLoaderCanvasResize);


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
  const header = document.getElementById('main-header'); // Get the header to calculate top offset

  if (nav && navToggle && header) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');

      // Dynamically set top position based on header height
      const headerHeight = header.offsetHeight;
      nav.style.top = `${headerHeight}px`;
      nav.style.height = `calc(100vh - ${headerHeight}px)`; // Use 100vh for full viewport height
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
    // Check if the click target is the overlay itself or the close button
    if (e.target === fullScreenOverlay || e.target === closeBtn) {
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
      mobile: true,
      // Crucial: Disable ScrollReveal's default transform/opacity management
      // for elements that have their own CSS transitions/animations.
      // This prevents conflicts.
      beforeReveal: (el) => {
        el.style.opacity = ''; // Clear opacity set by ScrollReveal
        el.style.transform = ''; // Clear transform set by ScrollReveal
      },
      afterReveal: (el) => {
        el.style.opacity = ''; // Ensure opacity is reset after reveal
        el.style.transform = ''; // Ensure transform is reset after reveal
      }
    };

    // Apply ScrollReveal ONLY to elements that don't have conflicting CSS transforms/animations
    // or where ScrollReveal's animation is desired as the primary entrance effect.
    ScrollReveal().reveal(
      [
        '.hero-info',
        '.skills-list li',
        '.logo',
        '.nav a',
        '.footer p',
        '.about-info', // Ensure about-info is revealed
        '.hero-img img', // Re-added, assuming its CSS animation is simple or removed
        '.about-grid img', // Re-added, assuming its CSS animation is simple or removed
        '.login-box', // For the login screen entrance
        '.welcome-message', // For the welcome message
      ],
      defaultRevealOptions
    );

    // Specific reveal for section headings (h2)
    // This is where the fix for headings comes in.
    // We ensure that h2 elements are revealed.
    ScrollReveal().reveal('h2', {
      distance: '30px',
      duration: 900,
      easing: 'ease-out',
      origin: 'top',
      interval: 0,
      mobile: true,
      // Important: Ensure these are cleared if ScrollReveal applies them
      beforeReveal: (el) => { el.style.opacity = ''; el.style.transform = ''; },
      afterReveal: (el) => { el.style.opacity = ''; el.style.transform = ''; }
    });

    // Elements with custom hover/animation effects that should NOT be managed by ScrollReveal:
    // - .info-cards .card (has translateY and boxShadow on hover)
    // - .item-list li (has rotateY, rotateX, translateY, boxShadow on hover)
    // - .testimonial-card (has translateY and scale on hover)
    // - .contact-form .btn (has translateY and boxShadow on hover)
    // - .theme-toggle (has translateY and boxShadow on hover)
    // - .back-top (has translateY on hover)
    // - .hero-info .btn (has translateY and boxShadow on hover)
    // These elements will rely solely on their CSS transitions for interactivity.
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
  popupOverlay.addEventListener('click', (e) => {
    // Only close if the click is directly on the overlay, not its children
    if (e.target === popupOverlay) {
      document.getElementById('popup-overlay').style.display = 'none';
      document.getElementById('signout-popup').style.display = 'none';
    }
  });
};
