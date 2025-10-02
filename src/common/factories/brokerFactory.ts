import config from 'config';
import { MessageProducerBroker } from '../types/broker';
import { KafkaProducerBroker } from '../../config/kafka';
import { configENV } from '../../config/config';

let messageProducer: MessageProducerBroker | null = null;

export const createMessageProducerBroker = (): MessageProducerBroker => {
  // making singletone
  if (!messageProducer) {
    messageProducer = new KafkaProducerBroker('catalog-service', [
      configENV.broker,
    ]);
  }

  return messageProducer;
};
