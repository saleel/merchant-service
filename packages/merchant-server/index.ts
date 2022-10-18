/* eslint-disable import/first */

import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import logger from './core/logger';

const port = Number(process.env.PORT) || 8000;

app.listen({ port }, (err) => {
  if (err) {
    logger.error(err);
  } else {
    logger.info(`merchant-server start on port ${port}`);
  }
});
