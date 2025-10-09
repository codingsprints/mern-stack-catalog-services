import { Kafka, KafkaConfig, Producer } from 'kafkajs';
import { MessageProducerBroker } from '../common/types/broker';
import { configENV } from './config';
import { NODE_ENV_VAL } from '../common/constants/constants';

export class KafkaProducerBroker implements MessageProducerBroker {
  private producer: Producer;

  constructor(clientId: string, brokers: string[]) {
    let kafkaConfig: KafkaConfig = {
      clientId,
      brokers,
    };

    if (configENV.nodeEnv === NODE_ENV_VAL.PRODUCTION) {
      kafkaConfig = {
        ...kafkaConfig,
        ssl: configENV.kafkaSSL,
        connectionTimeout: 45000,
        sasl: {
          mechanism: 'plain',
          username: configENV.kafkaUserName,
          password: configENV.kafkaPassword,
        },
      };
    }

    const kafka = new Kafka(kafkaConfig);
    this.producer = kafka.producer();
  }

  /**
   * Connect the producer
   */
  async connect() {
    await this.producer.connect();
  }

  /**
   * Disconnect the producer
   */
  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  /**
   *
   * @param topic - the topic to send the message to
   * @param message - The message to send
   * @throws {Error} - When the producer is not connected
   */
  async sendMessage(topic: string, message: string) {
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
  }
}
