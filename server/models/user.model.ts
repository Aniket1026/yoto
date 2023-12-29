import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 3,
      index: true,
      lowercase: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avatar: {
      type: String,
      required: true
    },
    coverImage: {
      type: String
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
      }
    ],
    password: {
      type: String,
      required: [true, 'Please enter a password']
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model('User', userSchema);
