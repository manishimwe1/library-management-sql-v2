import { db } from '../config/db.js';

export const getAllCategories = (req, res) => {
  const query = `SELECT * FROM categories`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error getting categories:', err);
      return res.status(500).json({ message: 'Error getting categories' });
    }
    res.status(200).json(rows);
  });
};

export const getCategoryById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM categories WHERE id = ?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error getting category:', err);
      return res.status(500).json({ message: 'Error getting category' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(row);
  });
};

export const createCategory = (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const query = `INSERT INTO categories (name, description) VALUES (?, ?)`;

  db.run(query, [name, description], function (err) {
    if (err) {
      console.error('Error creating category:', err);
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
      return res.status(500).json({ message: 'Error creating category' });
    }
    res.status(201).json({
      message: 'Category created successfully',
      id: this.lastID
    });
  });
};

export const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const query = `UPDATE categories SET name = ?, description = ? WHERE id = ?`;

  db.run(query, [name, description, id], function (err) {
    if (err) {
      console.error('Error updating category:', err);
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
      return res.status(500).json({ message: 'Error updating category' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category updated successfully' });
  });
};

export const deleteCategory = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM categories WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting category:', err);
      return res.status(500).json({ message: 'Error deleting category' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  });
};

export const getBooksByCategory = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT b.* FROM books b
    INNER JOIN book_categories bc ON b.id = bc.book_id
    WHERE bc.category_id = ?
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Error getting books by category:', err);
      return res.status(500).json({ message: 'Error getting books by category' });
    }
    res.status(200).json(rows);
  });
};

export const getCategoriesByBook = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT c.* FROM categories c
    INNER JOIN book_categories bc ON c.id = bc.category_id
    WHERE bc.book_id = ?
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Error getting categories for book:', err);
      return res.status(500).json({ message: 'Error getting categories for book' });
    }
    res.status(200).json(rows);
  });
};

export const addCategoryToBook = (req, res) => {
  const { id } = req.params;
  const { categoryId } = req.body;

  if (!categoryId) {
    return res.status(400).json({ message: 'categoryId is required' });
  }

  const query = `INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)`;

  db.run(query, [id, categoryId], function (err) {
    if (err) {
      console.error('Error adding category to book:', err);
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ message: 'Book already has this category' });
      }
      if (err.message.includes('FOREIGN KEY')) {
        return res.status(400).json({ message: 'Invalid book or category id' });
      }
      return res.status(500).json({ message: 'Error adding category to book' });
    }
    res.status(201).json({ message: 'Category added to book successfully' });
  });
};

export const removeCategoryFromBook = (req, res) => {
  const { id, categoryId } = req.params;

  const query = `DELETE FROM book_categories WHERE book_id = ? AND category_id = ?`;

  db.run(query, [id, categoryId], function (err) {
    if (err) {
      console.error('Error removing category from book:', err);
      return res.status(500).json({ message: 'Error removing category from book' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Book-category relationship not found' });
    }
    res.status(200).json({ message: 'Category removed from book successfully' });
  });
};
