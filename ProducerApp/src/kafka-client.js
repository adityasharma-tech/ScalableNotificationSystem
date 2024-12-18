import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "notification-system",
  brokers: [`192.168.99.116:9092`],
});