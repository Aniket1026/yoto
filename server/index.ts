import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './db/db';

const app = express();
config();
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT} ...`);
  });
});