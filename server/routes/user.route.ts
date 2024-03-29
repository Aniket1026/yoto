import { Router } from 'express';
import {
  accessRefreshToken,
  getCurrentUser,
  getUserChannelDetails,
  getWatchHistory,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUserAvatar,
  updateUserCoverImage
} from '../controllers/user.controller';
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';

export const router = Router();

router.post(
  '/auth',
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1
    },
    {
      name: 'coverImage',
      maxCount: 1
    }
  ]),
  registerUser
);

router.post('/login', loginUser);
router.get('/logout', verifyJWT, logoutUser);
router.get('/refresh-token', accessRefreshToken);
router.post('/reset-password', verifyJWT, resetPassword);
router.get('/current-user', verifyJWT, getCurrentUser);
router.patch('/avatar', verifyJWT, upload.single('avatar'), updateUserAvatar);
router.patch(
  '/cover-image',
  verifyJWT,
  upload.single('coverImage'),
  updateUserCoverImage
);

router.get('/channel/:username', verifyJWT, getUserChannelDetails);
router.get('/watch-history', verifyJWT, getWatchHistory);

export const user = router;
