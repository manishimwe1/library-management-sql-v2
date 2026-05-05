import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks
} from '../controllers/bookController.js';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/search/:searchValue', searchBooks);
router.get('/:id', getBookById);

// Protected routes (require authentication)
router.post('/', authenticateToken, createBook);
router.put('/:id', authenticateToken, updateBook);
router.delete('/:id', authenticateToken, deleteBook);

export default router;
