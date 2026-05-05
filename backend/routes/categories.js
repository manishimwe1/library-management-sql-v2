import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getBooksByCategory,
  getCategoriesByBook,
  addCategoryToBook,
  removeCategoryFromBook
} from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/:id/books', getBooksByCategory);

// Protected routes (require authentication)
router.post('/', authenticateToken, createCategory);
router.put('/:id', authenticateToken, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

// Book-category relationship routes
router.get('/books/:id/categories', getCategoriesByBook);
router.post('/books/:id/categories', authenticateToken, addCategoryToBook);
router.delete('/books/:id/categories/:categoryId', authenticateToken, removeCategoryFromBook);

export default router;
