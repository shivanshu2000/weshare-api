import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import asyncHandler from '../middlewares/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import { checkPassword, hashPassword } from '../helpers/auth.js';
import Post from '../models/Post.js';

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorResponse('All fields are required', 400));
  }

  if (!password || password.length < 6) {
    return next(
      new ErrorResponse(
        'Password is required and should be atleast 6 characters long',
        400
      )
    );
  }
  if (password !== confirmPassword) {
    // return res
    //   .status(400)
    //   .json({ success: false, message: 'User not created' });
    return next(new ErrorResponse('Passwords do not match', 400));
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return next(new ErrorResponse('Email already exists.', 400));
  }
  let hashedPassword;
  hashedPassword = await hashPassword(password);

  const user = await User.create({
    email,
    password: hashedPassword,
    email,
    name,
  });

  res.status(200).json({ success: true, message: 'User created', user });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    console.log('here');
    return next(new ErrorResponse('Invalid email or password', 400));
  }

  const match = await checkPassword(password, user.password);

  if (!match) {
    return next(new ErrorResponse('Invalid email or password', 400));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '2d',
  });

  user.password = undefined;

  res
    .status(200)
    .json({ success: 'true', message: 'Successfull login', token, user });
});

export const currentUser = asyncHandler(async (req, res, next) => {
  return res.status(200).json({ success: true, user: req.user });
});

export const findPeople = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id });

  const following = user.following;
  following.push(user._id);

  const people = await User.find({ _id: { $nin: following } }).limit(15);

  res.status(200).json({ success: true, people });
});

export const follow = asyncHandler(async (req, res, next) => {
  const followed = await User.findByIdAndUpdate(
    req.body.id,
    {
      $addToSet: { followers: req.user._id },
    },
    { new: true }
  );

  const follows = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { following: req.body.id },
    },
    { new: true }
  ).select('-password -resetToken -__v');

  res.status(200).json({ success: true, followed, follows });
});

export const following = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { following: req.body._id },
    },
    { new: true }
  );

  res.status(200).json({ success: true, user });
});

export const getFollowing = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const following = await User.find({ _id: user.following }).limit(50);

  res.status(200).json({ success: true, following });
});

export const getFollowers = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const followers = await User.find({ _id: user.followers }).limit(50);

  res.status(200).json({ success: true, followers });
});

export const unfollow = asyncHandler(async (req, res, next) => {
  const unfollowed = await User.findByIdAndUpdate(
    req.body.id,
    { $pull: { followers: req.user._id } },
    { new: true }
  );
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { following: req.body.id } },
    { new: true }
  );

  res.status(200).json({ success: true, user });
});

export const remove = asyncHandler(async (req, res, next) => {
  const removeFollowed = await User.findByIdAndUpdate(
    req.body.id,
    { $pull: { following: req.user._id } },
    { new: true }
  );
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { followers: req.body.id } },
    { new: true }
  );

  res.status(200).json({ success: true, user });
});

export const userDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const postsCount = await Post.find({ postedBy: id }).countDocuments();
  const followersCount = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $project: {
        _id: false,
        total_followers: { $size: '$followers' },
      },
    },
  ]);
  const followingCount = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $project: {
        _id: false,
        total_following: { $size: '$following' },
      },
    },
  ]);

  res.status(200).json({ postsCount, followersCount, followingCount });
});
