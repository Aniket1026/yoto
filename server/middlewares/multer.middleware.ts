import { Request } from 'express';
import multer from 'multer';

type File = Express.Multer.File;

const storage = multer.diskStorage({
  destination: function (req: Request, file:File, cb) {
    cb(null, './public/temp');
  },
  filename: function (req:Request, file:File, cb) {
    cb(null, file.originalname);
  }
});

export const upload = multer({ storage });
