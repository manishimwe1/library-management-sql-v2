import { API_BASE } from "../../lib/index.js";

const searchText = document.getElementById("searchText");
const bookContainer = document.getElementById("book-container");

document.addEventListener("DOMContentLoaded", async () => {
  const params = window.location.href.split("?");

  const searchValue = decodeURIComponent(params[1]);
  console.log(searchValue);

  if (searchValue) {
    searchText.innerText = searchValue;

    const response = await fetch(`${API_BASE}/search/${searchValue}`);

    if (response.ok) {
      const result = await response.json();

      console.log(result);
    
      const bookElement = document.createElement("div");
      const bookCard = document.createElement("div");

      const bookCover = document.createElement("img");
      const bookDescWraper = document.createElement("div");
      const bookName = document.createElement("p");
      const bookDescription = document.createElement("p");
      const bookPrice = document.createElement("p");
      const bookAuthor = document.createElement("p");

      bookCover.src = result.data.imageSrc;
      bookCover.alt = result.data.name;
      bookName.innerText = result.data.name;
      bookPrice.innerText = result.data.price;
      bookDescription.innerText = result.data.description;
      bookAuthor.innerText = result.data.author;

      bookElement.className = "book-element";
      bookName.className = "book-title";
      bookAuthor.className = "book-author";
      bookDescription.className = "book-desc";
      bookPrice.className = "book-price";
      bookCover.className = "bookImage";
      bookCard.className = "book-card";
    //   bookSpan.className = "book-span-price";

      bookDescWraper.appendChild(bookName);
      bookDescWraper.appendChild(bookDescription);
      bookDescWraper.appendChild(bookPrice);
      bookDescWraper.appendChild(bookAuthor);
      bookCard.appendChild(bookCover);
      bookCard.appendChild(bookDescWraper);
      bookElement.appendChild(bookCard)
      bookContainer.appendChild(bookElement);
    }
  }
});
