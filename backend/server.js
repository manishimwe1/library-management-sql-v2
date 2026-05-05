import express from "express";
import { db } from "./config/db.js";
import cors from "cors";
import bycrptjs from "bcryptjs";
import path from 'path'

const PORT = 3000;
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(process.cwd(), "frontend")));

app.use(
  cors({
    origin: ["http://127.0.0.1:5500",'http://127.0.0.1:5501'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.get("/api/search/:searchValue", (req, res) => {
  const { searchValue } = req.params;

  console.log(searchValue);
  

  const searchQuery = `SELECT * FROM books WHERE name LIKE '${searchValue}%'`;

  db.get(searchQuery, (err, rows) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "something went wrong", error: err });
    }
    
    return res.status(200).json({ message: "search data", data: rows });
  });
});

app.post("/api/auth/sign-in", (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    console.log("all fields are required");
    return res.status(400).json("all fields are required");
  }

  const userQuery = `SELECT * FROM users WHERE email=?`;
  db.get(userQuery, [email], (err, rows) => {
    if (err) {
      return console.log("error in getting user", err);
    }

    if (rows) {
      const hashedPassword = bycrptjs.compareSync(password, rows.password);

      if (hashedPassword) {
        return res.status(200).json({
          message: "logged in successfully",
          userId: rows.id,
          email: rows.email,
          username: rows.username,
        });
      } else {
        return res.status(400).json({ message: "invalid password" });
      }
    } else {
      return res.status(404).json({
        message: `User doesn't exist try to sign up`,
      });
    }
  });
});

app.post("/api/auth", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    console.log("all fields are riquired");
    return res.status(400).json("all fields are riquired");
  }

  const existingUser = `SELECT * FROM users WHERE email=?`;
  db.get(existingUser, [email], (err, rows) => {
    if (err) {
      return console.log("error in getting user", err);
    }
    console.log(rows, "FOR ", email);

    if (!rows) {
      const hashedPass = bycrptjs.hashSync(password, 12);
      const query = `INSERT INTO users (username, email, password) VALUES(?,?,?)`;
      db.run(query, [username, email, hashedPass], (err) => {
        if (err) {
          return console.log("error in creating user", err);
        }
        return res.status(201).json({ message: "user created susseccfull" });
      });
    } else {
      return res.status(400).json({ message: "this email is already exist" });
    }
  });
});

app.get("/api/auth", (req, res) => {
  const query = `SELECT * FROM users`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log("error in getting data", err);
    }
    return res.status(200).json(rows);
  });
});

app.post("/api/books", (req, res) => {
  const { name, description, author, price, imageSrc, category } = req.body;
  if (!name || !description || !author || !price || !imageSrc) {
    console.log("all fields are riquired");
    return res.status(400).json("all fields are riquired");
  }

  // Insert book first
  const query = `INSERT INTO books (name, description, author, price, imageSrc) VALUES(?,?,?,?,?)`;
  db.run(query, [name, description, author, price, imageSrc], function (err) {
    if (err) {
      console.log("error in creating book", err);
      return res.status(500).json({ message: "error in creating book" });
    }

    const bookId = this.lastID;

    // If category is provided, handle category creation and linking
    if (category && category !== "Uncategorized") {
      // Check if category already exists
      const checkCategoryQuery = `SELECT id FROM categories WHERE name = ?`;
      db.get(checkCategoryQuery, [category], (err, row) => {
        if (err) {
          console.log("error in checking category", err);
          return res.status(500).json({ message: "error in checking category" });
        }

        let categoryId;

        if (row) {
          // Category exists, use its ID
          categoryId = row.id;
          linkBookToCategory(bookId, categoryId, res);
        } else {
          // Category doesn't exist, create it
          const createCategoryQuery = `INSERT INTO categories (name) VALUES(?)`;
          db.run(createCategoryQuery, [category], function (err) {
            if (err) {
              console.log("error in creating category", err);
              return res.status(500).json({ message: "error in creating category" });
            }
            categoryId = this.lastID;
            linkBookToCategory(bookId, categoryId, res);
          });
        }
      });
    } else {
      // No category provided, just return success
      return res.status(201).json({ message: "book created successfully", id: bookId });
    }
  });
});

