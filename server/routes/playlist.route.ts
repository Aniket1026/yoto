import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { createPlaylist } from '../controllers/playlist.controller';

export const router = Router();

router.post('/playlist', verifyJWT, createPlaylist);

export const playlist = router;