import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { apiError } from '../utils/apiError';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { UserDocument } from '../interfaces/user.interface';
import { apiResponse } from '../utils/apiResponse';

export const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, fullname, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new apiError('User already exists', 409);
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log(req.files);

    const avatarLocalPath = files?.avatar[0]?.path;
    const coverLocalPath = files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
      throw new apiError('Avatar is required', 400);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!avatar) throw new apiError('Avatar upload failed', 500);
    const user: UserDocument = await User.create({
      username,
      fullname,
      email,
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url
    });

    const createdUser = await User.findById(user._id).select(
      '-password -refreshToken'
    );

    res
      .status(201)
      .json(new apiResponse(createdUser, 200, 'User created successfully'));
  }
);
