// ——— PRELOADER FADE-OUT & THREE.JS LOADER ———
let scene, camera, renderer, particles;
let preloaderCanvas;
let animationFrameId; // To store the requestAnimationFrame ID
let particleOrbitRadius = 0.8; // Slightly larger radius for spread
let particleSpeed = 0.005;

// Mouse/Touch interaction variables
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Event listeners for mouse/touch movement
document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('touchstart', onDocumentTouchStart, false);
document.addEventListener('touchmove', onDocumentTouchMove, false);

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
}

function onDocumentTouchStart(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = (event.touches[0].pageX - windowHalfX);
    mouseY = (event.touches[0].pageY - windowHalfY);
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = (event.touches[0].pageX - windowHalfX);
    mouseY = (event.touches[0].pageY - windowHalfY);
  }
}


// Moved onLoaderCanvasResize function definition up to resolve ReferenceError
function onLoaderCanvasResize() {
  if (preloaderCanvas && camera && renderer) {
    // Update canvas dimensions based on its CSS size
    const rect = preloaderCanvas.getBoundingClientRect();
    // Set internal canvas resolution to match CSS size for sharp rendering
    preloaderCanvas.width = rect.width;
    preloaderCanvas.height = rect.height;

    camera.aspect = preloaderCanvas.width / preloaderCanvas.height;
    renderer.setSize(preloaderCanvas.width, preloaderCanvas.height);
    camera.updateProjectionMatrix();
  }
}

// --- NEW: Global variable for logo texture data ---
let logoImageData = null;

function initThreeJsLoader() {
  preloaderCanvas = document.getElementById('preloader-canvas');
  if (!preloaderCanvas) {
    console.error("Preloader canvas not found!");
    return;
  }

  // Set canvas dimensions explicitly for Three.js
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

  // --- NEW: Load logo image and process it for particle placement ---
  const img = new Image();
  img.src = 'your_logo.png'; // Path to your logo image
  img.onload = () => {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    const logoSize = 100; // Size to scale logo for particle sampling
    tempCanvas.width = logoSize;
    tempCanvas.height = logoSize;
    ctx.drawImage(img, 0, 0, logoSize, logoSize);
    logoImageData = ctx.getImageData(0, 0, logoSize, logoSize);
    createParticlesFromLogo(); // Call particle creation after image is loaded
  };
  img.onerror = (err) => {
    console.error('Error loading logo for preloader:', err);
    createParticlesFromLogo(true); // Create generic particles if logo fails to load
  };

  // Lights (less critical for particle system, but good practice)
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Handle window resize for the loader canvas
  window.addEventListener('resize', onLoaderCanvasResize, false);
}

