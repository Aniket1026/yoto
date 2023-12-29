import mongoose, { Document } from 'mongoose';

export interface UserDocument extends Document {
  username: string;
  email: string;
  fullname: string;
  avatar: string;
  coverImage: string;
  watchHistory: mongoose.Schema.Types.ObjectId[];
  password: string;
  refreshToken?: string;

  isPasswordCorrect(password: string): Promise<Boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}