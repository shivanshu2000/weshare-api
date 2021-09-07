import jwt from 'jsonwebtoken';

import asyncHandler from '../middlewares/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import { checkPassword, hashPassword } from '../helpers/auth.js';

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
    console.log(exists);
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
  console.log(req.body);
  if (!user) {
    console.log('here');
    return next(new ErrorResponse('Invalid email or password', 400));
  }

  const match = await checkPassword(password, user.password);

  if (!match) {
    console.log('not here');
    return next(new ErrorResponse('Invalid email or password', 400));
  }

  console.log(match, user);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '10s',
  });

  user.password = undefined;

  res
    .status(200)
    .json({ success: 'true', message: 'Successfull login', token, user });
});

export const currentUser = asyncHandler(async (req, res, next) => {
  return res.status(200).json({ success: true, user: req.user });
});
