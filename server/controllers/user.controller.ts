import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { apiError } from '../utils/apiError';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { UserDocument } from '../interfaces/user.interface';
import { apiResponse } from '../utils/apiResponse';

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
    // get user details
    // check if all required fields are present
    // check if user exists
    // check if password is correct
    // generate token
    // send token to client

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
