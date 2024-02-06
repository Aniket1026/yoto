import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { apiError } from '../utils/apiError';
import { apiResponse } from '../utils/apiResponse';
import { UserRequest } from '../interfaces/request.interface';
import { Video } from '../models/video.model';
import { uploadOnCloudinary } from '../utils/cloudinary';

export const publishVideo = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const { title, description } = req.body;

    if (!title || !description)
      throw new apiError('Owner, title and description are required', 400);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const videoLocalPath = files?.video[0].path;
    const thumbnailLocalPath = files?.thumbnail[0].path;
    if (!videoLocalPath || !thumbnailLocalPath)
      throw new apiError('Video and thumbnail are required', 400);

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const newVideo = new Video({
      title,
      description,
      videoFile: video?.url,
      thumbnail: thumbnail?.url,
      duration : video?.duration
    });

    await newVideo.save();
    res.status(201).json(new apiResponse(newVideo, 201, 'Video published'));
  }
);
