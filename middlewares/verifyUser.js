import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

export const verifyUser = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select(
        '-password -__v -resetToken'
      );
      next();
    } catch (err) {
      res.status(401);
      next(new ErrorResponse(err.message, 401));
    }
  }

  if (!token) {
    res.status(401);
    next(new ErrorResponse('Not authorized, token failed', 401));
  }
});
