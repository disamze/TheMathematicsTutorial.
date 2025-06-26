// This file contains the global callback function required by Google Sign-In.
// It must be loaded BEFORE the Google Identity Services script in index.html.

// This function must be globally accessible for Google Sign-In
window.handleCredentialResponse = function (response) {
  // Store the credential in sessionStorage.
  // The main script (script.js) will then pick this up and process it.
  sessionStorage.setItem('googleCredential', response.credential);

  // Dispatch a custom event that script.js can listen for.
  // This ensures script.js knows when a new credential has arrived.
  const event = new CustomEvent('googleCredentialReceived');
  document.dispatchEvent(event);
};
