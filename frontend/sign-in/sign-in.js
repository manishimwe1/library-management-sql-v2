import { API_BASE } from "../../lib/index.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInForm = document.getElementById("signInForm");
const message = document.getElementById("message");

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
  const userSession = localStorage.getItem('userSession');
  if (userSession) {
    // User is already logged in, redirect to home
    window.location.href = "/";
  }
});

async function handleSubmitForm(e) {
  const email = emailInput.value;
  const password = passwordInput.value;
  e.preventDefault();
  try {
    const response = await fetch(`${API_BASE}/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store user session and token in localStorage
      localStorage.setItem('userSession', JSON.stringify({
        userId: data.user.id,
        email: data.user.email,
        username: data.user.username
      }));
      localStorage.setItem('authToken', data.token);
      window.location.href = "/";
    } else {
      const data = await response.json();
      message.innerText = data.message;
    }
  } catch (error) {
    console.log(error);
  }
}

signInForm.addEventListener("submit", handleSubmitForm);
