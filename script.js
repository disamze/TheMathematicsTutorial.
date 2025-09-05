// ——— PRELOADER FADE-OUT ———
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      preloader.addEventListener('transitionend', () => {
        preloader.remove();
      }, { once: true });
    }, 3000); // Show loader for at least 3 seconds
  }

  // ——— AUTOMATIC THEME DETECTION ON LOAD ———
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.dataset.theme = 'dark';
    } else {
      document.documentElement.dataset.theme = 'light';
    }
  }

  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.innerHTML = document.documentElement.dataset.theme === 'dark'
      ? '<i class="bx bx-sun"></i>'
      : '<i class="bx bx-moon"></i>';
  }

  // Directly show login screen on load, no welcome screen
  const loginScreen = document.getElementById('login-screen');
  const mainContent = document.getElementById('main-content');
  const mainHeader = document.getElementById('main-header');

  if (loginScreen) loginScreen.style.display = 'flex';
  if (mainContent) mainContent.style.display = 'none';
  if (mainHeader) mainHeader.style.display = 'none';

  // Check for user session on load and display appropriate UI
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    showMainUI(currentUser);
  }
});


// ——— MAIN DOM CONTENT LOADED LOGIC ———
document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.nav a');

  // --- Custom Login System Elements ---
  const loginForm = document.getElementById('login-form');
  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  const loginMessage = document.getElementById('login-message');
  const loginScreen = document.getElementById('login-screen');
  const mainContent = document.getElementById('main-content');
  const mainHeader = document.getElementById('main-header');

  // --- Teacher Specific Elements ---
  const addNoteBtn = document.getElementById('add-note-btn');
  const addQuestionBtn = document.getElementById('add-question-btn');
  const addBookBtn = document.getElementById('add-book-btn');
  const scheduleSection = document.getElementById('schedule');
  const scheduleForm = document.getElementById('schedule-form');
  const scheduleList = document.getElementById('schedule-list');
  const manageStudentsSection = document.getElementById('manage-students');
  const addStudentForm = document.getElementById('add-student-form');
  const newStudentEmailInput = document.getElementById('new-student-email');
  const newStudentPasswordInput = document.getElementById('new-student-password');
  const addStudentMessage = document.getElementById('add-student-message');
  const studentsList = document.getElementById('students-list');

  // --- Resource Modals (Teacher Only) ---
  const addResourceModal = document.getElementById('add-resource-modal');
  const modalTitle = document.getElementById('modal-title');
  const resourceForm = document.getElementById('resource-form');
  const resourceTitleInput = document.getElementById('resource-title');
  const resourceFileInput = document.getElementById('resource-file');
  const resourceMessage = document.getElementById('resource-message');
  const closeModalButtons = document.querySelectorAll('.close-button');

  let currentResourceType = ''; // 'notes', 'questions', 'books'

  // --- Data Storage (Simulated Backend) ---
  // Initialize default users if none exist
  function initializeUsers() {
    let users = JSON.parse(localStorage.getItem('users'));
    if (!users || users.length === 0) {
      users = [
        { email: 'teacher@math.com', password: encryptPassword('teacherpass'), role: 'teacher', name: 'Teacher' },
        { email: 'student1@math.com', password: encryptPassword('studentpass1'), role: 'student', name: 'Student 1' },
        { email: 'student2@math.com', password: encryptPassword('studentpass2'), role: 'student', name: 'Student 2' }
      ];
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
  initializeUsers();

  // Initialize resources and schedules if none exist
  function initializeData() {
    if (!localStorage.getItem('notes')) localStorage.setItem('notes', JSON.stringify([]));
    if (!localStorage.getItem('questions')) localStorage.setItem('questions', JSON.stringify([]));
    if (!localStorage.getItem('books')) localStorage.setItem('books', JSON.stringify([]));
    if (!localStorage.getItem('schedules')) localStorage.setItem('schedules', JSON.stringify([]));
  }
  initializeData();

  // Simple password encryption (NOT SECURE FOR PRODUCTION)
  function encryptPassword(password) {
    return btoa(password); // Base64 encode
  }

  function decryptPassword(encryptedPassword) {
    return atob(encryptedPassword); // Base64 decode
  }

  // --- Login Logic ---
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginEmailInput.value;
      const password = loginPasswordInput.value;

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === email && decryptPassword(u.password) === password);

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainUI(user);
        loginMessage.textContent = '';
      } else {
        loginMessage.style.color = 'red';
        loginMessage.textContent = 'Invalid email or password.';
      }
    });
  }

  // --- Show Main UI based on User Role ---
  function showMainUI(user) {
    if (loginScreen) loginScreen.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    if (mainHeader) mainHeader.style.display = 'flex';

    const profileDiv = document.getElementById('profile-info');
    if (profileDiv) {
      profileDiv.innerHTML = `
        <img src="logo.png" alt="Profile Picture"> <!-- Placeholder image -->
        <span>${user.name || user.email.split('@')[0]}</span>
      `;
      profileDiv.style.display = 'flex';
    }

    // Adjust navigation and sections based on role
    const teacherNavLinks = document.querySelectorAll('.nav a[href="#schedule"], .nav a[href="#manage-students"]');
    const addResourceButtons = document.querySelectorAll('#add-note-btn, #add-question-btn, #add-book-btn');

    if (user.role === 'teacher') {
      teacherNavLinks.forEach(link => link.style.display = 'flex');
      addResourceButtons.forEach(btn => btn.style.display = 'block');
      if (scheduleForm) scheduleForm.style.display = 'grid'; // Teacher can see schedule form
      if (manageStudentsSection) manageStudentsSection.style.display = 'block'; // Teacher can manage students
    } else { // student
      teacherNavLinks.forEach(link => link.style.display = 'none');
      addResourceButtons.forEach(btn => btn.style.display = 'none');
      if (scheduleForm) scheduleForm.style.display = 'none'; // Student cannot see schedule form
      if (manageStudentsSection) manageStudentsSection.style.display = 'none'; // Student cannot manage students
    }

    // Render all dynamic content
    renderAllContent(user.role);
  }

  // --- Mobile Menu Toggle & Smooth Scrolling ---
  if (nav && navToggle && header) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');

      const headerHeight = header.offsetHeight;
      nav.style.top = `${headerHeight}px`;
      nav.style.height = `calc(100vh - ${headerHeight}px)`;
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          if (nav && nav.classList.contains('open')) {
            nav.classList.remove('open');
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
          }

          const headerOffset = header ? header.offsetHeight : 0;
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });

          navLinks.forEach(navLink => navLink.classList.remove('active'));
          this.classList.add('active');
        }
      }
    });
  });

  // --- Dynamic Content Rendering ---
  function renderList(items, containerId, userRole, showMoreCard = false) {
    const ul = document.getElementById(containerId);
    if (!ul) {
      console.warn(`Container with ID '${containerId}' not found.`);
      return;
    }
    ul.innerHTML = '';

    const initialDisplayLimit = 5;
    const itemsToRender = showMoreCard ? items.slice(0, initialDisplayLimit) : items;

    itemsToRender.forEach((item, index) => {
      const li = document.createElement('li');
      li.classList.add('reveal-item');
      li.style.setProperty('--item-index', index);

      let downloadLink = '';
      if (item.fileData) { // For notes, questions, books stored as base64
        const blob = base64toBlob(item.fileData, 'application/pdf');
        const url = URL.createObjectURL(blob);
        downloadLink = `<a href="${url}" download="${item.title}.pdf" aria-label="Download ${item.title}">Download</a>`;
      } else if (item.link) { // For schedule meeting links
        downloadLink = `<a href="${item.link}" target="_blank" rel="noopener" aria-label="Join ${item.title}">Join Meeting</a>`;
      }

      let teacherActions = '';
      if (userRole === 'teacher' && (containerId === 'notes-list' || containerId === 'questions-list' || containerId === 'books-list' || containerId === 'schedule-list')) {
        teacherActions = `
          <div class="teacher-actions">
            <button class="delete-btn" data-id="${item.id}" data-type="${containerId.replace('-list', '')}">Delete</button>
          </div>
        `;
      }

      if (containerId === 'schedule-list') {
        li.innerHTML = `
          <div class="schedule-info">
            <h4>${item.title}</h4>
            <p>${item.date} at ${item.time}</p>
            ${item.description ? `<p>${item.description}</p>` : ''}
            ${downloadLink}
          </div>
          ${teacherActions}
        `;
      } else if (containerId === 'students-list') {
        li.innerHTML = `
          <div class="student-info">
            <span>${item.email}</span>
            <p>Password: ${item.password}</p> <!-- Display encrypted password for teacher -->
          </div>
          <div class="teacher-actions">
            <button class="delete-btn" data-email="${item.email}" data-type="student">Remove</button>
          </div>
        `;
      } else {
        li.innerHTML = `
          <span>${item.title}</span>
          ${downloadLink}
          ${teacherActions}
        `;
      }
      ul.appendChild(li);
    });

    if (showMoreCard && items.length > initialDisplayLimit) {
      const moreCard = document.createElement('li');
      moreCard.classList.add('more-card', 'reveal-item');
      moreCard.style.setProperty('--item-index', initialDisplayLimit);
      let cardText = '';
      if (containerId === 'notes-list') cardText = 'More Notes';
      else if (containerId === 'questions-list') cardText = 'More Questions';
      else if (containerId === 'books-list') cardText = 'More Books';
      moreCard.innerHTML = `<span>${cardText}</span>`;
      moreCard.addEventListener('click', () => openFullScreenOverlay(containerId, userRole));
      ul.appendChild(moreCard);
    }

    // Add event listeners for delete buttons
    ul.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        const email = e.target.dataset.email; // For student removal

        if (type === 'student') {
          removeStudent(email);
        } else {
          deleteResource(id, type);
        }
      });
    });
  }

  function renderAllContent(userRole) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const questions = JSON.parse(localStorage.getItem('questions')) || [];
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const students = JSON.parse(localStorage.getItem('users')).filter(u => u.role === 'student') || [];

    renderList(notes, 'notes-list', userRole, true);
    renderList(questions, 'questions-list', userRole, true);
    renderList(books, 'books-list', userRole, true);
    renderList(schedules, 'schedule-list', userRole, false); // Schedule always shows all
    renderList(students, 'students-list', userRole, false); // Students always shows all
  }

  // --- Full-screen Overlay Logic ---
  const fullScreenOverlay = document.getElementById('full-screen-overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayList = document.getElementById('overlay-list');
  const closeBtn = fullScreenOverlay ? fullScreenOverlay.querySelector('.close-btn') : null;

  function openFullScreenOverlay(listType, userRole) {
    if (!fullScreenOverlay || !overlayTitle || !overlayList) {
      console.error("Full screen overlay elements not found.");
      return;
    }

    let itemsToDisplay = [];
    let title = '';

    if (listType === 'notes-list') {
      itemsToDisplay = JSON.parse(localStorage.getItem('notes')) || [];
      title = 'All Downloadable Notes';
    } else if (listType === 'questions-list') {
      itemsToDisplay = JSON.parse(localStorage.getItem('questions')) || [];
      title = 'All Practice Questions';
    } else if (listType === 'books-list') {
      itemsToDisplay = JSON.parse(localStorage.getItem('books')) || [];
      title = 'All Recommended Books';
    }

    overlayTitle.textContent = title;
    overlayList.innerHTML = '';

    itemsToDisplay.forEach((item) => {
      const li = document.createElement('li');
      const blob = base64toBlob(item.fileData, 'application/pdf');
      const url = URL.createObjectURL(blob);
      let teacherActions = '';
      if (userRole === 'teacher') {
        teacherActions = `
          <div class="teacher-actions">
            <button class="delete-btn" data-id="${item.id}" data-type="${listType.replace('-list', '')}">Delete</button>
          </div>
        `;
      }
      li.innerHTML = `
        <span>${item.title}</span>
        <a href="${url}" download="${item.title}.pdf" aria-label="Download ${item.title}">Download</a>
        ${teacherActions}
      `;
      overlayList.appendChild(li);
    });

    // Add event listeners for delete buttons in overlay
    overlayList.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        deleteResource(id, type);
        // Re-render overlay after deletion
        openFullScreenOverlay(listType, userRole);
      });
    });

    fullScreenOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (fullScreenOverlay) fullScreenOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (fullScreenOverlay) {
    fullScreenOverlay.addEventListener('click', (e) => {
      if (e.target === fullScreenOverlay || e.target === closeBtn) {
        fullScreenOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Helper to convert base64 to Blob
  function base64toBlob(base64, type = 'application/octet-stream') {
    const binStr = atob(base64);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type: type });
  }

  // --- Teacher: Add/Delete Resources (Notes, Questions, Books) ---
  const addResourceModalElement = document.getElementById('add-resource-modal');
  const resourceCloseButtons = addResourceModalElement ? addResourceModalElement.querySelectorAll('.close-button') : [];

  function openResourceModal(type) {
    currentResourceType = type;
    if (modalTitle) modalTitle.textContent = `Add New ${type.charAt(0).toUpperCase() + type.slice(1).replace(/s$/, '')}`;
    if (resourceForm) resourceForm.reset();
    if (resourceMessage) resourceMessage.textContent = '';
    if (addResourceModalElement) addResourceModalElement.style.display = 'flex';
  }

  function closeResourceModal() {
    if (addResourceModalElement) addResourceModalElement.style.display = 'none';
  }

  if (addNoteBtn) addNoteBtn.addEventListener('click', () => openResourceModal('notes'));
  if (addQuestionBtn) addQuestionBtn.addEventListener('click', () => openResourceModal('questions'));
  if (addBookBtn) addBookBtn.addEventListener('click', () => openResourceModal('books'));

  resourceCloseButtons.forEach(btn => btn.addEventListener('click', closeResourceModal));
  if (addResourceModalElement) {
    addResourceModalElement.addEventListener('click', (e) => {
      if (e.target === addResourceModalElement) closeResourceModal();
    });
  }

  if (resourceForm) {
    resourceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = resourceTitleInput.value;
      const file = resourceFileInput.files[0];

      if (!file) {
        if (resourceMessage) {
          resourceMessage.style.color = 'red';
          resourceMessage.textContent = 'Please select a PDF file.';
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = function(event) {
        const fileData = event.target.result.split(',')[1]; // Get base64 string
        const resources = JSON.parse(localStorage.getItem(currentResourceType)) || [];
        const newResource = {
          id: Date.now().toString(), // Simple unique ID
          title: title,
          fileData: fileData
        };
        resources.push(newResource);
        localStorage.setItem(currentResourceType, JSON.stringify(resources));

        if (resourceMessage) {
          resourceMessage.style.color = 'var(--accent)';
          resourceMessage.textContent = 'Resource added successfully!';
        }
        resourceForm.reset();
        renderAllContent(JSON.parse(localStorage.getItem('currentUser')).role);
        setTimeout(closeResourceModal, 1500);
      };
      reader.readAsDataURL(file);
    });
  }

  function deleteResource(id, type) {
    let resources = JSON.parse(localStorage.getItem(type)) || [];
    resources = resources.filter(res => res.id !== id);
    localStorage.setItem(type, JSON.stringify(resources));
    renderAllContent(JSON.parse(localStorage.getItem('currentUser')).role);
  }

  // --- Teacher: Manage Students ---
  if (addStudentForm) {
    addStudentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newStudentEmailInput.value;
      const password = newStudentPasswordInput.value;

      let users = JSON.parse(localStorage.getItem('users')) || [];
      if (users.some(u => u.email === email)) {
        addStudentMessage.style.color = 'red';
        addStudentMessage.textContent = 'Student with this email already exists.';
        return;
      }

      const newStudent = {
        email: email,
        password: encryptPassword(password),
        role: 'student',
        name: email.split('@')[0]
      };
      users.push(newStudent);
      localStorage.setItem('users', JSON.stringify(users));

      addStudentMessage.style.color = 'var(--accent)';
      addStudentMessage.textContent = 'Student added successfully!';
      addStudentForm.reset();
      renderAllContent(JSON.parse(localStorage.getItem('currentUser')).role);
    });
  }

  function removeStudent(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.email !== email);
    localStorage.setItem('users', JSON.stringify(users));
    renderAllContent(JSON.parse(localStorage.getItem('currentUser')).role);
  }

  // --- Teacher: Set Schedule ---
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('schedule-title').value;
      const date = document.getElementById('schedule-date').value;
      const time = document.getElementById('schedule-time').value;
      const link = document.getElementById('schedule-link').value;
      const description = document.getElementById('schedule-description').value;

      const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
      const newSchedule = {
        id: Date.now().toString(),
        title,
        date,
        time,
        link,
        description
      };
      schedules.push(newSchedule);
      localStorage.setItem('schedules', JSON.stringify(schedules));
      scheduleForm.reset();
      renderAllContent(JSON.parse(localStorage.getItem('currentUser')).role);
    });
  }

  // --- Theme Toggle ---
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      document.documentElement.dataset.theme = newTheme;
      localStorage.setItem('theme', newTheme);
      themeBtn.setAttribute('aria-expanded', String(isDark));
      themeBtn.innerHTML = isDark
        ? '<i class="bx bx-moon"></i>'
        : '<i class="bx bx-sun"></i>';
    });
  }

  // --- Intersection Observer for Reveal Animations ---
  const revealElements = document.querySelectorAll(
    '.hero-info, .hero-img img, .about-info, .about-grid img, .skills h2, .list-section h2, .testimonials h2, .contact h2, .skills-list li, .item-list li, .testimonial-card, .contact-form, .logo, .nav a, .footer p, .login-box'
  );

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    element.classList.add('reveal-item');
    observer.observe(element);
  });

  // --- Testimonial Slider ---
  const sliders = document.querySelectorAll('.testimonial-grid');

  sliders.forEach(slider => {
    if (slider) {
      let isDown = false;
      let startX;
      let scrollLeft;
      let scrollInterval;
      const scrollSpeed = 1;
      const scrollDelay = 50;

      const cards = Array.from(slider.children);
      if (cards.length > 0) {
        cards.forEach(card => {
          slider.appendChild(card.cloneNode(true));
        });
      }

      const startAutoScroll = () => {
        if (scrollInterval) clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
          slider.scrollLeft += scrollSpeed;
          if (slider.scrollLeft >= slider.scrollWidth / 2) {
            slider.scrollLeft = 0;
          }
        }, scrollDelay);
      };

      const stopAutoScroll = () => {
        clearInterval(scrollInterval);
      };

      if (slider.scrollWidth > slider.clientWidth) {
        startAutoScroll();
      }

      slider.addEventListener('mouseenter', stopAutoScroll);
      slider.addEventListener('mouseleave', startAutoScroll);
      slider.addEventListener('touchstart', stopAutoScroll);
      slider.addEventListener('touchend', startAutoScroll);

      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        stopAutoScroll();
      });
      slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
        startAutoScroll();
      });
      slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
        startAutoScroll();
      });
      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
      });

      slider.addEventListener('touchstart', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        stopAutoScroll();
      });
      slider.addEventListener('touchend', () => {
        isDown = false;
        slider.classList.remove('active');
        startAutoScroll();
      });
      slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
      });
    }
  });

  // --- Contact Form Submission & Validation ---
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  const formInputs = contactForm ? contactForm.querySelectorAll('input[required], textarea[required]') : [];

  const validateInput = (input) => {
    if (input.checkValidity()) {
      input.classList.remove('invalid');
      input.classList.add('valid');
      return true;
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
      return false;
    }
  };

  formInputs.forEach(input => {
    input.addEventListener('input', () => validateInput(input));
    input.addEventListener('blur', () => validateInput(input));
  });

  if (contactForm && formMessage) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let allInputsValid = true;
      formInputs.forEach(input => {
        if (!validateInput(input)) {
          allInputsValid = false;
        }
      });

      if (!allInputsValid) {
        formMessage.style.color = 'red';
        formMessage.textContent = 'Please fill in all required fields correctly.';
        return;
      }

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          formMessage.style.color = 'var(--accent)';
          formMessage.textContent = 'Message sent successfully! We will get back to you soon.';
          contactForm.reset();
          formInputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
          });
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

  // --- Active Navigation Link on Scroll ---
  const sections = document.querySelectorAll('section[id]');
  const headerHeight = header ? header.offsetHeight : 0;

  const activateNavLink = (id) => {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
      }
    });
  };

  let currentActiveSection = '';
  for (let i = 0; i < sections.length; i++) {
    const rect = sections[i].getBoundingClientRect();
    if (rect.top <= headerHeight + 50 && rect.bottom >= headerHeight + 50) {
      currentActiveSection = sections[i].id;
      break;
    }
  }
  if (currentActiveSection) {
    activateNavLink(currentActiveSection);
  } else if (sections.length > 0) {
    activateNavLink(sections[0].id);
  }

  const sectionObserverOptions = {
    root: null,
    rootMargin: `-${headerHeight}px 0px 0px 0px`,
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activateNavLink(entry.target.id);
      }
    });
  }, sectionObserverOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // --- Back to Top Button Visibility & Scroll ---
  const backToTopBtn = document.querySelector('.back-top');
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      if (window.scrollY > window.innerHeight / 2) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    };

    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop();
  }

}); // End of DOMContentLoaded

// --- Sign Out Logic ---
const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) {
  signoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');

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

// --- Handle Profile Click to Show Popup ---
document.addEventListener('click', (e) => {
  const profileInfo = e.target.closest('#profile-info');
  const popupOverlay = document.getElementById('popup-overlay');
  const signoutPopup = document.getElementById('signout-popup');

  if (profileInfo) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && popupOverlay && signoutPopup) {
      document.getElementById('popup-name').textContent = currentUser.name || currentUser.email.split('@')[0];
      document.getElementById('popup-pic').src = 'logo.png'; // Placeholder image
      popupOverlay.style.display = 'block';
      signoutPopup.style.display = 'block';
    }
  }
});

// --- Hide Popup on Outside Click ---
const popupOverlay = document.getElementById('popup-overlay');
if (popupOverlay) {
  popupOverlay.addEventListener('click', (e) => {
    const signoutPopup = document.getElementById('signout-popup');
    if (e.target === popupOverlay && signoutPopup) {
      popupOverlay.classList.remove('active');
      signoutPopup.classList.remove('active');
      popupOverlay.style.display = 'none';
      signoutPopup.style.display = 'none';
    }
  });
}
