import express from 'express';
import {
  register,
  currentUser,
  login,
  findPeople,
  follow,
  getFollowing,
  unfollow,
  remove,
  getFollowers,
  userDetails,
} from '../controllers/user.js';
import { verifyUser } from '../middlewares/verifyUser.js';

const router = express.Router();

router.route('/signup').post(register);
router.post('/login', login);
router.put('/follow', verifyUser, follow);
router.get('/following', verifyUser, getFollowing);
router.get('/followers', verifyUser, getFollowers);
router.put('/unfollow', verifyUser, unfollow);
router.put('/remove', verifyUser, remove);
router.get('/current-user', verifyUser, currentUser);
router.get('/people', verifyUser, findPeople);
router.get('/:id', userDetails);

export default router;
