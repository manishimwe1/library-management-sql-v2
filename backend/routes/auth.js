import express from 'express';
import { signUp, signIn, getAllUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.get('/', getAllUsers);

export default router;
