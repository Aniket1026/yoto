import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  registerUser
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
export const user = router;