// Helper function to link book to category
function linkBookToCategory(bookId, categoryId, res) {
  const linkQuery = `INSERT INTO book_categories (book_id, category_id) VALUES(?,?)`;
  db.run(linkQuery, [bookId, categoryId], function (err) {
    if (err) {
      console.log("error in linking book to category", err);
      return res.status(500).json({ message: "error in linking book to category" });
    }
    return res.status(201).json({ message: "book created successfully", id: bookId });
  });
}

app.put("/api/books/:id", (req, res) => {
  const { name, description, author, price, category } = req.body;
  const { id } = req.params;

  if (!name || !description || !author || !price) {
    console.log("all fields are required");
    return res.status(400).json("all fields are required");
  }

  if (!id) {
    return res.status(400).json("missing id");
  }

  // Update book details
  const query = `UPDATE books SET name=?, description=?, author=?, price=? WHERE id=?`;

  db.run(query, [name, description, author, price, id], function (err) {
    if (err) {
      console.log("error in updating book", err);
      return res.status(500).json({ message: "error in updating book" });
    }

    // Handle category update
    if (category !== undefined) {
      // First, remove existing category relationships for this book
      const deleteCategoriesQuery = `DELETE FROM book_categories WHERE book_id = ?`;
      db.run(deleteCategoriesQuery, [id], (err) => {
        if (err) {
          console.log("error in removing old categories", err);
          return res.status(500).json({ message: "error in removing old categories" });
        }

        // If category is provided and not "Uncategorized", add the new relationship
        if (category && category !== "Uncategorized") {
          // Check if category exists
          const checkCategoryQuery = `SELECT id FROM categories WHERE name = ?`;
          db.get(checkCategoryQuery, [category], (err, row) => {
            if (err) {
              console.log("error in checking category", err);
              return res.status(500).json({ message: "error in checking category" });
            }

            let categoryId;

            if (row) {
              // Category exists, use its ID
              categoryId = row.id;
              addBookCategory(id, categoryId, res);
            } else {
              // Category doesn't exist, create it
              const createCategoryQuery = `INSERT INTO categories (name) VALUES(?)`;
              db.run(createCategoryQuery, [category], function (err) {
                if (err) {
                  console.log("error in creating category", err);
                  return res.status(500).json({ message: "error in creating category" });
                }
                categoryId = this.lastID;
                addBookCategory(id, categoryId, res);
              });
            }
          });
        } else {
          // No category or "Uncategorized", just return success
          return res.status(200).json({ message: "book updated successfully" });
        }
      });
    } else {
      // No category update, just return success
      return res.status(200).json({ message: "book updated successfully" });
    }
  });
});

// Helper function to add book-category relationship
function addBookCategory(bookId, categoryId, res) {
  const linkQuery = `INSERT INTO book_categories (book_id, category_id) VALUES(?,?)`;
  db.run(linkQuery, [bookId, categoryId], function (err) {
    if (err) {
      console.log("error in linking book to category", err);
      return res.status(500).json({ message: "error in linking book to category" });
    }
    return res.status(200).json({ message: "book updated successfully" });
  });
}

