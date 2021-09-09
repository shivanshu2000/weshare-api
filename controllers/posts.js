import { v2 as cloudinary } from 'cloudinary';

import asyncHandler from '../middlewares/asyncHandler.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const createPost = asyncHandler(async (req, res, next) => {
  const { content, image } = req.body;

  const post = await Post.create({ content, image, postedBy: req.user._id });

  res.status(201).json({ success: true, post });
});

export const uploadImage = asyncHandler(async (req, res, next) => {
  const result = await cloudinary.uploader.upload(req.files.image.path);

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
    .populate('comments.postedBy', '_id name')
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
  res.status(200).send({ success: true, post });
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await Post.findByIdAndDelete(id);
  res.status(200).send({ success: true, message: 'Post deleted successfully' });
});

export const like = asyncHandler(async (req, res, next) => {
  const { id } = req.body;
  const post = await Post.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  );

  res.status(200).json({ success: true, post });
});
export const unlike = asyncHandler(async (req, res, next) => {
  const { id } = req.body;
  const post = await Post.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } },
    { new: true }
  );

  res.status(200).json({ success: true, post });
});

export const likeCount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const likes = await Post.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $project: {
        _id: false,
        total_likes: { $size: '$likes' },
        total_comments: { $size: '$comments' },
      },
    },
  ]);

  res.status(200).json({ success: true, likes });
});

export const addComment = asyncHandler(async (req, res, next) => {
  const { id, comment } = req.body;

  const post = await Post.findByIdAndUpdate(
    id,
    {
      $push: { comments: { comment: comment, postedBy: req.user._id } },
    },
    { new: true }
  )
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name');

  res.status(200).json({ success: true, post });
});
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.body;

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      $pull: { comments: { _id: commentId } },
    },
    { new: true }
  )
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name');

  res.status(200).json({ success: true, post });
});
