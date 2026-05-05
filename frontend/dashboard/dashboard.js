import { API_BASE } from "../../lib/index.js";

const modal = document.getElementById("modal");
const addBookBtn = document.getElementById("add-book-btn");
const closeBtn = document.getElementById("close-modal");
const submitForm = document.getElementById("submit-form");
const saveBookBtn = document.getElementById("add-book");
const bookTable = document.getElementById("book-table");
const tableBody = document.getElementById("table-body");
const emptyState = document.getElementById("empty-state");
const categorySelect = document.getElementById("category");
const newCategoryInput = document.getElementById("new-category");

// Store categories
let categories = new Set();

//show empty state
function showEmptyState() {
  emptyState.classList.add("show");
  bookTable.style.display = "none";
}
//hide empty state
function hideEmptyState() {
  emptyState.classList.remove("show");
  bookTable.style.display = "table";
}

// Load categories from API
const loadCategories = async () => {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) {
      console.log("error in getting categories");
      return;
    }

    const categoriesData = await response.json();
    categories.clear();
    categoriesData.forEach(cat => {
      categories.add(cat.name);
    });
    updateCategorySelect();
  } catch (error) {
    console.log("error loading categories:", error);
  }
};

// Update category select options
function updateCategorySelect() {
  // Keep the first two options (Select a category and Create new category)
  const defaultOptions = [
    '<option value="">Select a category</option>',
    '<option value="new">+ Create new category</option>'
  ];

  // Add existing categories
  const categoryOptions = Array.from(categories)
    .sort()
    .map(category => `<option value="${category}">${category}</option>`);

  categorySelect.innerHTML = [...defaultOptions, ...categoryOptions].join('');
}

// Handle category selection change
categorySelect.addEventListener("change", function () {
  if (this.value === "new") {
    newCategoryInput.classList.add("show");
    newCategoryInput.focus();
  } else {
    newCategoryInput.classList.remove("show");
    newCategoryInput.value = "";
  }
});

// submit books
async function handleBookSubmit(e) {
  e.preventDefault();
  submitForm.disabled = true;

  // If editing, call update function instead
  if (currentEditingBookId) {
    await handleBookUpdate(currentEditingBookId);
    return;
  }

  const nameInput = document.getElementById("name").value;
  const descInput = document.getElementById("description").value;
  const authorInput = document.getElementById("author").value;
  const priceInput = document.getElementById("price").value;
  const imageInput = document.getElementById("image");

  // Get category value
  let categoryValue = categorySelect.value;
  if (categoryValue === "new") {
    categoryValue = newCategoryInput.value.trim() || "Uncategorized";
  } else if (!categoryValue) {
    categoryValue = "Uncategorized";
  }

  const file = imageInput.files[0];

  if (!file) {
    console.log("No file selected");
    submitForm.disabled = false;
    return;
  }

  const reader = new FileReader();

  reader.onerror = function () {
    console.log("Error reading file:", reader.error);
    submitForm.disabled = false;
  };

  reader.onload = async function () {
    const imageSrc = reader.result; // Base64 data URL
    console.log("Image converted to Base64, length:", imageSrc.length);

    if (!imageSrc) {
      console.log("Error: imageSrc is null or empty");
      submitForm.disabled = false;
      return;
    }

    try {
      const addNewBooks = await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput,
          description: descInput,
          author: authorInput,
          price: priceInput,
          category: categoryValue,
          imageSrc, // Base64 data URL
        }),
      });

      const result = await addNewBooks.json();
      console.log("Book added successfully:", result);

      if (result.message && result.message.includes("successfully")) {
        // Add new category to set if it was created
        if (categoryValue && categoryValue !== "Uncategorized") {
          categories.add(categoryValue);
          updateCategorySelect();
        }

        // Clear form
        submitForm.reset();
        newCategoryInput.classList.remove("show");
        modal.style.display = "none";
        loadBooks(); // Refresh the books table
      }
    } catch (error) {
      console.log("Error adding book:", error);
    } finally {
      submitForm.disabled = false;
    }
  };

  reader.readAsDataURL(file);
  console.log("File selected:", file.name);
}

// load books
const loadBooks = async () => {
  try {
    const response = await fetch(`${API_BASE}/books`);
    if (!response.ok) {
      console.log("error in getting data");
      return;
    }

    const books = await response.json();
    displayBooks(books);
  } catch (error) {
    showEmptyState();
    console.log(error);
  }
};

const displayBooks = (books) => {
  tableBody.innerHTML = "";

  if (books.length === 0) {
    console.log("there is no books found");
    showEmptyState();
    return;
  }

  hideEmptyState();

  books.forEach((book, index) => {
    const row = createHtmlRow(book, index);
    tableBody.appendChild(row);
  });
};

