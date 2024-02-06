import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { getSingleVideo, publishVideo } from '../controllers/video.controller';
import { upload } from '../middlewares/multer.middleware';

export const router = Router();

router.post(
  '/video',
  verifyJWT,
  upload.fields([
    {
      name: 'video',
      maxCount: 1
    },
    {
      name: 'thumbnail',
      maxCount: 1
    }
  ]),
publishVideo
);

router.get('/video/:videoId', verifyJWT, getSingleVideo);

export const video = router;