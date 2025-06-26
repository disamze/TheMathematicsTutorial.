// google-auth-callback.js
// This script should be loaded BEFORE the Google Identity Services client library
// and BEFORE script.js to ensure handleCredentialResponse is globally available.

/**
 * Parses a JWT token to extract its payload.
 * @param {string} token The JWT token string.
 * @returns {object} The parsed payload object.
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT token:", e);
    return null;
  }
}

/**
 * Callback function for Google Sign-In.
 * This function is called by the Google Identity Services library after a user signs in.
 * @param {object} response The credential response object from Google.
 */
function handleCredentialResponse(response) {
  console.log("Google Sign-In credential response received.");
  if (response.credential) {
    try {
      const userData = parseJwt(response.credential);
      if (userData) {
        console.log("User Data:", userData);

        // Store user data in session storage
        sessionStorage.setItem('user', JSON.stringify(userData));

        // Call the showMainUI function defined in script.js
        // Ensure showMainUI is globally accessible (e.g., window.showMainUI)
        if (typeof window.showMainUI === 'function') {
          window.showMainUI(userData);
        } else {
          console.error("window.showMainUI is not defined. Login UI transition might fail.");
          // Fallback: manually show/hide elements if showMainUI isn't ready
          document.getElementById('login-screen').style.display = 'none';
          document.getElementById('main-content').style.display = 'block';
          document.getElementById('main-header').style.display = 'flex';
        }
      } else {
        console.error("Failed to parse user data from credential.");
        alert("Login failed. Could not process user data.");
      }
    } catch (error) {
      console.error("Error processing Google Sign-In credential:", error);
      alert("Login failed. Please try again.");
    }
  } else {
    console.error("No credential found in Google Sign-In response.");
    alert("Login failed. No credential received.");
  }
}
