import { db } from '../config/db.js';

export const getAllBooks = (req, res) => {
  const query = `
    SELECT b.*, GROUP_CONCAT(c.name) as category
    FROM books b
    LEFT JOIN book_categories bc ON b.id = bc.book_id
    LEFT JOIN categories c ON bc.category_id = c.id
    GROUP BY b.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error getting books:', err);
      return res.status(500).json({ message: 'Error getting books' });
    }
    res.status(200).json(rows);
  });
};

export const getBookById = (req, res) => {
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
      console.error('Error getting book:', err);
      return res.status(500).json({ message: 'Error getting book' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(row);
  });
};

export const createBook = (req, res) => {
  const { name, description, author, price, imageSrc, category } = req.body;

  if (!name || !description || !author || !price || !imageSrc) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = `INSERT INTO books (name, description, author, price, imageSrc) VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [name, description, author, price, imageSrc], function (err) {
    if (err) {
      console.error('Error creating book:', err);
      return res.status(500).json({ message: 'Error creating book' });
    }

    const bookId = this.lastID;

    if (category && category !== 'Uncategorized') {
      handleCategory(bookId, category, res);
    } else {
      res.status(201).json({ message: 'Book created successfully', id: bookId });
    }
  });
};

export const updateBook = (req, res) => {
  const { id } = req.params;
  const { name, description, author, price, category } = req.body;

  if (!name || !description || !author || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = `UPDATE books SET name = ?, description = ?, author = ?, price = ? WHERE id = ?`;

  db.run(query, [name, description, author, price, id], function (err) {
    if (err) {
      console.error('Error updating book:', err);
      return res.status(500).json({ message: 'Error updating book' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (category !== undefined) {
      updateBookCategory(id, category, res);
    } else {
      res.status(200).json({ message: 'Book updated successfully' });
    }
  });
};

export const deleteBook = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM books WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting book:', err);
      return res.status(500).json({ message: 'Error deleting book' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book deleted successfully' });
  });
};

export const searchBooks = (req, res) => {
  const { searchValue } = req.params;

  if (!searchValue) {
    return res.status(400).json({ message: 'Search value is required' });
  }

  const query = `SELECT * FROM books WHERE name LIKE ?`;

  db.all(query, [`${searchValue}%`], (err, rows) => {
    if (err) {
      console.error('Error searching books:', err);
      return res.status(500).json({ message: 'Error searching books' });
    }
    res.status(200).json({ message: 'Search results', data: rows });
  });
};

// Helper functions
function handleCategory(bookId, categoryName, res) {
  const checkCategoryQuery = `SELECT id FROM categories WHERE name = ?`;

  db.get(checkCategoryQuery, [categoryName], (err, row) => {
    if (err) {
      console.error('Error checking category:', err);
      return res.status(500).json({ message: 'Error checking category' });
    }

    if (row) {
      linkBookToCategory(bookId, row.id, res);
    } else {
      const createCategoryQuery = `INSERT INTO categories (name) VALUES (?)`;

      db.run(createCategoryQuery, [categoryName], function (err) {
        if (err) {
          console.error('Error creating category:', err);
          return res.status(500).json({ message: 'Error creating category' });
        }
        linkBookToCategory(bookId, this.lastID, res);
      });
    }
  });
}

function linkBookToCategory(bookId, categoryId, res) {
  const linkQuery = `INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)`;

  db.run(linkQuery, [bookId, categoryId], function (err) {
    if (err) {
      console.error('Error linking book to category:', err);
      return res.status(500).json({ message: 'Error linking book to category' });
    }
    res.status(201).json({ message: 'Book created successfully', id: bookId });
  });
}

function updateBookCategory(bookId, categoryName, res) {
  const deleteCategoriesQuery = `DELETE FROM book_categories WHERE book_id = ?`;

  db.run(deleteCategoriesQuery, [bookId], (err) => {
    if (err) {
      console.error('Error removing old categories:', err);
      return res.status(500).json({ message: 'Error removing old categories' });
    }

    if (categoryName && categoryName !== 'Uncategorized') {
      const checkCategoryQuery = `SELECT id FROM categories WHERE name = ?`;

      db.get(checkCategoryQuery, [categoryName], (err, row) => {
        if (err) {
          console.error('Error checking category:', err);
          return res.status(500).json({ message: 'Error checking category' });
        }

        if (row) {
          addBookCategory(bookId, row.id, res);
        } else {
          const createCategoryQuery = `INSERT INTO categories (name) VALUES (?)`;

          db.run(createCategoryQuery, [categoryName], function (err) {
            if (err) {
              console.error('Error creating category:', err);
              return res.status(500).json({ message: 'Error creating category' });
            }
            addBookCategory(bookId, this.lastID, res);
          });
        }
      });
    } else {
      res.status(200).json({ message: 'Book updated successfully' });
    }
  });
}

function addBookCategory(bookId, categoryId, res) {
  const linkQuery = `INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)`;

  db.run(linkQuery, [bookId, categoryId], function (err) {
    if (err) {
      console.error('Error linking book to category:', err);
      return res.status(500).json({ message: 'Error linking book to category' });
    }
    res.status(200).json({ message: 'Book updated successfully' });
  });
}
