import app from './app';
import { configENV } from './config/config';
import logger from './config/logger';
import { initDB } from './database/db';

const startServer = async () => {
  try {
    logger.info('🚀 Starting application...');
    await initDB();
    logger.info('🗂️  Database connected successfully!');
    app.listen(configENV.port, () =>
      logger.info(`Listening on port ${configENV.port}`),
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      logger.on('finish', () => {
        process.exit(1);
      });
    }
  }
};

startServer();
