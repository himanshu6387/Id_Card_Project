import express from 'express'
import { createCollege, deleteCollege, getAllColleges } from '../controllers/adminController.js';
import { adminOnly, protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create-college', protect, adminOnly, createCollege);
router.get('/colleges', protect, adminOnly, getAllColleges);
router.delete('/delete-college/:collegeId', protect, adminOnly,deleteCollege);

export default router