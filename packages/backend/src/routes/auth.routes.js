import { Router } from 'express';
import { register, login, me, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginLimiter } from '../middleware/loginLimiter.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
