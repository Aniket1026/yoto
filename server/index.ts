import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/db';
import { user } from './routes/user.route';
import { video } from './routes/video.route';

config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);

app.use('/api/v1', user)
app.use('/api/v1', video );

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT} ...`);
  });
});