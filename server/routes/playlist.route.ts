import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  createPlaylist,
  getSinglePlaylist
} from '../controllers/playlist.controller';

export const router = Router();

router.post('/playlist', verifyJWT, createPlaylist);
router.get('/playlist/:playlistId', verifyJWT, getSinglePlaylist);

export const playlist = router;