window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  pre.classList.add('fade-out');
  setTimeout(() => pre.remove(), 900);
});

function handleCredentialResponse(response) {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('signout-btn').style.display = 'block';
  document.getElementById('welcome-message').textContent = 'Welcome!';
}

document.getElementById('signout-btn').addEventListener('click', () => {
  location.reload();
});
