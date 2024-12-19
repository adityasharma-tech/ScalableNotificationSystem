import dotenv from "dotenv"
dotenv.config({
  path: "./.env"
})
import {neon} from "@neondatabase/serverless"
import { kafka } from "./kafka-admin.js";

const sql = neon(process.env.DATABASE_URL);

async function init() {
  const consumer = kafka.consumer({groupId: "0"});
  await consumer.connect();

  await consumer.subscribe({ topics: ["transactional_notify"], fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log(
        `[${topic}]: PART:${partition}:`,
        message.value.toString()
      );

      const parsedMessage = JSON.parse(message.value)
      const {from, to, notification_pref: notificationPref, important, data} = parsedMessage

      let dataToQueue;
      
      const fromUsr = await sql`SELECT * FROM users WHERE username = ${from}`;
      const toUsr = await sql`SELECT * FROM users WHERE username = ${to}`
      if(fromUsr.length === 0 || toUsr.length === 0) return;

      if(!important && toUsr[0].online == true){
        dataToQueue = {
          providers: [{
            provider: "in-app",
            meta: fromUsr[0].fcm_token
          }],
          data
        }
      } else {
        dataToQueue = {
          providers: getProviders(fromUsr[0], notificationPref),
          data
        }
      }

      console.log("Result: ")
      console.log(dataToQueue)
    },
  });
}

function getProviders(fromUsr, notificationPref){
  let metadata = []
  notificationPref.forEach(element => {
    if(element=="whatsapp"||element == "sms"){
      metadata.push({
        provider: element,
        meta: fromUsr.phone_number
      })
    } else if(element == "email"){
      metadata.push({
        provider: element,
        meta: fromUsr.email
      })
    } else if (element == "in-app"){
      metadata.push({
        provider: element,
        meta: fromUsr.fcm_token
      })
    }
  });
  return metadata
}

init()