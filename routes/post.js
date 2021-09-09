import express from 'express';
import formiddable from 'express-formidable';

import {
  createPost,
  uploadImage,
  getPosts,
  deletePost,
  editPost,
  feed,
  like,
  unlike,
  likeCount,
  addComment,
  deleteComment,
} from '../controllers/posts.js';
import { verifyUser } from '../middlewares/verifyUser.js';

const router = express.Router();

router.post('/', verifyUser, createPost);
router.get('/', verifyUser, getPosts);
router.get('/feed', verifyUser, feed);
router.post('/like', verifyUser, like);
router.get('/likeCount/:id', likeCount);
router.post('/unlike', verifyUser, unlike);
router.patch('/', verifyUser, editPost);
router.delete('/:id', deletePost);
router.post('/comment', verifyUser, addComment);
router.put('/comment', deleteComment);

router.post(
  '/upload-image',
  verifyUser,
  formiddable({ maxFileSize: 1 * 1024 * 1024 }),
  uploadImage
);

export default router;
