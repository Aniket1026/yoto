import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { apiError } from '../utils/apiError';
import { UserRequest } from '../interfaces/request.interface';
import { Playlist } from '../models/playlist.model';
import { apiResponse } from '../utils/apiResponse';
import mongoose from 'mongoose';
import { Video } from '../models/video.model';

const isUserPlaylistOwner = async (userId: string, playlistId: string) => {
  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new apiError('Playlist not found', 404);

    if (playlist.owner.toString() !== userId.toString())
      throw new apiError('You are not the owner of this playlist', 403);
    return true;
  } catch (error) {
    throw new apiError(
      'Error in is user owner ' + (error as Error).message,
      500
    );
  }
};

export const createPlaylist = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const { name, description } = req.body;

    if (!name) throw new apiError('Name of playlist is required', 400);
    if (!description)
      throw new apiError('Description of playlist is required', 400);

    const newPlaylist = await Playlist.create({
      name,
      description,
      owner: req.user?._id,
      vidoes: []
    });

    if (!newPlaylist) throw new apiError('Playlist not created', 400);
    res
      .status(201)
      .json(
        new apiResponse(newPlaylist, 201, 'Playlist created  successfully')
      );
  }
);

export const getSinglePlaylist = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const { playlistId } = req.params;
    if (!playlistId) throw new apiError('Playlist ID is required', 400);

    // const playlist = await Playlist.findById(playlistId).populate(
    //   'video',
    //   'title thumbnail'
    // );

    const playlist = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playlistId)
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          owner: 1,
          video: {
            $cond: {
              if: {
                $eq: ['$owner', [new mongoose.Types.ObjectId(req?.user?._id)]]
              },
              then: '$video',
              else: {
                $filter: {
                  input: '$video',
                  as: 'video',
                  cond: {
                    $eq: ['$video.isPublished', true]
                  }
                }
              }
            }
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (!playlist) throw new apiError('Playlist not found', 404);

    res.status(200).json(new apiResponse(playlist, 200, 'Playlist retrieved'));
  }
);

export const getAllPlaylists = asyncHandler(
  async (req: Request, res: Response) => {
    const { channel } = req.params;

    const playlists = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(channel)
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          owner: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (!playlists) throw new apiError('No playlist found', 404);

    res
      .status(200)
      .json(new apiResponse(playlists, 200, 'Playlists retrieved'));
  }
);

export const addVideoToPlaylist = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const { playlistId, videoId } = req.body;
      if (!playlistId) throw new apiError('Playlist ID is required', 400);
      if (!videoId) throw new apiError('Video ID is required', 400);

      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new apiError('Playlist not found', 404);

      const checkOwner: boolean = await isUserPlaylistOwner(
        req.user?._id,
        playlistId
      );

      if (!checkOwner)
        throw new apiError('You are not the owner of this playlist', 403);

      const video = await Video.findById(videoId);
      if (!video) throw new apiError('Video not found', 404);

      if (playlist.video.includes(videoId))
        throw new apiError('Video already in playlist', 400);

      const addToPlaylist = await Playlist.findByIdAndUpdate(
        {
          _id: playlistId
        },
        {
          $push: {
            video: videoId
          }
        },
        {
          new: true
        }
      );

      if (!addToPlaylist)
        throw new apiError('Video not added to playlist', 400);

      res
        .status(200)
        .json(
          new apiResponse(
            addToPlaylist,
            200,
            'Video added to playlist successfully'
          )
        );
    } catch (error) {
      throw new apiError('Error in adding video to playlist', 500);
    }
  }
);

export const removeVideoFromPlaylist = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const { playlistId, videoId } = req.params;
      if (!playlistId) throw new apiError('PlaylistId is required', 403);
      if (!videoId) throw new apiError('VideoId is required', 403);

      const checkOwner: boolean = await isUserPlaylistOwner(
        req.user?._id,
        playlistId
      );
      if (!checkOwner)
        throw new apiError('You are not the owner of the playlist', 400);

      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new apiError('Playlist not found', 403);

      const video = await Video.findById(videoId);
      if (!video) throw new apiError('Video not found', 403);

      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        { _id: playlistId },
        {
          $pull: {
            videos: videoId
          }
        },
        {
          new: true
        }
      );

      res
        .status(200)
        .json(
          new apiResponse(updatedPlaylist, 200, 'video removed successfully')
        );
    } catch (error) {
      throw new apiError(
        'Error in removing video from playlist' + (error as Error).message,
        500
      );
    }
  }
);
