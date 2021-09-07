import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is a required field'],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'Email is a required field'],
    },

    password: {
      type: String,
      required: [true, 'Password is a required field'],
    },

    resetToken: {
      type: String,
      default: null,
    },
    photo: String,
    following: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],

    followers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);

export default User;
