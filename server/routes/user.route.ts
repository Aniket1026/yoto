import { Router } from 'express';
import {
  accessRefreshToken,
  getCurrentUser,
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

export const user = router;
