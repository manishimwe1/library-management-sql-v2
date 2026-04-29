
const userNameInput = document.getElementById("userName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const signUpForm = document.getElementById("signUpForm");
const errorParag = document.getElementById("error");
const formInput = document.getElementById("formInput");

const API_BASE = "http://localhost:3000/api";

emailInput.addEventListener("focus", () => {
  errorParag.innerText = "";
});

const handleSubmitForm = async (e) => {
  e.preventDefault();
  
  const username = userNameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirm = confirmPasswordInput.value;

  console.log({
    username,
    password,
    email,
    confirm,
  });

  if (password !== confirm) {
    return alert(`password doesn't match`);
  }

  try {
    const response = await fetch(`${API_BASE}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    if (response.ok) {
      
      errorParag.style.display = "none";
      const data = await response.json();
      if (response.status === 201) {
        window.location.href = "/frontend/sign-in/sign-in.html";
      }
    } else {
      const errorData = await response.json();
      errorParag.innerText = errorData.message || errorData;
      errorParag.style.display = "block";
      formInput.classList.add("error");
    }
  } catch (error) {
    console.log(error);
  }
};

signUpForm.addEventListener("submit", handleSubmitForm);