const createHtmlRow = (book, index) => {
  console.log({book});
  
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><strong>${index + 1}</strong></td>
    <td><strong>${book.name}</strong></td>
    <td class='truncate'>${book.author}</td>
    <td><span class="category-badge">${book.category || "Uncategorized"}</span></td>
    <td class='truncate'>${book.description}</td>
    <td class='truncate'>
      <img class='table-image' src=${book.imageSrc} alt=${book.name} />
    </td>
    <td class='truncate'>${book.price}</td>
    <td>
      <div class='action-cell'>
        <button class='btn-action btn-view' data-action='view' data-book-id='${book.id}'>View</button>
        <button class='btn-action btn-edit' data-action='edit' data-book-id='${book.id}'>Edit</button>
        <button class='btn-action btn-delete' data-action='delete' data-book-id='${book.id}'>Delete</button>
      </div>
    </td>
  `;

  // Add event listeners to action buttons
  const editBtn = row.querySelector('[data-action="edit"]');
  const deleteBtn = row.querySelector('[data-action="delete"]');
  const viewBookBtn = row.querySelector('[data-action="view"]');

  if (editBtn) {
    editBtn.addEventListener('click', () => editBook(book.id));
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => deleteBook(book.id));
  }
  if (viewBookBtn) {
    viewBookBtn.addEventListener('click', () => viewBook(book.id));
  }

  return row;
};

const nameInput = document.getElementById("name");
const descInput = document.getElementById("description");
const authorInput = document.getElementById("author");
const priceInput = document.getElementById("price");
const image = document.getElementById("image");

let currentEditingBookId = null;

//edit book function
async function editBook(bookId) {
  if (!bookId) {
    return console.log("missing bookId");
  }
  try {
    const response = await fetch(`${API_BASE}/books/${bookId}`);
    if (response.ok) {
      const existingBook = await response.json();

      if (existingBook) {
        nameInput.value = existingBook.name;
        descInput.value = existingBook.description;
        authorInput.value = existingBook.author;
        priceInput.value = existingBook.price;
        image.dataset.bookId = bookId;

        // Handle category
        const categoryValue = existingBook.category || "Uncategorized";

        // Check if category exists in our set
        if (categories.has(categoryValue)) {
          categorySelect.value = categoryValue;
          newCategoryInput.classList.remove("show");
        } else if (categoryValue !== "Uncategorized") {
          // If it's a new category not in our set, add it and select it
          categories.add(categoryValue);
          updateCategorySelect();
          categorySelect.value = categoryValue;
          newCategoryInput.classList.remove("show");
        } else {
          categorySelect.value = "";
          newCategoryInput.classList.remove("show");
        }

        currentEditingBookId = bookId;
        modal.style.display = "flex";
      }
    } else {
      console.log("Book not found");
      alert("Unable to load book details");
    }
  } catch (error) {
    console.log("Error fetching book:", error);
    alert("Error loading book");
  }
}

//view book function
async function viewBook(bookId) {
  if (!bookId) {
    return console.log("missing bookId");
  }
  try {
    const response = await fetch(`${API_BASE}/books/${bookId}`);
    if (response.ok) {
      const book = await response.json();
      alert(`Book Details:\n\nName: ${book.name}\nAuthor: ${book.author}\nDescription: ${book.description}\nPrice: $${book.price}\nCategory: ${book.category || 'Uncategorized'}`);
    }
  } catch (error) {
    console.log("Error fetching book:", error);
    alert("Error loading book");
  }
}

async function handleBookUpdate(bookId) {
  submitForm.disabled = true;
  const nameInput = document.getElementById("name").value;
  const descInput = document.getElementById("description").value;
  const authorInput = document.getElementById("author").value;
  const priceInput = document.getElementById("price").value;

  // Get category value
  let categoryValue = categorySelect.value;
  if (categoryValue === "new") {
    categoryValue = newCategoryInput.value.trim() || "Uncategorized";
  } else if (!categoryValue) {
    categoryValue = "Uncategorized";
  }

  try {
    const response = await fetch(`${API_BASE}/books/${bookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput,
        description: descInput,
        author: authorInput,
        price: priceInput,
        category: categoryValue,
      }),
    });

    if (response.ok) {
      // Add new category to set if it was created
      if (categoryValue && categoryValue !== "Uncategorized") {
        categories.add(categoryValue);
        updateCategorySelect();
      }

      submitForm.reset();
      newCategoryInput.classList.remove("show");
      modal.style.display = "none";
      currentEditingBookId = null;
      loadCategories(); // Refresh categories
      loadBooks();
      alert("Book updated successfully");
    }
  } catch (error) {
    console.log("Error updating book:", error);
    alert("Error updating book");
  } finally {
    submitForm.disabled = false;
  }
}

//delete function
async function deleteBook(bookId) {
  if (!bookId) {
    return console.log("missing bookId");
  }
  try {
    const response = await fetch(`${API_BASE}/books/${bookId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      console.log("error in deleting book");
    } else {
      alert("book deleted successfuly");
      loadBooks();
    }
  } catch (error) {
    console.log(error);
    alert("something went wrong deleting book");
  }
}

// Display modal
addBookBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  submitForm.reset();
  newCategoryInput.classList.remove("show");
  currentEditingBookId = null;
});

// Handle form submission
saveBookBtn.addEventListener("click", handleBookSubmit);

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadBooks();
});
