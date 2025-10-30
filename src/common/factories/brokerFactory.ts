import { MessageProducerBroker } from '../types/broker';
import { KafkaProducerBroker } from '../../config/kafka';
import logger from '../../config/logger';
import { CATALOG_SERVICE } from '../constants/constants';

let messageProducer: MessageProducerBroker | null = null;

export const createMessageProducerBroker = (): MessageProducerBroker => {
  logger.info('✅ connecting to kafka broker...');
  // making singletone
  if (!messageProducer) {
    messageProducer = new KafkaProducerBroker(CATALOG_SERVICE, [
      'pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092',
    ]);
  }

  return messageProducer;
};
