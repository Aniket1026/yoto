import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  getSingleVideo,
  publishVideo,
  removeVideo,
  updateVideo
} from '../controllers/video.controller';
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
router.patch(
  '/video/:videoId',
  verifyJWT,
  upload.single('thumbnail'),
  updateVideo
);

router.delete('/video/:videoId', verifyJWT, removeVideo);
export const video = router;