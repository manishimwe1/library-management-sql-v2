import { API_BASE } from "../../lib/index.js";

const emailInput = document.getElementById("email");
const signUpForm = document.getElementById("signInForm");
const passwordInput = document.getElementById("password");
const errorParag = document.getElementById("error");

async function handleSubmitForm(e) {
  const email = emailInput.value;
  const password = passwordInput.value;
  e.preventDefault();
  try {
    const response = await fetch(`${API_BASE}/auth/${email}`);
    if (response.ok) {
      errorParag.style.display = "none";
      const user = await response.json();
      if (password !== user.data.password) {
        console.log("password does not match");
        errorParag.style.display = "block";
        errorParag.innerText = "incorrect password ";
        return;
      } else {
        errorParag.style.display = "none";
        errorParag.innerText = "";
        window.localStorage.setItem(
          "session_user_login",
          JSON.stringify({
            value: `secure_token`,
            createAt: new Date(),
          }),
        );
        window.location.href = "/frontend/";
      }
    }
  } catch (error) {
    console.log(error);
  }
}

signUpForm.addEventListener("submit", handleSubmitForm);
