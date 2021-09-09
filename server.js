import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connection successful'))
  .catch((err) => console.log('Db connection error', err));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

import user from './routes/user.js';
import post from './routes/post.js';
import errorHandler from './middlewares/errorHandler.js';

app.use('/api/user', user);
app.use('/api/posts', post);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log('Server listening on', process.env.PORT);
});
