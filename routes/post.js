import express from 'express';
import formiddable from 'express-formidable';

import {
  createPost,
  uploadImage,
  getPosts,
  deletePost,
  editPost,
  feed,
} from '../controllers/posts.js';
import { verifyUser } from '../middlewares/verifyUser.js';

const router = express.Router();

router.post('/', verifyUser, createPost);
router.get('/', verifyUser, getPosts);
router.get('/feed', verifyUser, feed);
router.patch('/', verifyUser, editPost);
router.delete('/:id', deletePost);

router.post(
  '/upload-image',
  verifyUser,
  formiddable({ maxFileSize: 1 * 1024 * 1024 }),
  uploadImage
);

export default router;
