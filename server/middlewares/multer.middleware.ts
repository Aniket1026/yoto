import { Request } from 'express';
import multer from 'multer';

interface File {
  originalname: string;
}

const storage = multer.diskStorage({
  destination: function (req: Request, file:File, cb) {
    cb(null, './public/temp');
  },
  filename: function (req:Request, file:File, cb) {
    cb(null, file.originalname);
  }
});

export const upload = multer({ storage });
