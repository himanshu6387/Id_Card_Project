// routes/auth.js
import  express  from 'express';
import { getMe, login } from '../controllers/authController.js';
import { protect } from './../middlewares/auth.js';

const router = express.Router();

console.log('I am from routes')
router.post('/login', login);
router.get('/me', protect, getMe);

export default router