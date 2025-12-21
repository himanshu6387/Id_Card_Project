import  express  from 'express';
import { submitStudentData,getLinkDetails, removeImageBackground  } from '../controllers/studentController.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/link/:linkId', getLinkDetails);
router.post('/submit/:linkId',upload.single('studentImage') ,submitStudentData);
router.post('/remove-background', removeImageBackground);

export default router;
