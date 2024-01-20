import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { apiError } from '../utils/apiError';
import { User } from '../models/user.model';
import { UserRequest } from '../interfaces/request.interface';

export const verifyJWT = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken =
      req.cookies?.accessToken || req.headers?.authorization?.split(' ')[1];
    if (!accessToken) throw new apiError('Unauthorized request', 401);
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;
    const user = await User.findById(decoded._id);
    if (!user) throw new apiError('Invalid token', 401);
    req.user = user;
    next();
  } catch (error) {
    throw new apiError(`Error in auth middlware ${error}`, 404);
  }
};