// --- NEW: Function to create particles based on logo data ---
function createParticlesFromLogo(fallback = false) {
  const particleCount = fallback ? 8000 : 5000; // Fewer particles for logo, more for generic
  // CORRECTED: Declared particlesGeometry here
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const opacities = new Float32Array(particleCount);
  const initialAngles = new Float32Array(particleCount);

  const logoWidth = logoImageData ? logoImageData.width : 1;
  const logoHeight = logoImageData ? logoImageData.height : 1;

  for (let i = 0; i < particleCount; i++) {
    let x, y, z;
    let validPixel = false;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops for sparse logos

    if (!fallback && logoImageData) {
      // Sample pixels from the logo image
      while (!validPixel && attempts < maxAttempts) {
        const px = Math.floor(Math.random() * logoWidth);
        const py = Math.floor(Math.random() * logoHeight);
        const index = (py * logoWidth + px) * 4; // RGBA

        // Check alpha channel for non-transparent pixels
        if (logoImageData.data[index + 3] > 128) { // If alpha is > 50%
          // Map pixel coordinates to Three.js coordinates (-1 to 1)
          x = (px / logoWidth - 0.5) * 1.5; // Scale to fit within view
          y = (0.5 - py / logoHeight) * 1.5; // Invert Y for canvas vs Three.js
          z = (Math.random() - 0.5) * 0.5; // Add some depth
          validPixel = true;
        }
        attempts++;
      }
    }

    if (fallback || !validPixel) {
      // Fallback to random sphere if logo data is not available or pixel not found
      const r = particleOrbitRadius * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((2 * Math.random()) - 1);
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Dynamic color range: blues, purples, and some greens for a vibrant, techy feel
    const hue = Math.random() * 0.5 + 0.5;
    const saturation = 0.8 + Math.random() * 0.2;
    const lightness = 0.6 + Math.random() * 0.2;

    const color = new THREE.Color();
    color.setHSL(hue, saturation, lightness);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = 0.08 + Math.random() * 0.12;
    opacities[i] = 0.8 + Math.random() * 0.2;
    initialAngles[i] = Math.random() * Math.PI * 2;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particlesGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
  particlesGeometry.setAttribute('initialAngle', new THREE.BufferAttribute(initialAngles, 1));

  // ShaderMaterial for glowing, circular particles
  const particlesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      mousePos: { value: new THREE.Vector2(0, 0) },
      cameraNear: { value: camera.near },
      cameraFar: { value: camera.far }
    },
    vertexShader: `
      attribute float size;
      attribute float opacity;
      attribute vec3 color;
      attribute float initialAngle;
      varying vec3 vColor;
      varying float vOpacity;
      uniform float time;
      uniform vec2 mousePos;
      uniform float cameraNear;
      uniform float cameraFar;

      void main() {
        vColor = color;
        vOpacity = opacity;

        vec3 animatedPosition = position;

        // Subtle orbital motion around the center of the logo
        float orbitSpeed = 0.2; // Slower orbit for logo particles
        float angle = initialAngle + time * orbitSpeed;
        float orbitRadius = length(position.xy) * 0.1; // Smaller orbit radius
        animatedPosition.x += orbitRadius * cos(angle);
        animatedPosition.y += orbitRadius * sin(angle);

        // Add subtle vertical bobbing
        animatedPosition.z += sin(time * 2.0 + position.x * 10.0) * 0.02;

        // Add a subtle pull towards mouse position (scaled down)
        vec3 mouseInfluence = vec3(mousePos.x * 0.0001, mousePos.y * 0.0001, 0.0);
        animatedPosition += mouseInfluence;

        vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);

        // Scale size based on distance from camera, with a minimum size
        float distanceFactor = smoothstep(cameraNear, cameraFar, -mvPosition.z);
        gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time * 3.0 + initialAngle) * 0.1);
        gl_PointSize = max(gl_PointSize, 5.0);

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vOpacity;
      uniform float time;

      void main() {
        float r = distance(gl_PointCoord, vec2(0.5));
        float alpha = 1.0 - r * 2.0;

        // Add a more pronounced and varied color shift over time
        vec3 animatedColor = vColor;
        animatedColor.r = vColor.r + sin(time * 1.0 + vColor.g * 15.0) * 0.15;
        animatedColor.g = vColor.g + cos(time * 1.0 + vColor.b * 15.0) * 0.15;
        animatedColor.b = vColor.b + sin(time * 1.0 + vColor.r * 15.0) * 0.15;
        animatedColor = clamp(animatedColor, 0.0, 1.0);

        // Add a subtle flicker/glow effect
        float glow = sin(time * 5.0 + r * 10.0) * 0.1 + 0.9;
        animatedColor *= glow;

        gl_FragColor = vec4(animatedColor, vOpacity * alpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });

  // Remove existing particles if any
  if (particles) {
    scene.remove(particles);
    particles.geometry.dispose();
    particles.material.dispose();
  }

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
}


function animateThreeJsLoader() {
  animationFrameId = requestAnimationFrame(animateThreeJsLoader);

  if (particles && particles.material.uniforms) {
    // Update time uniform for shader animations
    particles.material.uniforms.time.value += 0.01;

    // Smoothly interpolate mouse position for camera/particle influence
    targetX += (mouseX - targetX) * 0.02;
    targetY += (mouseY - targetY) * 0.02;

    // Update mousePos uniform for shader
    particles.material.uniforms.mousePos.value.set(targetX, targetY);

    // Animate particles: subtle rotation of the entire system
    // --- NEW: Rotate the entire logo particle system ---
    if (particles) {
      particles.rotation.x += 0.0005;
      particles.rotation.y += 0.001;
    }

    // Camera subtle movement based on mouse position AND continuous oscillation
    const cameraOscillationSpeed = 0.0005;
    const cameraOscillationAmount = 0.05;
    camera.position.x = 2 * Math.sin(targetX * 0.00005) + Math.sin(Date.now() * cameraOscillationSpeed) * cameraOscillationAmount;
    camera.position.y = 2 * Math.cos(targetY * 0.00005) + Math.cos(Date.now() * cameraOscillationSpeed * 1.2) * cameraOscillationAmount;
    camera.lookAt(scene.position); // Always look at the center of the particle system
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// --- NEW: Initialize 3D Logo for Header (from previous step) ---
let logoScene, logoCamera, logoRenderer, logoMesh;
let logoAnimationFrameId;
let logoTargetRotationX = 0;
let logoTargetRotationY = 0;

function initThreeJsLogo() {
  const logoContainer = document.getElementById('threejs-logo-container');
  if (!logoContainer) {
    console.error("3D Logo container not found!");
    return;
  }

  // Create a new canvas for the logo
  const logoCanvas = document.createElement('canvas');
  logoCanvas.style.width = '100%';
  logoCanvas.style.height = '100%';
  logoContainer.appendChild(logoCanvas);

  logoScene = new THREE.Scene();
  // Use the actual dimensions of the container for the camera aspect ratio
  logoCamera = new THREE.PerspectiveCamera(75, logoContainer.offsetWidth / logoContainer.offsetHeight, 0.1, 1000);
  logoRenderer = new THREE.WebGLRenderer({ canvas: logoCanvas, antialias: true, alpha: true });
  // Set renderer size to match container dimensions for clarity
  logoRenderer.setSize(logoContainer.offsetWidth, logoContainer.offsetHeight);
  logoRenderer.setPixelRatio(window.devicePixelRatio);
  logoRenderer.setClearColor(0x000000, 0); // Transparent background

  // Load your logo texture
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('your_logo.png', // Path to your logo image
    function (texture) {
      // Apply better filtering for clarity
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Create a plane geometry for the logo, slightly larger
      const logoGeometry = new THREE.PlaneGeometry(1.2, 1.2); // Increased size
      const logoMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
      logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
      logoScene.add(logoMesh);

      // Position the camera, slightly further back to accommodate larger logo
      logoCamera.position.z = 1.8; // Adjusted camera position

      // Start logo animation loop
      animateThreeJsLogo();
    },
    undefined, // onProgress callback
    function (err) {
      console.error('An error occurred loading the logo texture for header:', err);
      // Fallback to static image if 3D logo fails to load
      const staticLogo = document.createElement('img');
      staticLogo.src = 'your_logo.png';
      staticLogo.alt = 'Logo';
      staticLogo.classList.add('logo'); // Apply existing logo styles
      logoContainer.replaceWith(staticLogo); // Replace the container with the static image
    }
  );

  // Handle logo container resize
  const onLogoContainerResize = () => {
    if (logoContainer && logoCamera && logoRenderer) {
      // Update canvas internal resolution to match display size
      logoCanvas.width = logoContainer.offsetWidth;
      logoCanvas.height = logoContainer.offsetHeight;

      logoCamera.aspect = logoContainer.offsetWidth / logoContainer.offsetHeight;
      logoCamera.updateProjectionMatrix();
      logoRenderer.setSize(logoContainer.offsetWidth, logoContainer.offsetHeight);
    }
  };
  window.addEventListener('resize', onLogoContainerResize);

  // Mouse interaction for the logo
  logoContainer.addEventListener('mousemove', (event) => {
    const rect = logoContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Normalize mouse position to -1 to 1
    logoTargetRotationY = (x / rect.width) * 2 - 1;
    logoTargetRotationX = (y / rect.height) * 2 - 1;
  });

  logoContainer.addEventListener('mouseleave', () => {
    logoTargetRotationX = 0;
    logoTargetRotationY = 0;
  });
}

function animateThreeJsLogo() {
  logoAnimationFrameId = requestAnimationFrame(animateThreeJsLogo);

  if (logoMesh) {
    // Smoothly interpolate rotation towards target
    logoMesh.rotation.x += (logoTargetRotationX * 0.5 - logoMesh.rotation.x) * 0.1;
    logoMesh.rotation.y += (logoTargetRotationY * 0.5 - logoMesh.rotation.y) * 0.1;

    // Add a subtle continuous rotation
    logoMesh.rotation.y += 0.005;
  }

  if (logoRenderer && logoScene && logoCamera) {
    logoRenderer.render(logoScene, logoCamera);
  }
}


window.addEventListener('load', () => {
  // Initialize Three.js loader
  if (typeof THREE !== 'undefined') {
    initThreeJsLoader();
    animateThreeJsLoader(); // Start the animation loop
  } else {
    console.warn("Three.js not loaded. Preloader will not show 3D animation.");
  }

  const mainPreloader = document.getElementById('preloader');
  if (mainPreloader) {
    // Give a small delay for the Three.js animation to be visible
    setTimeout(() => {
      mainPreloader.classList.add('fade-out');
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
      particles = null;
      preloaderCanvas = null;
      window.removeEventListener('resize', onLoaderCanvasResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('touchstart', onDocumentTouchStart);
      document.removeEventListener('touchmove', onDocumentTouchMove);


      setTimeout(() => mainPreloader.remove(), 900); // Remove after transition
    }, 3000); // Show main (Three.js) loader for at least 3 seconds
  }
});

// --- Function to initialize/re-initialize all page-specific scripts ---
// This function will be called on DOMContentLoaded and after each Barba page transition
function initPageScripts() {
  // ——— MOBILE MENU TOGGLE ———
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.getElementById('main-header'); // Get the header to calculate top offset

  if (nav && navToggle && header) {
    // Remove existing event listener to prevent duplicates after Barba transitions
    const oldNavToggle = navToggle.cloneNode(true);
    navToggle.parentNode.replaceChild(oldNavToggle, navToggle);
    const newNavToggle = oldNavToggle; // Renamed for clarity

    newNavToggle.addEventListener('click', () => {
      const expanded = newNavToggle.getAttribute('aria-expanded') === 'true';
      newNavToggle.setAttribute('aria-expanded', String(!expanded));
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

    itemsToRender.forEach(({ title, file }, index) => {
      const li = document.createElement('li');
      li.classList.add('reveal-item'); // Add reveal class
      li.style.setProperty('--item-index', index); // Set custom property for staggered delay
      li.innerHTML = `
        <span>${title}</span>
        <a href="${file}" target="_blank" rel="noopener">Download</a>
      `;
      ul.appendChild(li);
    });

    // Add "More" card if applicable AND there are more items than the initial limit
    if (showMoreCard && items.length > initialDisplayLimit) {
      const moreCard = document.createElement('li');
      moreCard.classList.add('more-card', 'reveal-item'); // Add reveal class to more card
      moreCard.style.setProperty('--item-index', initialDisplayLimit); // Set index for delay
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

  // Remove existing event listeners to prevent duplicates
  const oldCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(oldCloseBtn, closeBtn);
  const newCloseBtn = oldCloseBtn; // Renamed for clarity

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

  newCloseBtn.addEventListener('click', () => {
    fullScreenOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scrolling
  });

  // Close overlay if clicked outside content (on the overlay itself)
  fullScreenOverlay.addEventListener('click', (e) => {
    // Only close if the click is directly on the overlay, not its children
    if (e.target === fullScreenOverlay || e.target === newCloseBtn) {
      fullScreenOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });


  // ——— INTERSECTION OBSERVER FOR REVEAL ANIMATIONS ———
  // Select all elements that should be revealed
  const revealElements = document.querySelectorAll(
    '.hero-info, .hero-img img, .about-info, .about-grid img, .skills h2, .list-section h2, .testimonials h2, .contact h2, .skills-list li, .item-list li, .testimonial-card, .contact-form, .login-box, .welcome-message'
  );

  const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the item is visible
  };

  // Disconnect previous observer if it exists
  if (window.revealObserver) {
    window.revealObserver.disconnect();
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Stop observing once visible
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    // Add 'reveal-item' class to all elements that should be observed
    // This is important for the CSS to apply initial hidden state and transitions
    element.classList.add('reveal-item');
    observer.observe(element);
  });
  window.revealObserver = observer; // Store observer globally to disconnect later


  // Close nav when a nav link is clicked
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(link => {
    // Remove existing event listener to prevent duplicates
    const oldLink = link.cloneNode(true);
    link.parentNode.replaceChild(oldLink, link);
    const newLink = oldLink; // Renamed for clarity

    newLink.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        newNavToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Testimonial Slider (Drag functionality)
  const slider = document.querySelector('.testimonial-grid');
  let isDown = false;
  let startX;
  let scrollLeft;

  if (slider) {
    // Remove existing event listeners to prevent duplicates
    const oldSlider = slider.cloneNode(true);
    slider.parentNode.replaceChild(oldSlider, slider);
    const newSlider = oldSlider; // Renamed for clarity

    newSlider.addEventListener('mousedown', (e) => {
      isDown = true;
      newSlider.classList.add('active');
      startX = e.pageX - newSlider.offsetLeft;
      scrollLeft = newSlider.scrollLeft;
    });
    newSlider.addEventListener('mouseleave', () => {
      isDown = false;
      newSlider.classList.remove('active');
    });
    newSlider.addEventListener('mouseup', () => {
      isDown = false;
      newSlider.classList.remove('active');
    });
    newSlider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - newSlider.offsetLeft;
      const walk = (x - startX) * 2; // scroll speed
      newSlider.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    newSlider.addEventListener('touchstart', (e) => {
      isDown = true;
      newSlider.classList.add('active');
      startX = e.touches[0].pageX - newSlider.offsetLeft;
      scrollLeft = newSlider.scrollLeft;
    });
    newSlider.addEventListener('touchend', () => {
      isDown = false;
      newSlider.classList.remove('active');
    });
    newSlider.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - newSlider.offsetLeft;
      const walk = (x - startX) * 2;
      newSlider.scrollLeft = scrollLeft - walk;
    });
  }

  // Handle back-top button
  const backTopBtn = document.querySelector('.back-top');
  if (backTopBtn) {
    // Remove existing event listener to prevent duplicates
    const oldBackTopBtn = backTopBtn.cloneNode(true);
    backTopBtn.parentNode.replaceChild(oldBackTopBtn, backTopBtn);
    const newBackTopBtn = oldBackTopBtn; // Renamed for clarity

    newBackTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}


// --- GOOGLE SIGN-IN LOGIC ---
// parseJwt can remain here as it's used by showMainUI
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

// showMainUI remains the same
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

  // NEW: Show Lottie preloader briefly after main UI is shown
  const lottiePreloader = document.getElementById('lottie-preloader');
  if (lottiePreloader) {
    lottiePreloader.style.opacity = '1';
    lottiePreloader.style.visibility = 'visible';

    setTimeout(() => {
      lottiePreloader.style.opacity = '0';
      lottiePreloader.style.visibility = 'hidden';
      setTimeout(() => lottiePreloader.remove(), 900); // Remove after transition
    }, 2000); // Lottie preloader visible for 2 seconds
  }
}

// Handle sign out
const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) {
  signoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('user');
    // Google Sign-out (if using Google's JS API for sign-out)
    // This is the recommended way to revoke consent and clear Google's session
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect(); // Prevents auto-login on next visit
        // If you need to revoke consent for a specific user:
        // const userEmail = JSON.parse(sessionStorage.getItem('user'))?.email;
        // if (userEmail) {
        //     google.accounts.id.revoke(userEmail, done => {
        //         console.log('Consent revoked for:', userEmail, done);
        //     });
        // }
    }

    document.getElementById('popup-overlay').style.display = 'none';
    document.getElementById('signout-popup').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('profile-info').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex'; // Show login screen

    // If signing out, ensure Lottie preloader is removed if it somehow still exists
    const lottiePreloader = document.getElementById('lottie-preloader');
    if (lottiePreloader) {
      lottiePreloader.remove();
    }

    // NEW: Re-render the Google Sign-In button after logout
    // This is crucial because the GSI button might not re-initialize itself
    // when its container is hidden and then shown again.
    const g_id_signin_div = document.querySelector('.g_id_signin');
    if (g_id_signin_div) {
        // Clear its content to force a re-render
        g_id_signin_div.innerHTML = '';
        // Re-initialize the GSI button
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.renderButton(
                g_id_signin_div,
                { type: "standard", shape: "pill", theme: "outline", text: "signin_with", size: "large" } // Re-use your button configuration
            );
        }
    }
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

// ——— THEME TOGGLE (Global, outside Barba) ———
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


// ——— BARBA.JS & GSAP INTEGRATION ———
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Three.js Logo once, as it's outside the Barba container
  if (typeof THREE !== 'undefined') {
    initThreeJsLogo();
  } else {
    console.warn("Three.js not loaded. 3D logo will not be initialized.");
  }

  // Check for user session on initial load (if user was already logged in)
  // This part runs only once on initial page load, before Barba takes over.
  const userData = sessionStorage.getItem('user');
  if (userData) {
    console.log('User data found in session storage on DOMContentLoaded. Showing main UI.');
    const data = JSON.parse(userData);
    showMainUI(data);
  } else {
    console.log('No user data found in session storage. Showing login screen.');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('main-header').style.display = 'none';
  }

  // Initialize Barba.js
  barba.init({
    transitions: [{
      name: 'opacity-transition',
      leave(data) {
        // Animate out the old page
        return gsap.to(data.current.container, {
          opacity: 0,
          y: -50, // Slide up slightly
          duration: 0.5,
          ease: 'power2.out'
        });
      },
      enter(data) {
        // Animate in the new page
        return gsap.from(data.next.container, {
          opacity: 0,
          y: 50, // Slide down slightly
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    }],
    views: [{
      namespace: 'home', // Corresponds to data-barba-namespace="home" in index.html
      afterEnter() {
        // Re-initialize scripts specific to the 'home' namespace (which is our main content)
        // This ensures all event listeners, observers, and dynamic content are set up for the new DOM.
        initPageScripts();
      }
    }]
  });

  // Barba.js hooks for re-initializing scripts
  barba.hooks.after(() => {
    // This hook runs after every page transition (including initial load if using barba.once)
    // We call initPageScripts here to ensure all dynamic elements and event listeners
    // within the barba container are re-initialized.
    initPageScripts();
    // Scroll to top of the new page
    window.scrollTo(0, 0);
  });

  // Initial call to initPageScripts for the first page load (before Barba takes over subsequent loads)
  initPageScripts();
});
