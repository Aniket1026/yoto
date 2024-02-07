import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { apiError } from '../utils/apiError';
import { UserRequest } from '../interfaces/request.interface';
import { Playlist } from '../models/playlist.model';
import { apiResponse } from '../utils/apiResponse';

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
