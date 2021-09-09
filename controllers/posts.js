import { v2 as cloudinary } from 'cloudinary';

import asyncHandler from '../middlewares/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = asyncHandler(async (req, res, next) => {
  const { content, image } = req.body;

  // if (!content || content.trim().length === 0) {
  //   return next(new ErrorResponse('Field cannot be an empty value', 400));
  // }

  console.log(req.body);
  // return;
  const post = await Post.create({ content, image, postedBy: req.user._id });
  console.log(req.body);
  res.status(201).json({ success: true, post });
});

export const uploadImage = asyncHandler(async (req, res, next) => {
  console.log(req.files);
  // return;

  const result = await cloudinary.uploader.upload(req.files.image.path);
  console.log(result, 'asdasdasdasd');

  res.status(201).json({
    success: true,
    url: result.secure_url,
    public_id: result.public_id,
  });
});

export const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ postedBy: req.user._id })
    .populate('postedBy', '_id name image')
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).send({ posts });
});

export const feed = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  let following = user.following;
  following.push(req.user._id);

  const posts = await Post.find({ postedBy: { $in: following } })
    .populate('postedBy', '_id name image')
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).send({ posts });
});

export const editPost = asyncHandler(async (req, res, next) => {
  const { id, content } = req.body;

  const post = await Post.findByIdAndUpdate(
    id,
    { content: content },
    { new: true }
  );
  console.log(post);
  res.status(200).send({ success: true, post });
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await Post.findByIdAndDelete(id);
  res.status(200).send({ success: true, message: 'Post deleted successfully' });
});
