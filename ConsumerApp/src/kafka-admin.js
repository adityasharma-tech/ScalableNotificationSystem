import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "notification-system",
  brokers: [`127.0.0.1:9092`]
});