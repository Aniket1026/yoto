import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/user.controller';
import { upload } from '../middlewares/multer.middleware';

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
export const user = router;
