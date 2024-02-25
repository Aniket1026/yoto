import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  createPlaylist,
  getAllPlaylists,
  getSinglePlaylist
} from '../controllers/playlist.controller';

export const router = Router();

router.post('/playlist', verifyJWT, createPlaylist);
router.get('/playlist/:playlistId', verifyJWT, getSinglePlaylist);
router.get('/:channel/playlists', verifyJWT, getAllPlaylists);

export const playlist = router;
