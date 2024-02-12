import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { apiError } from '../utils/apiError';
import { UserRequest } from '../interfaces/request.interface';
import { Playlist } from '../models/playlist.model';
import { apiResponse } from '../utils/apiResponse';
import mongoose from 'mongoose';

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
