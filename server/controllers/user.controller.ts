import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/user.model';
import { apiError } from '../utils/apiError';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { UserDocument } from '../interfaces/user.interface';
import { apiResponse } from '../utils/apiResponse';
import { UserRequest } from '../interfaces/request.interface';

const generateAccessAndRefreshToken = async (user: UserDocument) => {
  try {
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new apiError(`Error generating tokens : ${error}`, 500);
  }
};

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

export const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password)
      throw new apiError('required fields are missing', 400);

    const user = await User.findOne({ email });
    if (!user) throw new apiError('User does not exist', 404);

    const isValidPassword = await user.isPasswordCorrect(password);
    if (!isValidPassword) throw new apiError('Invalid user credentials', 401);

    const { refreshToken, accessToken } =
      await generateAccessAndRefreshToken(user);
    const loggedInUser = await User.findById(user._id).select(
      '-password -refreshToken'
    );

    const options = {
      httpOnly: true,
      secure: true
    };

    res
      .status(200)
      .cookie('refreshToken', refreshToken, options)
      .cookie('accessToken', accessToken, options)
      .json(
        new apiResponse(
          { user: loggedInUser, accessToken, refreshToken },
          200,
          'User logged in successfully'
        )
      );
  }
);

export const logoutUser = asyncHandler(
  async (req: UserRequest, res: Response): Promise<void> => {
    // clear the cookies
    // clear the refreshtoken from the database
    const user = req.user;
    if (!user) throw new apiError('Unauthorized request', 401);

    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
    const options = {
      httpOnly: true,
      secure: true
    };

    res
      .status(200)
      .clearCookie('refreshToken', options)
      .clearCookie('accessToken', options)
      .json(new apiResponse({}, 200, 'User logged out successfully'));
  }
);

export const accessRefreshToken = asyncHandler(
  async (req: UserRequest, res: Response): Promise<void> => {
    try {
      const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;
      if (!incomingRefreshToken)
        throw new apiError('Unauthorized request', 401);

      const decodedToken = await jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );

      if (!decodedToken) throw new apiError('Invalid token', 401);

      const user = await User.findById((decodedToken as JwtPayload)._id);
      if (!user) throw new apiError('Invalid token', 401);

      if (user.refreshToken !== incomingRefreshToken) {
        throw new apiError('Refresh token is expired', 401);
      }

      const { refreshToken, accessToken } =
        await generateAccessAndRefreshToken(user);

      const options = {
        httpOnly: true,
        secure: true
      };

      res
        .status(200)
        .cookie('refreshToken', refreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(
          new apiResponse(
            { accessToken, refreshToken },
            200,
            'Access token generated successfully'
          )
        );
    } catch (error) {
      throw new apiError(`Error in access refresh Token ${error}`, 404);
    }
  }
);

export const resetPassword = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;
    if (!user) {
      throw new apiError('User not found', 404);
    }

    const isPasswordCorrect = user?.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) throw new apiError('Invalid old password', 400);

    user.password = newPassword;
    await user?.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new apiResponse({}, 200, 'Password reset successfully'));
  }
);

export const getCurrentUser = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const user = req.user;
    if (!user) throw new apiError('User not found', 403);
    res.status(200).json(new apiResponse(user, 200, 'Current user found'));
  }
);
