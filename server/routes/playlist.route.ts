import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  addVideoToPlaylist,
  createPlaylist,
  getAllPlaylists,
  getSinglePlaylist
} from '../controllers/playlist.controller';

export const router = Router();

router.post('/playlist', verifyJWT, createPlaylist);
router.get('/playlist/:playlistId', verifyJWT, getSinglePlaylist);
router.get('/:channel/playlists', verifyJWT, getAllPlaylists);
router.patch('/playlist/:playlistId/:videoId', verifyJWT, addVideoToPlaylist);

export const playlist = router;
