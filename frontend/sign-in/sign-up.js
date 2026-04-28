const userNameInput = document.getElementById("userName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const signUpForm = document.getElementById("signUpForm");

const API_BASE = "http://localhost:3000/api";

const handleSubmitForm = async (e) => {
  e.preventDefault();

  const userName = userNameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirm = confirmPasswordInput.value;

  console.log({
    userName,
    password,
    email,
    confirm,
  });

  if (password !== confirm) {
    return alert(`password doesn't match`);
  }

  const response = await fetch(`${API_BASE}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName,
      email,
      password,
    }),
  });
};

signUpForm.addEventListener("submit", handleSubmitForm);
