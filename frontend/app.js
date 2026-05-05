import { API_BASE } from "../lib/index.js";

const bookContainer = document.getElementById("book-container");
const navLink = document.getElementById("navLink");
const bookCard = document.getElementsByClassName("book-card");
const profile = document.getElementById("profile");
const userIcon = document.getElementById("user-icon");
const signInBtn = document.getElementById("signInBtn");
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault();

    const searchValue = searchInput.value;

    window.location.href = `/search/?${searchValue}`;
  }
});

// Session Management
function checkUserSession() {
  const userSession = localStorage.getItem("userSession");
  if (userSession) {
    const user = JSON.parse(userSession);
    // User is logged in
    signInBtn.style.display = "none";
    if (profile) {
      profile.innerHTML = `
                <span style="color: white; margin-right: 15px;">Welcome, ${user.username}!</span>
                <button id="logoutBtn" style="padding: 8px 15px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Logout</button>
            `;
      document.getElementById("logoutBtn").addEventListener("click", logout);
    }
    return user;
  } else {
    // User is not logged in - redirect to sign-in
    window.location.href = "/sign-in/sign-in.html";
    return null;
  }
}

function logout() {
  localStorage.removeItem("userSession");
  window.location.href = "/sign-in/sign-in.html";
}

// Check session on page load
const currentUser = checkUserSession();

const navLinks = [
  {
    label: "Home",
    active: true,
    link: "/",
  },
  {
    label: "Dashboard",
    active: false,
    link: "/dashboard/dashboard.html",
  },
  {
    label: "Books",
    active: false,
    link: "/books",
  },
  {
    label: "Add books",
    active: false,
    link: "/books",
  },
];

let clickedCard = null;

const currentPath = window.location.pathname;

signInBtn.addEventListener("click", () => {
  window.location.href = "/sign-in/sign-in.html";
});

async function displayBooks() {
  const response = await fetch("http://localhost:3000/api/books");
  const books = await response.json();
  books.map((book) => {
    const bookElement = document.createElement("div");
    const bookCard = document.createElement("div");

    const bookImage = document.createElement("img");
    const bookName = document.createElement("h2");
    const bookAuthor = document.createElement("p");
    const bookDescription = document.createElement("p");
    const bookPrice = document.createElement("p");
    const bookSpan = document.createElement("span");

    bookImage.src = book.imageSrc;
    bookName.textContent = book.name;
    bookAuthor.textContent = `Author: ${book.author}`;
    bookDescription.textContent = book.description;
    bookPrice.textContent = `Price: `;
    bookSpan.textContent = `$${book.price.toFixed(2)}`;

    bookElement.className = "book-element";
    bookName.className = "book-title";
    bookAuthor.className = "book-author";
    bookDescription.className = "book-desc";
    bookPrice.className = "book-price";
    bookImage.className = "bookImage";
    bookCard.className = "book-card";
    bookSpan.className = "book-span-price";

    bookElement.appendChild(bookImage);
    bookCard.appendChild(bookName);
    bookCard.appendChild(bookAuthor);
    bookCard.appendChild(bookDescription);
    bookCard.appendChild(bookPrice);
    bookPrice.appendChild(bookSpan);

    bookElement.appendChild(bookCard);
    bookContainer.appendChild(bookElement);
    bookElement.addEventListener("click", (e) => {
      viewBook(book.id);
    });
  });
}

function viewBook(bookId) {
  if (!bookId) {
    return console.log("missing id");
  }
  window.location.href = `/view/?${bookId}`;
}

function displayNavLinks() {
  navLinks.map((link, i) => {
    const navLinkElement = document.createElement("li");
    const navLinkHref = document.createElement("a");
    navLinkHref.innerText = `${link.label}`;
    navLinkHref.href = `${link.link}`;
    navLinkElement.className = "nav-link";
    navLinkElement.appendChild(navLinkHref);
    navLink.appendChild(navLinkElement);
  });
}

displayBooks();

displayNavLinks();
