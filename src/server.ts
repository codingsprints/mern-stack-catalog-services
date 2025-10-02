import app from './app';
import { createMessageProducerBroker } from './common/factories/brokerFactory';
import { MessageProducerBroker } from './common/types/broker';
import { configENV } from './config/config';
import logger from './config/logger';
import { initDB } from './database/db';

const startServer = async () => {
  let messageProducerBroker: MessageProducerBroker | null = null;
  try {
    logger.info('🚀 Starting application...');
    await initDB();
    logger.info('🗂️  Database connected successfully!');

    // connect to Kafka
    // messageProducerBroker = createKafkaProducerBroker('catalog-service', [
    //   configENV.broker,
    // ]);
    messageProducerBroker = createMessageProducerBroker();
    await messageProducerBroker.connect();

    app.listen(configENV.port, () =>
      logger.info(`Listening on port ${configENV.port}`),
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (messageProducerBroker) {
        await messageProducerBroker.disconnect();
      }
      logger.error(err.message);
      logger.on('finish', () => {
        process.exit(1);
      });
    }
  }
};

startServer();
