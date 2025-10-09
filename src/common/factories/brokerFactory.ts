import { MessageProducerBroker } from '../types/broker';
import { KafkaProducerBroker } from '../../config/kafka';
import { configENV } from '../../config/config';
import logger from '../../config/logger';
import { CATALOG_SERVICE } from '../constants/constants';

let messageProducer: MessageProducerBroker | null = null;

export const createMessageProducerBroker = (): MessageProducerBroker => {
  logger.info('✅ connecting to kafka broker...');
  // making singletone
  if (!messageProducer) {
    messageProducer = new KafkaProducerBroker(
      CATALOG_SERVICE,
      configENV.broker,
    );
  }

  return messageProducer;
};
