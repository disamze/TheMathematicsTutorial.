// ——— PRELOADER FADE-OUT ———
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Give a small delay for the Lottie animation to be visible
    setTimeout(() => {
      preloader.classList.add('fade-out');
      // Remove preloader from DOM after transition
      preloader.addEventListener('transitionend', () => {
        preloader.remove();
      }, { once: true });
    }, 3000); // Show loader for at least 3 seconds
  }

  // Check for user session on load
  const userData = sessionStorage.getItem('user');
  const loginScreen = document.getElementById('login-screen');
  const mainContent = document.getElementById('main-content');
  const mainHeader = document.getElementById('main-header');

  if (userData) {
    const data = JSON.parse(userData);
    showMainUI(data);
  } else {
    // If no user data, ensure login screen is visible
    if (loginScreen) loginScreen.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
    if (mainHeader) mainHeader.style.display = 'none';
  }
});

// ——— MOBILE MENU TOGGLE & SMOOTH SCROLLING ———
document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.nav a');

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

  // Smooth scrolling for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      // Check if it's an internal link (starts with #)
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Close mobile nav if open
          if (nav && nav.classList.contains('open')) {
            nav.classList.remove('open');
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
          }

          // Scroll to the target element smoothly
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });

          // Adjust scroll position for fixed header if necessary
          // This is a common pattern for fixed headers
          const headerOffset = header ? header.offsetHeight : 0;
          window.scrollBy(0, -headerOffset);
        }
      }
    });
  });

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
    console.warn(`Client-side JavaScript cannot directly list files from '${directoryPath}'.
                  You need a server-side solution or a pre-generated list of files.`);

    // For demonstration, we'll just return an empty array or add some dummy files
    // You would replace this with actual logic to get file names from your server/build
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
    } else if (type === 'books') {
      return [
        { title: 'New Fetched Book 1', file: 'new_fetched_book_1.pdf' },
        { title: 'New Fetched Book 2', file: 'new_fetched_book_2.pdf' },
      ];
    }
    return [];
  }

  // Fetch additional files and combine with initial lists
  // Using Promise.all to fetch all data concurrently
  const [fetchedNotes, fetchedQuestions, fetchedBooks] = await Promise.all([
    fetchFiles('notes_directory', 'notes'),
    fetchFiles('questions_directory', 'questions'),
    fetchFiles('books_directory', 'books')
  ]);

  // Deduplicate and update global arrays
  allNotes = [...new Map([...initialNotes, ...fetchedNotes].map(item => [item.file, item])).values()];
  allQuestions = [...new Map([...initialQuestions, ...fetchedQuestions].map(item => [item.file, item])).values()];
  allBooks = [...new Map([...initialBooks, ...fetchedBooks].map(item => [item.file, item])).values()];


  function renderList(items, containerId, showMoreCard = false) {
    const ul = document.getElementById(containerId);
    if (!ul) {
      console.warn(`Container with ID '${containerId}' not found.`);
      return;
    }
    ul.innerHTML = ''; // Clear existing content

    const initialDisplayLimit = 5; // Number of items to show initially

    // Determine which items to display for the initial view
    const itemsToRender = showMoreCard ? items.slice(0, initialDisplayLimit) : items;

    itemsToRender.forEach(({ title, file }, index) => {
      const li = document.createElement('li');
      li.classList.add('reveal-item'); // Add reveal class
      li.style.setProperty('--item-index', index); // Set custom property for staggered delay
      li.innerHTML = `
        <span>${title}</span>
        <a href="${file}" target="_blank" rel="noopener" aria-label="Download ${title}">Download</a>
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
  const closeBtn = fullScreenOverlay ? fullScreenOverlay.querySelector('.close-btn') : null;

  function openFullScreenOverlay(listType) {
    if (!fullScreenOverlay || !overlayTitle || !overlayList) {
      console.error("Full screen overlay elements not found.");
      return;
    }

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
        <a href="${file}" target="_blank" rel="noopener" aria-label="Download ${title}">Download</a>
      `;
      overlayList.appendChild(li);
    });

    fullScreenOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling body when overlay is open
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (fullScreenOverlay) fullScreenOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Restore body scrolling
    });
  }

  // Close overlay if clicked outside content (on the overlay itself)
  if (fullScreenOverlay) {
    fullScreenOverlay.addEventListener('click', (e) => {
      // Check if the click target is the overlay itself or the close button
      if (e.target === fullScreenOverlay || e.target === closeBtn) {
        fullScreenOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }


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

  // ——— INTERSECTION OBSERVER FOR REVEAL ANIMATIONS ———
  // Select all elements that should be revealed
  const revealElements = document.querySelectorAll(
    '.hero-info, .hero-img img, .about-info, .about-grid img, .skills h2, .list-section h2, .testimonials h2, .contact h2, .skills-list li, .item-list li, .testimonial-card, .contact-form, .logo, .nav a, .footer p, .login-box, .welcome-message'
  );

  const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the item is visible
  };

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
      scrollLeft = slider.scrollLeft; // Store current scroll position
    });
    slider.addEventListener('touchend', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      e.preventDefault(); // Prevent scrolling the page
      const x = e.touches[0].pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    });
  }

  // ——— CONTACT FORM SUBMISSION ———
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');

  if (contactForm && formMessage) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent default form submission

      // Basic client-side validation
      const name = contactForm.querySelector('[name="name"]').value;
      const email = contactForm.querySelector('[name="email"]').value;
      const phone = contactForm.querySelector('[name="phone"]').value;
      const message = contactForm.querySelector('[name="message"]').value;

      if (!name || !email || !phone || !message) {
        formMessage.style.color = 'red';
        formMessage.textContent = 'Please fill in all required fields.';
        return;
      }

      // Use FormData to easily get form data
      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json' // Important for FormSubmit.co to return JSON
          }
        });

        if (response.ok) {
          formMessage.style.color = 'var(--accent)';
          formMessage.textContent = 'Message sent successfully! We will get back to you soon.';
          contactForm.reset(); // Clear the form
        } else {
          const data = await response.json();
          formMessage.style.color = 'red';
          formMessage.textContent = data.message || 'Oops! There was an error sending your message.';
        }
      } catch (error) {
        console.error('Form submission error:', error);
        formMessage.style.color = 'red';
        formMessage.textContent = 'Network error. Please try again later.';
      }
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
  const loginScreen = document.getElementById('login-screen');
  const mainContent = document.getElementById('main-content');
  const mainHeader = document.getElementById('main-header');
  const profileDiv = document.getElementById('profile-info');
  const popupName = document.getElementById('popup-name');
  const popupPic = document.getElementById('popup-pic');

  if (loginScreen) loginScreen.style.display = 'none';
  if (mainContent) mainContent.style.display = 'block';
  if (mainHeader) mainHeader.style.display = 'flex'; // Use flex for header

  if (profileDiv && data.picture && data.name) {
    profileDiv.innerHTML = `
      <img src="${data.picture}" alt="Profile Picture">
      <span>${data.name.split(' ')[0]}</span> <!-- Display first name -->
    `;
    profileDiv.style.display = 'flex';
  }

  // Set data for signout popup
  if (popupName) popupName.textContent = data.name;
  if (popupPic) popupPic.src = data.picture;
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

    const popupOverlay = document.getElementById('popup-overlay');
    const signoutPopup = document.getElementById('signout-popup');
    const mainContent = document.getElementById('main-content');
    const mainHeader = document.getElementById('main-header');
    const profileInfo = document.getElementById('profile-info');
    const loginScreen = document.getElementById('login-screen');

    if (popupOverlay) popupOverlay.style.display = 'none';
    if (signoutPopup) signoutPopup.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (mainHeader) mainHeader.style.display = 'none';
    if (profileInfo) profileInfo.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex'; // Show login screen
  });
}

// Handle profile click to show popup
document.addEventListener('click', (e) => {
  const profileInfo = e.target.closest('#profile-info');
  const popupOverlay = document.getElementById('popup-overlay');
  const signoutPopup = document.getElementById('signout-popup');

  if (profileInfo) {
    const data = JSON.parse(sessionStorage.getItem('user'));
    if (data && popupOverlay && signoutPopup) {
      document.getElementById('popup-name').textContent = data.name;
      document.getElementById('popup-pic').src = data.picture;
      popupOverlay.style.display = 'block';
      signoutPopup.style.display = 'block';
    }
  }
});

// Hide popup on outside click
const popupOverlay = document.getElementById('popup-overlay');
if (popupOverlay) {
  popupOverlay.addEventListener('click', (e) => {
    const signoutPopup = document.getElementById('signout-popup');
    // Only close if the click is directly on the overlay, not its children
    if (e.target === popupOverlay && signoutPopup) {
      popupOverlay.style.display = 'none';
      signoutPopup.style.display = 'none';
    }
  });
}
