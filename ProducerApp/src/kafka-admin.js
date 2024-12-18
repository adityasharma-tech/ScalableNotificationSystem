import { kafka } from "./kafka-client.js";

async function createTopics(topicname) {
  const admin = kafka.admin();
  console.log("Admin connecting...");
  admin.connect();
  console.log("Adming Connection Success...");

  console.log(`Creating Topic [${topicname}]`);
  await admin.createTopics({
    topics: [
      {
        topic: topicname,
        numPartitions: 2,
      },
    ],
  });
  console.log(`Topic Created Success [${topicname}]`);

  console.log("Disconnecting Admin..");
  await admin.disconnect();
}

export {
    createTopics
}