app.get("/api/books", (req, res) => {
  const query = `
    SELECT b.*, GROUP_CONCAT(c.name) as category
    FROM books b
    LEFT JOIN book_categories bc ON b.id = bc.book_id
    LEFT JOIN categories c ON bc.category_id = c.id
    GROUP BY b.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log("error in getting data", err);
      return res.status(500).json({ message: "error in getting data" });
    }
    return res.status(200).json(rows);
  });
});

app.get("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT b.*, GROUP_CONCAT(c.name) as category
    FROM books b
    LEFT JOIN book_categories bc ON b.id = bc.book_id
    LEFT JOIN categories c ON bc.category_id = c.id
    WHERE b.id = ?
    GROUP BY b.id
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.log("error in getting data", err);
      return res.status(500).json({ message: "error in getting data" });
    }
    if (!row) {
      return res.status(404).json({ message: "book not found" });
    }
    return res.status(200).json(row);
  });
});

app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;

  if (!id) return;

  const query = `DELETE FROM books WHERE id = ?`;

  db.run(query, [id], (err) => {
    if (err) {
      console.log("something went wrong while deleting book");
      return res.status(500).json({
        message: "something went wrong while deleting book",
      });
    }

    return res.status(200).json({
      message: "deleted book successfully",
    });
  });
});

// Category CRUD endpoints
app.get("/api/categories", (req, res) => {
  const query = `SELECT * FROM categories`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log("error in getting categories", err);
      return res.status(500).json({ message: "error in getting categories" });
    }
    return res.status(200).json(rows);
  });
});

app.get("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM categories WHERE id=?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.log("error in getting category", err);
      return res.status(500).json({ message: "error in getting category" });
    }
    if (!row) {
      return res.status(404).json({ message: "category not found" });
    }
    return res.status(200).json(row);
  });
});

app.post("/api/categories", (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  const query = `INSERT INTO categories (name, description) VALUES(?,?)`;
  db.run(query, [name, description], function (err) {
    if (err) {
      console.log("error in creating category", err);
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ message: "category name already exists" });
      }
      return res.status(500).json({ message: "error in creating category" });
    }
    return res.status(201).json({
      message: "category created successfully",
      id: this.lastID,
    });
  });
});

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  const query = `UPDATE categories SET name=?, description=? WHERE id=?`;

  db.run(query, [name, description, id], function (err) {
    if (err) {
      console.log("error in updating category", err);
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ message: "category name already exists" });
      }
      return res.status(500).json({ message: "error in updating category" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "category not found" });
    }
    return res.status(200).json({ message: "category updated successfully" });
  });
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM categories WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.log("error in deleting category", err);
      return res.status(500).json({ message: "error in deleting category" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "category not found" });
    }
    return res.status(200).json({ message: "category deleted successfully" });
  });
});

// Book-Category relationship endpoints
app.get("/api/categories/:id/books", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT b.* FROM books b
    INNER JOIN book_categories bc ON b.id = bc.book_id
    WHERE bc.category_id = ?
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.log("error in getting books by category", err);
      return res.status(500).json({ message: "error in getting books by category" });
    }
    return res.status(200).json(rows);
  });
});

app.get("/api/books/:id/categories", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT c.* FROM categories c
    INNER JOIN book_categories bc ON c.id = bc.category_id
    WHERE bc.book_id = ?
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.log("error in getting categories for book", err);
      return res.status(500).json({ message: "error in getting categories for book" });
    }
    return res.status(200).json(rows);
  });
});

app.post("/api/books/:id/categories", (req, res) => {
  const { id } = req.params;
  const { categoryId } = req.body;

  if (!categoryId) {
    return res.status(400).json({ message: "categoryId is required" });
  }

  const query = `INSERT INTO book_categories (book_id, category_id) VALUES(?,?)`;

  db.run(query, [id, categoryId], function (err) {
    if (err) {
      console.log("error in adding category to book", err);
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ message: "book already has this category" });
      }
      if (err.message.includes("FOREIGN KEY")) {
        return res.status(400).json({ message: "invalid book or category id" });
      }
      return res.status(500).json({ message: "error in adding category to book" });
    }
    return res.status(201).json({ message: "category added to book successfully" });
  });
});

app.delete("/api/books/:id/categories/:categoryId", (req, res) => {
  const { id, categoryId } = req.params;

  const query = `DELETE FROM book_categories WHERE book_id = ? AND category_id = ?`;

  db.run(query, [id, categoryId], function (err) {
    if (err) {
      console.log("error in removing category from book", err);
      return res.status(500).json({ message: "error in removing category from book" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "book-category relationship not found" });
    }
    return res.status(200).json({ message: "category removed from book successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
