import express from 'express';
import { register, currentUser, login } from '../controllers/user.js';
import { verifyUser } from '../middlewares/verifyUser.js';

const router = express.Router();

router.route('/signup').post(register);
router.post('/login', login);
router.get('/current-user', verifyUser, currentUser);

export default router;
