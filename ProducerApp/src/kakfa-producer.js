import { kafka } from "./kafka-client.js";

async function createUpdates(topic, key, value) {
    const producer = kafka.producer();

    // console.log("Connecting Producer");
    await producer.connect();
    // console.log("Producer Connected Successfully");

    await producer.send({
        topic,
        messages: [
            {
                partition: Math.floor(Math.random() * 2),
                key,
                value: JSON.stringify(value),
            },
        ],
    });
    await producer.disconnect();
}

export {
    createUpdates
}