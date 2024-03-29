import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { apiError } from '../utils/apiError';
import { apiResponse } from '../utils/apiResponse';
import { UserRequest } from '../interfaces/request.interface';
import { Video } from '../models/video.model';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { Playlist } from '../models/playlist.model';

const isUserOwner = async (userId: string, req: UserRequest) => {
  const video = await Video.findById(userId);
  if (!video) throw new apiError('Video not found', 404);

  return video.owner.toString() === req.user?._id.toString();
};

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
      owner: req.user?._id,
      title,
      description,
      videoFile: video?.url,
      thumbnail: thumbnail?.url,
      duration: video?.duration
    });

    await newVideo.save();
    res.status(201).json(new apiResponse(newVideo, 201, 'Video published'));
  }
);

export const getSingleVideo = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) throw new apiError('Video ID is required', 400);

    const video = await Video.findById(videoId).populate('owner', 'username');
    if (!video) throw new apiError('Video not found', 404);

    res.status(200).json(new apiResponse(video, 200, 'Video retrieved'));
  }
);

export const updateVideo = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) throw new apiError('Video not found', 404);

    const { title, description } = req.body;
    if (!title || !description)
      throw new apiError('Title and description are required', 400);

    const authorizedUser = await isUserOwner(videoId, req);
    if (!authorizedUser) throw new apiError('Unauthorized user', 401);

    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) throw new apiError('Thumbnail is required', 400);

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    // delete the previous thumbnail

    const updatedVideo = await Video.findByIdAndUpdate(
      video,
      {
        $set: {
          title,
          description,
          thumbnail: thumbnail?.url
        }
      },
      {
        new: true
      }
    );

    res
      .status(200)
      .json(new apiResponse(updatedVideo, 200, 'Video updated successfully'));
  }
);

export const removeVideo = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) throw new apiError('Video ID is required', 400);

    let authorizedUser = await isUserOwner(videoId, req);
    if (!authorizedUser) throw new apiError('Unauthorized user', 401);

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) throw new apiError('Video not found', 404);

    const playlists = await Playlist.find({ videos: videoId });
    for (const playlist of playlists) {
      await Playlist.findByIdAndUpdate(
        playlist._id,
        {
          $pull: { videos: videoId }
        },
        {
          new: true
        }
      );
    }
    
    res
      .status(200)
      .json(new apiResponse({}, 200, 'Video Deleted Successfully'));
  }
);
